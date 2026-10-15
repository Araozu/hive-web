<script lang="ts">
    import { cn } from "#lib/utils.js";
    import type { SessionResponse, WorkspaceResponse } from "#lib/api/types.js";
    import {
        displayTitle,
        isSessionUnread,
        modelLabel,
        sessionWorkspaceId,
        resolveWorkspaceFull,
        resolveWorkspaceName,
    } from "#lib/hive/threads.js";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";

    let {
        session,
        active = false,
        workspace = null,
        onSelect,
        onRenameWorkspace,
    }: {
        session: SessionResponse;
        active?: boolean;
        workspace?: WorkspaceResponse | null;
        onSelect?: (session: SessionResponse) => void;
        onRenameWorkspace?: (info: {
            workspaceId: string;
            currentName: string;
            session: SessionResponse;
        }) => void;
    } = $props();

    let title = $derived(displayTitle(session));
    let workspaceDisplayName = $derived(resolveWorkspaceName(session, workspace));
    let workspaceFull = $derived(resolveWorkspaceFull(session, workspace));
    let model = $derived(modelLabel(session));
    let unread = $derived(isSessionUnread(session));
    let workspaceId = $derived(sessionWorkspaceId(session));
    let canRenameWorkspace = $derived(
        workspace !== null &&
            !workspace.is_default &&
            !["removing", "removed"].includes(workspace.status),
    );
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <button
            type="button"
            onclick={() => onSelect?.(session)}
            aria-current={active ? "true" : undefined}
            class={cn(
                "border-b border-border",
                "flex w-full max-w-full min-w-0 cursor-pointer flex-col items-start gap-2 overflow-hidden  p-4 text-start text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
        >
            <div class="flex w-full max-w-full min-w-0 items-center gap-2">
                {#if unread && !active}
                    <span class="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread">
                    </span>
                {/if}
                <span
                    class={cn("min-w-0 flex-1 truncate", unread && "font-semibold")}
                    title={workspaceFull}
                >
                    {workspaceDisplayName}
                </span>
                <!-- demo/placeholder - leave here -->
                <span class="ms-auto shrink-0 text-xs opacity-70">@</span>
            </div>
            <span
                class={cn(
                    "w-full max-w-full min-w-0 truncate font-medium",
                    unread && "font-semibold",
                )}
            >
                {title}
            </span>
            <span
                class="line-clamp-2 w-full max-w-full min-w-0 overflow-hidden text-xs break-words whitespace-normal opacity-70"
            >
                {model} · seq {session.last_event_sequence}
            </span>
        </button>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        {#if canRenameWorkspace}
            <ContextMenu.Item
                onclick={() =>
                    onRenameWorkspace?.({
                        workspaceId,
                        currentName: workspaceDisplayName,
                        session,
                    })}
            >
                Rename workspace…
            </ContextMenu.Item>
        {:else}
            <ContextMenu.Item disabled>
                {workspace?.is_default ? "No workspace to rename" : "Workspace unavailable"}
            </ContextMenu.Item>
        {/if}
    </ContextMenu.Content>
</ContextMenu.Root>
