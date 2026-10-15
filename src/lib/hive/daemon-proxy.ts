// Server only. The browser never receives the daemon's local API token.
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { Plugin } from "vite";
const id = "[A-Za-z0-9_.-]+";
const routes: [string, string][] = [
    ["GET", "filesystem"],
    ["POST", "filesystem/directories|workspaces/create"],
    ["GET", "health|node|capabilities|models|providers"],
    ["GET|POST", "sessions|workspaces|tasks|batches"],
    ["GET|PATCH", `sessions/${id}`],
    ["GET", `sessions/${id}/(?:messages|instructions|events)`],
    ["POST", `sessions/${id}/(?:messages|inbox|fork)`],
    ["DELETE|PATCH", `sessions/${id}/messages/${id}`],
    ["GET", "drafts"],
    ["PUT|DELETE", `drafts/${id}`],
    ["GET", `turns/${id}(?:/(?:requests|tools))?`],
    ["POST", `turns/${id}/(?:pause|resume|cancel)`],
    ["GET", `messages/${id}|tools/${id}|artifacts/${id}(?:/content)?`],
    ["GET", `workspaces/${id}(?:/(?:diff|events))?`],
    ["POST", `workspaces/${id}/(?:remove|rename|worktrees)`],
    ["GET", `tasks/${id}(?:/(?:runs|events))?|runs/${id}(?:/result)?`],
    ["GET|POST", `runs/${id}/children`],
    ["POST", `tasks/${id}/instructions|runs/${id}/(?:pause|resume|cancel|retry|wait)`],
    ["GET", `batches/${id}(?:/(?:members|results))?`],
    ["POST", `batches/preview|batches/${id}/(?:retry|cancel)`],
    ["GET", `providers/${id}/models|providers/codex/accounts|providers/codex/login/${id}`],
    ["PUT|DELETE", `providers/${id}/api-key`],
    ["PUT", "providers/codex/auth"],
    ["POST", `providers/codex/login|providers/codex/accounts/${id}/logout`],
].map(([method, path]) => [method, `^/v1/(?:${path})$`]);
export function daemonProxy(): Plugin {
    const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith("/api/daemon/")) return next();
        const reply = (status: number, message: string) => {
            if (res.headersSent) {
                res.destroy();
                return;
            }
            res.writeHead(status, {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
            });
            res.end(JSON.stringify({ message }));
        };
        const origin = req.headers.origin;
        if (origin) {
            try {
                if (new URL(origin).host !== req.headers.host)
                    return reply(403, "Cross-origin daemon access is not allowed.");
            } catch {
                return reply(403, "Invalid request origin.");
            }
        }
        if (req.headers["sec-fetch-site"] === "cross-site")
            return reply(403, "Cross-site daemon access is not allowed.");
        const path = req.url.slice("/api/daemon".length);
        const route = path.split("?")[0];
        const matching = routes.filter(([, pattern]) => new RegExp(pattern).test(route));
        if (!matching.length) return reply(404, "Unsupported daemon route.");
        if (!matching.some(([method]) => new RegExp(`^(?:${method})$`).test(req.method ?? "")))
            return reply(405, "Unsupported method.");
        const controller = new AbortController();
        res.on("close", () => controller.abort());
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
            const endpoint = new URL(process.env.SLOP_DAEMON_URL ?? "http://127.0.0.1:7331");
            if (
                endpoint.protocol !== "http:" ||
                !["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname) ||
                endpoint.username ||
                endpoint.password ||
                endpoint.search ||
                endpoint.hash ||
                endpoint.pathname !== "/"
            )
                return reply(500, "The local bridge requires a loopback HTTP daemon origin.");
            const tokenPath =
                process.env.SLOP_TOKEN_FILE ??
                join(
                    process.env.XDG_DATA_HOME ?? join(homedir(), ".local/share"),
                    "slopconductor/credentials/local-api-token",
                );
            const token = route === "/v1/health" ? "" : (await readFile(tokenPath, "utf8")).trim();
            const chunks: Buffer[] = [];
            let length = 0;
            for await (const chunk of req) {
                const buffer = Buffer.from(chunk);
                length += buffer.length;
                if (length > 1024 * 1024) return reply(413, "Request is too large.");
                chunks.push(buffer);
            }
            timer = setTimeout(() => controller.abort(), 15000);
            const response = await fetch(new URL(path, endpoint), {
                method: req.method,
                redirect: "error",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    "Content-Type": "application/json",
                },
                body: ["POST", "PUT", "PATCH"].includes(req.method ?? "")
                    ? Buffer.concat(chunks)
                    : undefined,
                signal: controller.signal,
            });
            // Streaming events must outlive the initial request timeout.
            if (response.headers.get("content-type")?.includes("ndjson")) clearTimeout(timer);
            const content = response.headers.get("content-type") ?? "application/octet-stream";
            res.writeHead(response.status, {
                "Content-Type": content,
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
                ...(route.endsWith("/content") ? { "Content-Disposition": "attachment" } : {}),
            });
            if (response.body) {
                const stream = Readable.fromWeb(
                    response.body as Parameters<typeof Readable.fromWeb>[0],
                );
                stream.on("error", () => res.destroy());
                stream.on("end", () => clearTimeout(timer));
                stream.pipe(res);
            } else {
                clearTimeout(timer);
                res.end();
            }
        } catch {
            clearTimeout(timer);
            if (!res.destroyed)
                reply(
                    503,
                    "Cannot reach the local daemon. Start slopd and check SLOP_DAEMON_URL and SLOP_TOKEN_FILE on the web server.",
                );
        }
    };
    return {
        name: "hive-local-daemon",
        configureServer(server) {
            server.middlewares.use(middleware);
        },
        configurePreviewServer(server) {
            server.middlewares.use(middleware);
        },
    };
}
