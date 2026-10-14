<script lang="ts">
    import { onMount } from "svelte";
    import * as Breadcrumb from "#lib/components/ui/breadcrumb/index.js";
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Separator } from "#lib/components/ui/separator/index.js";
    import AppSidebar from "#lib/components/app-sidebar/app-sidebar.svelte";
    import { navMain, type NavItem } from "#lib/components/app-sidebar/navigation.js";
    import MailList from "#lib/components/mail/mail-list.svelte";
    import MailView from "#lib/components/mail/mail-view.svelte";
    import { fetchThreads, mailsForFolder, type DaemonSession } from "#lib/hive/threads.js";
    import type { Mail } from "#lib/components/mail/data.js";

    // The detail pane is intentionally static. Only the list below talks to the daemon.
    const previewMail: Mail = {
        id: "preview-fixed",
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Preview — detail pane is static",
        date: "09:34 AM",
        teaser: "This preview stays fixed while the list shows live daemon threads.",
        body: "Hi there,\n\nThis detail pane is a fixed preview. It keeps the existing email layout, but it is not wired to daemon data.\n\nThe thread list on the left is the only view connected to slop-daemon (GET /v1/sessions). Select any thread to highlight it — this message stays put.\n\nBest,\nAda",
        unread: false,
        replies: [
            {
                name: "Grace Hopper",
                email: "grace@example.com",
                date: "10:02 AM",
                body: "Noted — keeping the detail static makes it easy to work on the list wiring without chasing message history.",
            },
        ],
    };

    let threads = $state<DaemonSession[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let selectedMail = $state<Mail | null>(null);
    let activeItem = $state<NavItem>(navMain[0]);

    let mails = $derived(mailsForFolder(activeItem.title, threads));

    async function loadThreads() {
        loading = true;
        error = null;
        try {
            const sessions = await fetchThreads();
            threads = sessions;
            const visible = mailsForFolder(activeItem.title, sessions);
            selectedMail = visible[0] ?? null;
        } catch (e) {
            error =
                e instanceof Error
                    ? `Could not load threads. ${e.message}`
                    : "Could not load threads.";
        } finally {
            loading = false;
        }
    }

    function handleSelectFolder(item: NavItem) {
        activeItem = item;
        const visible = mailsForFolder(item.title, threads);
        selectedMail = visible[0] ?? null;
    }

    function handleSelectMail(mail: Mail | null) {
        // Highlight-only: the detail pane stays on the fixed preview.
        selectedMail = mail;
    }

    onMount(() => {
        void loadThreads();
    });
</script>

<Sidebar.Provider style="--sidebar-width: 350px;">
    <AppSidebar activeTitle={activeItem.title} onSelectFolder={handleSelectFolder}>
        <!-- Mail list panel -->
        <Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
            <MailList
                title={activeItem.title}
                {mails}
                {loading}
                {error}
                selectedEmail={selectedMail?.id ?? selectedMail?.email ?? null}
                onSelect={handleSelectMail}
                onRetry={() => void loadThreads()}
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
                    <Breadcrumb.Separator class="hidden md:block" />
                    <Breadcrumb.Item class="hidden md:block">
                        <Breadcrumb.Page>{previewMail.subject}</Breadcrumb.Page>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </header>
        <div class="flex flex-1 flex-col">
            <MailView mail={previewMail} folder={activeItem.title} />
        </div>
    </Sidebar.Inset>
</Sidebar.Provider>
