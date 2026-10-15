import { queryOptions } from "@tanstack/svelte-query";
import { fetchAllSessions } from "./client.js";

// TanStack Query using the generated OpenAPI types.
export function sessionsQueryOptions() {
    return queryOptions({
        queryKey: ["sessions"],
        queryFn: ({ signal }) => fetchAllSessions(signal),
        staleTime: 5_000,
    });
}
