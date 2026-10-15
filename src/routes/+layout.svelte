<script lang="ts">
    import "./layout.css";
    import favicon from "#lib/assets/favicon.svg";
    import { ModeWatcher } from "mode-watcher";
    import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
    import type { LayoutProps } from "./$types";

    let { children }: LayoutProps = $props();

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    });
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<QueryClientProvider client={queryClient}>
    {@render children()}
</QueryClientProvider>
