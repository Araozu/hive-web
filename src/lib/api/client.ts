import createClient from "openapi-fetch";
import type { paths } from "./openapi.js";
import type {
    CommandReceipt,
    RenameSessionRequest,
    RenameWorkspaceRequest,
    SessionPage,
    SessionResponse,
    WorkspaceResponse,
} from "./types.js";

export type { SessionResponse, WorkspaceResponse };

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

async function fetchSessionPage(after: number | null, signal?: AbortSignal): Promise<SessionPage> {
    const { data, error, response } = await daemonClient.GET("/v1/sessions", {
        params: {
            query: {
                limit: 200,
                ...(after === null ? {} : { after }),
            },
        },
        signal,
    });

    if (data) return data;
    if (response.ok)
        throw new DaemonError("Daemon returned an empty session page.", response.status);
    throw new DaemonError(daemonErrorMessage(response.status, error), response.status);
}

/** The inbox list is the only view wired to the daemon. */
export async function fetchAllSessions(signal?: AbortSignal): Promise<SessionResponse[]> {
    const items: SessionResponse[] = [];
    let after: number | null = null;
    do {
        const batch = await fetchSessionPage(after, signal);
        items.push(...batch.items);
        const next = batch.next_after ?? null;
        if (next !== null && next <= (after ?? 0))
            throw new DaemonError("Daemon returned a non-advancing session cursor.", 200);
        after = next;
    } while (after !== null);
    return items;
}

export async function fetchWorkspace(id: string, signal?: AbortSignal): Promise<WorkspaceResponse> {
    const { data, error, response } = await daemonClient.GET("/v1/workspaces/{id}", {
        params: { path: { id } },
        signal,
    });
    if (data) return data;
    throw new DaemonError(daemonErrorMessage(response.status, error), response.status);
}

/** Rename a workspace. Core validates: trimmed 1-128 chars, no control chars.
 * The built-in `default` workspace cannot be renamed. */
export async function renameWorkspace(
    id: string,
    request: RenameWorkspaceRequest,
    signal?: AbortSignal,
): Promise<WorkspaceResponse> {
    const { data, error, response } = await daemonClient.POST("/v1/workspaces/{id}/rename", {
        params: { path: { id } },
        body: request,
        signal,
    });
    if (data) return data;
    throw new DaemonError(daemonErrorMessage(response.status, error), response.status);
}

/** Rename a thread. Core validates: trimmed 1-256 chars, no control chars.
 * PATCH /v1/sessions/{session_id} with RenameSessionRequest. */
export async function renameSession(
    id: string,
    request: RenameSessionRequest,
    signal?: AbortSignal,
): Promise<CommandReceipt> {
    const { data, error, response } = await daemonClient.PATCH("/v1/sessions/{session_id}", {
        params: { path: { session_id: id } },
        body: request,
        signal,
    });
    if (data) return data;
    throw new DaemonError(daemonErrorMessage(response.status, error), response.status);
}
