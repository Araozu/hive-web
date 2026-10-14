<script lang="ts">
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import type { ComponentProps } from "svelte";
    import AppBrand from "./app-brand.svelte";
    import MailList from "./mail-list.svelte";
    import NavMain from "./nav-main.svelte";
    import NavUser from "./nav-user.svelte";
    import { mails as initialMails, navMain, user, type NavItem } from "./data.js";

    let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

    let activeItem = $state<NavItem>(navMain[0]);
    let mails = $state(initialMails);

    function handleSelect(item: NavItem) {
        activeItem = item;
        // Demo behavior from sidebar-09: shuffle mails on folder change.
        // Replace with real filtering when folders are wired up.
        const shuffled = [...initialMails].sort(() => Math.random() - 0.5);
        mails = shuffled.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1));
    }
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
            <NavMain items={navMain} activeTitle={activeItem.title} onSelect={handleSelect} />
        </Sidebar.Content>
        <Sidebar.Footer>
            <NavUser {user} />
        </Sidebar.Footer>
    </Sidebar.Root>

    <!-- Mail list panel -->
    <Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
        <MailList title={activeItem.title} {mails} />
    </Sidebar.Root>
</Sidebar.Root>
