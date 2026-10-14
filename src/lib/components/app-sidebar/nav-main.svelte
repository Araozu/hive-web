<script lang="ts">
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { useSidebar } from "#lib/components/ui/sidebar/context.svelte.js";
    import type { NavItem } from "./data.js";

    let {
        items,
        activeTitle,
        onSelect,
    }: {
        items: NavItem[];
        activeTitle: string;
        onSelect?: (item: NavItem) => void;
    } = $props();

    const sidebar = useSidebar();
</script>

<Sidebar.Group>
    <Sidebar.GroupContent class="px-1.5 md:px-0">
        <Sidebar.Menu>
            {#each items as item (item.title)}
                <Sidebar.MenuItem>
                    <Sidebar.MenuButton
                        tooltipContentProps={{
                            hidden: false,
                        }}
                        onclick={() => {
                            onSelect?.(item);
                            sidebar.setOpen(true);
                        }}
                        isActive={activeTitle === item.title}
                        class="px-2.5 md:px-2"
                    >
                        {#snippet tooltipContent()}
                            {item.title}
                        {/snippet}
                        <item.icon />
                        <span>{item.title}</span>
                    </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            {/each}
        </Sidebar.Menu>
    </Sidebar.GroupContent>
</Sidebar.Group>
