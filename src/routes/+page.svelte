<script lang="ts">
    import { onMount } from "svelte";
    import * as Breadcrumb from "#lib/components/ui/breadcrumb/index.js";
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Separator } from "#lib/components/ui/separator/index.js";
    import AppSidebar from "#lib/components/app-sidebar/app-sidebar.svelte";
    import { navMain, type NavItem } from "#lib/components/app-sidebar/navigation.js";
    import MailList from "#lib/components/mail/mail-list.svelte";
    import MailView from "#lib/components/mail/mail-view.svelte";
    import { mails as initialMails, type Mail } from "#lib/components/mail/data.js";

    let mails = $state<Mail[]>(initialMails);
    let selectedMail = $state<Mail | null>(null);
    let activeItem = $state<NavItem>(navMain[0]);

    function handleSelectFolder(item: NavItem) {
        activeItem = item;
        // Demo behavior: shuffle mails on folder change.
        // Replace with real filtering when folders are wired up.
        const shuffled = [...initialMails].sort(() => Math.random() - 0.5);
        const next = shuffled.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1));
        mails = next;
        handleSelectMail(next[0] ?? null);
    }

    function handleSelectMail(mail: Mail | null) {
        if (!mail) {
            selectedMail = null;
            return;
        }
        mails = mails.map((m) => (m.email === mail.email ? { ...m, unread: false } : m));
        selectedMail = mails.find((m) => m.email === mail.email) ?? mail;
    }

    onMount(() => {
        if (mails.length > 0) handleSelectMail(mails[0]);
    });
</script>

<Sidebar.Provider style="--sidebar-width: 350px;">
    <AppSidebar activeTitle={activeItem.title} onSelectFolder={handleSelectFolder}>
        <!-- Mail list panel -->
        <Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
            <MailList
                title={activeItem.title}
                {mails}
                selectedEmail={selectedMail?.email ?? null}
                onSelect={handleSelectMail}
            />
        </Sidebar.Root>
    </AppSidebar>
    <Sidebar.Inset>
        <header class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
            <Sidebar.Trigger class="-ms-1" />
            <Separator
                orientation="vertical"
                class="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb.Root>
                <Breadcrumb.List>
                    <Breadcrumb.Item class="hidden md:block">
                        <Breadcrumb.Link href="##">All Inboxes</Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator class="hidden md:block" />
                    <Breadcrumb.Item>
                        <Breadcrumb.Page>{activeItem.title}</Breadcrumb.Page>
                    </Breadcrumb.Item>
                    {#if selectedMail}
                        <Breadcrumb.Separator class="hidden md:block" />
                        <Breadcrumb.Item class="hidden md:block">
                            <Breadcrumb.Page>{selectedMail.subject}</Breadcrumb.Page>
                        </Breadcrumb.Item>
                    {/if}
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </header>
        <div class="flex flex-1 flex-col">
            <MailView mail={selectedMail} folder={activeItem.title} />
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
