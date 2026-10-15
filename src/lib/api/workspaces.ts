import { queryOptions } from "@tanstack/svelte-query";
import { DaemonError, fetchWorkspace } from "./client.js";
import type { WorkspaceResponse } from "./types.js";

function isTransientError(error: Error): boolean {
    return (
        !(error instanceof DaemonError) ||
        error.status === 408 ||
        error.status === 429 ||
        error.status >= 500
    );
}

export function workspaceQueryOptions(id: string) {
    return queryOptions({
        queryKey: ["daemon", "workspaces", id],
        queryFn: ({ signal }) => fetchWorkspace(id, signal),
        staleTime: 30_000,
        retry: (failureCount, error) => failureCount < 1 && isTransientError(error),
    });
}

/**
 * Batch-resolve the distinct workspace ids referenced by the visible sessions.
 * Missing workspaces resolve to null so one
 * bad id never fails the whole list. Returns a Map<workspaceId, WorkspaceResponse>.
 */
export function sessionWorkspacesQueryOptions(workspaceIds: string[]) {
    const ids = [...new Set(workspaceIds.filter(Boolean))].sort();
    return queryOptions({
        queryKey: ["daemon", "workspaces", "by-ids", ids.join(",")],
        queryFn: async ({ signal }): Promise<Map<string, WorkspaceResponse>> => {
            const entries = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const workspace = await fetchWorkspace(id, signal);
                        return [id, workspace] as const;
                    } catch (error) {
                        if (error instanceof DaemonError && error.status === 404) return null;
                        throw error;
                    }
                }),
            );
            const map = new Map<string, WorkspaceResponse>();
            for (const entry of entries) {
                if (entry) map.set(entry[0], entry[1]);
            }
            return map;
        },
        enabled: ids.length > 0,
        staleTime: 15_000,
        refetchInterval: 15_000,
        retry: (failureCount, error) => failureCount < 1 && isTransientError(error),
    });
}
