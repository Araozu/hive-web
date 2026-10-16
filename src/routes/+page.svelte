<script lang="ts">
    import * as Breadcrumb from "#lib/components/ui/breadcrumb/index.js";
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Separator } from "#lib/components/ui/separator/index.js";
    import AppSidebar from "#lib/components/app-sidebar/app-sidebar.svelte";
    import { navMain, type NavItem } from "#lib/components/app-sidebar/navigation.js";
    import MailList from "#lib/components/mail/mail-list.svelte";
    import MailView from "#lib/components/mail/mail-view.svelte";
    import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
    import { sessionsQueryOptions } from "#lib/api/sessions.js";
    import { sessionWorkspacesQueryOptions } from "#lib/api/workspaces.js";
    import { renameSession, renameWorkspace } from "#lib/api/client.js";
    import type { SessionResponse } from "#lib/api/types.js";
    import { sessionsForFolder, sessionKey, sessionWorkspaceId } from "#lib/hive/threads.js";
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

    let activeItem = $state<NavItem>(navMain[0]);
    let selectedSession = $state<SessionResponse | null>(null);

    const queryClient = useQueryClient();

    // Generated OpenAPI types flow through TanStack Query.
    const sessionsQuery = createQuery(() => sessionsQueryOptions());

    let allSessions = $derived(sessionsQuery.data ?? []);
    let visibleSessions = $derived(sessionsForFolder(activeItem.title, allSessions));

    // Proper workspace names come from WorkspaceResponse.name (core rename API).
    // Every session selects a workspace, including the built-in `default`.
    let workspaceIds = $derived(
        allSessions
            .map((session) => sessionWorkspaceId(session))
            .filter((id): id is string => Boolean(id)),
    );
    const workspacesQuery = createQuery(() => sessionWorkspacesQueryOptions(workspaceIds));
    let workspacesById = $derived(workspacesQuery.data ?? null);

    const renameMutation = createMutation(() => ({
        mutationFn: ({ workspaceId, name }: { workspaceId: string; name: string }) =>
            renameWorkspace(workspaceId, { command_id: crypto.randomUUID(), name }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["daemon", "workspaces"] });
        },
    }));

    const renameSessionMutation = createMutation(() => ({
        mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
            renameSession(sessionId, { command_id: crypto.randomUUID(), title }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["daemon", "sessions"] });
        },
    }));

    // Keep a highlight when the folder or data changes.
    $effect(() => {
        const visible = visibleSessions;
        if (!visible.length) {
            selectedSession = null;
            return;
        }
        if (
            !selectedSession ||
            !visible.some((s) => sessionKey(s) === sessionKey(selectedSession!))
        ) {
            selectedSession = visible[0];
        }
    });

    function handleSelectFolder(item: NavItem) {
        activeItem = item;
        const visible = sessionsForFolder(item.title, allSessions);
        selectedSession = visible[0] ?? null;
    }

    function handleSelectSession(session: SessionResponse | null) {
        // Highlight-only: the detail pane stays on the fixed preview.
        selectedSession = session;
    }

    function handleRenameWorkspace(info: { workspaceId: string; currentName: string }) {
        // Unified workspaces: POST /v1/workspaces/{id}/rename. The built-in
        // `default` workspace cannot be renamed (disabled in the list item).
        const next = window.prompt("Rename workspace", info.currentName)?.trim() ?? null;
        if (next === null) return;
        if (!next || next.length > 128 || [...next].some((ch) => ch < " ")) {
            window.alert("Name must be 1-128 characters with no control characters.");
            return;
        }
        if (next === info.currentName) return;
        renameMutation.mutate(
            { workspaceId: info.workspaceId, name: next },
            {
                onError: (error) => window.alert(error.message),
            },
        );
    }

    function handleRenameSession(info: { sessionId: string; currentTitle: string }) {
        // Durable title rename: PATCH /v1/sessions/{session_id}. Core validates
        // trimmed 1-256 chars, no control chars.
        const next = window.prompt("Rename thread", info.currentTitle)?.trim() ?? null;
        if (next === null) return;
        if (!next || next.length > 256 || [...next].some((ch) => ch < " ")) {
            window.alert("Title must be 1-256 characters with no control characters.");
            return;
        }
        if (next === info.currentTitle.trim()) return;
        renameSessionMutation.mutate(
            { sessionId: info.sessionId, title: next },
            {
                onError: (error) => window.alert(error.message),
            },
        );
    }
</script>

<Sidebar.Provider style="--sidebar-width: 350px;">
    <AppSidebar activeTitle={activeItem.title} onSelectFolder={handleSelectFolder}>
        <!-- Session list panel -->
        <Sidebar.Root collapsible="none" class="hidden w-auto min-w-0 flex-1 md:flex">
            <MailList
                title={activeItem.title}
                sessions={visibleSessions}
                {workspacesById}
                loading={sessionsQuery.isPending}
                refreshing={sessionsQuery.isFetching}
                error={sessionsQuery.error?.message ?? null}
                selectedId={selectedSession ? sessionKey(selectedSession) : null}
                onSelect={handleSelectSession}
                onRetry={() => void sessionsQuery.refetch()}
                onRenameWorkspace={handleRenameWorkspace}
                onRenameSession={handleRenameSession}
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
