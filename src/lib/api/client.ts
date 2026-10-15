import createClient from "openapi-fetch";
import type { paths } from "./openapi.js";
import type { SessionResponse } from "./types.js";

export type { SessionResponse };

export class DaemonError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

function daemonErrorMessage(status: number, payload: unknown): string {
    if (payload && typeof payload === "object" && ("message" in payload || "error" in payload)) {
        const record = payload as Record<string, unknown>;
        const nested =
            record["error"] && typeof record["error"] === "object"
                ? (record["error"] as Record<string, unknown>)["message"]
                : undefined;
        const message = record["message"] ?? nested;
        if (typeof message === "string" && message.trim()) return message;
    }
    if (status === 404)
        return "This daemon does not support this endpoint. Restart the updated daemon.";
    return `Daemon request failed (${status}).`;
}

// Typed wire client. Browser hits the local vite proxy at /api/daemon,
// which injects the bearer token server-side (see daemon-proxy.ts).
export const daemonClient = createClient<paths>({
    baseUrl: "/api/daemon",
});

async function fetchSessionPage(
    after: number | null,
    signal?: AbortSignal,
): Promise<{ items: SessionResponse[]; next_after: number | null }> {
    const { data, error, response } = await daemonClient.GET("/v1/sessions", {
        params: {
            query: {
                limit: 200,
                ...(after === null ? {} : { after }),
            },
        },
        signal,
    });

    if (data) return { items: data.items, next_after: data.next_after ?? null };
    throw new DaemonError(daemonErrorMessage(response.status, error), response.status);
}

/** The inbox list is the only view wired to the daemon. */
export async function fetchAllSessions(signal?: AbortSignal): Promise<SessionResponse[]> {
    const items: SessionResponse[] = [];
    let after: number | null = null;
    do {
        const batch = await fetchSessionPage(after, signal);
        items.push(...batch.items);
        after = batch.next_after;
    } while (after !== null);
    return items;
}
