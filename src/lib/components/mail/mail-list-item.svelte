<script lang="ts">
    import { cn } from "#lib/utils.js";
    import {
        FolderDashedIcon,
        FolderSimpleIcon,
        LockSimpleIcon,
        PencilSimpleIcon,
    } from "phosphor-svelte";
    import type { SessionResponse } from "#lib/api/types.js";
    import {
        displayTitle,
        isDefaultWorkspaceId,
        isSessionUnread,
        modelLabel,
        sessionWorkspaceId,
        workspaceLabel,
        workspaceName,
    } from "#lib/hive/threads.js";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";

    let {
        session,
        active = false,
        workspaceDisplayName = null,
        workspaceTooltip = null,
        onSelect,
        onRenameWorkspace,
        onRenameSession,
    }: {
        session: SessionResponse;
        active?: boolean;
        workspaceDisplayName?: string | null;
        workspaceTooltip?: string | null;
        onSelect?: (session: SessionResponse) => void;
        onRenameWorkspace?: (info: {
            workspaceId: string;
            currentName: string;
            session: SessionResponse;
        }) => void;
        onRenameSession?: (info: {
            sessionId: string;
            currentTitle: string;
            session: SessionResponse;
        }) => void;
    } = $props();

    let title = $derived(displayTitle(session));
    let fallbackWorkspace = $derived(workspaceName(session));
    let fallbackFull = $derived(workspaceLabel(session));
    let workspace = $derived(workspaceDisplayName?.trim() || fallbackWorkspace);
    let workspaceFull = $derived(workspaceTooltip?.trim() || fallbackFull);
    let model = $derived(modelLabel(session));
    let unread = $derived(isSessionUnread(session));
    let workspaceId = $derived(sessionWorkspaceId(session));
    // Unified workspaces: every session selects a workspace, including the
    // built-in `default` ("No workspace") which cannot be renamed or removed.
    let isDefaultWorkspace = $derived(!workspaceId || isDefaultWorkspaceId(workspaceId));
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
                    {workspace}
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
        <ContextMenu.Item
            onclick={() =>
                onRenameSession?.({
                    sessionId: session.id,
                    currentTitle: session.title?.trim() ?? "",
                    session,
                })}
        >
            <PencilSimpleIcon />
            Rename thread…
        </ContextMenu.Item>
        <ContextMenu.Separator />
        {#if workspaceId && !isDefaultWorkspace}
            <ContextMenu.Item
                onclick={() =>
                    onRenameWorkspace?.({
                        workspaceId: workspaceId!,
                        currentName: workspace,
                        session,
                    })}
            >
                <FolderSimpleIcon />
                Rename workspace…
            </ContextMenu.Item>
        {:else if isDefaultWorkspace}
            <ContextMenu.Item
                disabled
                title="Threads without a directory use the built-in default workspace."
            >
                <LockSimpleIcon />
                Default workspace cannot be renamed
            </ContextMenu.Item>
        {:else}
            <ContextMenu.Item disabled>
                <FolderDashedIcon />
                No workspace to rename
            </ContextMenu.Item>
        {/if}
    </ContextMenu.Content>
</ContextMenu.Root>
