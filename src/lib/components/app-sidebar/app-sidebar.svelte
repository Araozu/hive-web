<script lang="ts">
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import type { ComponentProps } from "svelte";
    import type { Snippet } from "svelte";
    import AppBrand from "./app-brand.svelte";
    import NavMain from "./nav-main.svelte";
    import NavUser from "./nav-user.svelte";
    import { navMain, user, type NavItem } from "./navigation.js";

    let {
        ref = $bindable(null),
        activeTitle = navMain[0].title,
        onSelectFolder,
        children,
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> & {
        activeTitle?: string;
        onSelectFolder?: (item: NavItem) => void;
        children?: Snippet;
    } = $props();
</script>

<Sidebar.Root
    bind:ref
    collapsible="icon"
    class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
    {...restProps}
>
    <!-- Icon rail -->
    <Sidebar.Root collapsible="none" class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-e">
        <Sidebar.Header>
            <AppBrand />
        </Sidebar.Header>
        <Sidebar.Content>
            <NavMain items={navMain} {activeTitle} onSelect={onSelectFolder} />
        </Sidebar.Content>
        <Sidebar.Footer>
            <NavUser {user} />
        </Sidebar.Footer>
    </Sidebar.Root>

    {@render children?.()}
</Sidebar.Root>
