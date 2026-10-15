import { queryOptions } from "@tanstack/svelte-query";
import { DaemonError, fetchAllSessions } from "./client.js";

function isTransientError(error: Error): boolean {
    return (
        !(error instanceof DaemonError) ||
        error.status === 408 ||
        error.status === 429 ||
        error.status >= 500
    );
}

// TanStack Query using the generated OpenAPI types.
export function sessionsQueryOptions() {
    return queryOptions({
        queryKey: ["daemon", "sessions"],
        queryFn: ({ signal }) => fetchAllSessions(signal),
        staleTime: 5_000,
        // Sessions can change outside this app; staleTime alone does not refresh them.
        refetchInterval: (query) =>
            query.state.error && !isTransientError(query.state.error) ? false : 5_000,
        retry: (failureCount, error) => failureCount < 1 && isTransientError(error),
    });
}
