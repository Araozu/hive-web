<script lang="ts">
    import { cn } from "#lib/utils.js";
    import {
        CheckIcon,
        CircleNotchIcon,
        FolderDashedIcon,
        FolderSimpleIcon,
        LockSimpleIcon,
        PencilSimpleIcon,
    } from "phosphor-svelte";
    import type { SessionResponse } from "#lib/api/types.js";
    import {
        displayTitle,
        formatLastInteraction,
        isDefaultWorkspaceId,
        isSessionArchived,
        isSessionUnread,
        modelLabel,
        sessionLastInteractionMs,
        sessionWorkspaceId,
        workspaceLabel,
        workspaceName,
    } from "#lib/hive/threads.js";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";
    import { Badge } from "#lib/components/ui/badge/index.js";
    import { Button } from "#lib/components/ui/button/index.js";

    let {
        session,
        active = false,
        workspaceDisplayName = null,
        workspaceTooltip = null,
        workspaceColor = null,
        onSelect,
        onRenameWorkspace,
        onRenameSession,
        onArchive,
    }: {
        session: SessionResponse;
        active?: boolean;
        workspaceDisplayName?: string | null;
        workspaceTooltip?: string | null;
        workspaceColor?: string | null;
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
        onArchive?: (info: { sessionId: string; session: SessionResponse }) => void;
    } = $props();

    let title = $derived(displayTitle(session));
    let fallbackWorkspace = $derived(workspaceName(session));
    let fallbackFull = $derived(workspaceLabel(session));
    let workspace = $derived(workspaceDisplayName?.trim() || fallbackWorkspace);
    let workspaceFull = $derived(workspaceTooltip?.trim() || fallbackFull);
    let model = $derived(modelLabel(session));
    let unread = $derived(isSessionUnread(session));
    let workspaceId = $derived(sessionWorkspaceId(session));
    let workspaceColorValue = $derived(workspaceColor?.trim() || null);
    // SessionResponse.last_user_activity_at drives the recency label below.
    let lastInteractionMs = $derived(
        session.last_user_activity_at ?? sessionLastInteractionMs(session),
    );
    let lastInteractionLabel = $derived(formatLastInteraction(lastInteractionMs));
    let lastInteractionFull = $derived(
        lastInteractionMs == null
            ? "No activity yet"
            : new Date(lastInteractionMs).toLocaleString(),
    );
    // Unified workspaces: every session selects a workspace, including the
    // built-in `default` ("No workspace") which cannot be renamed or removed.
    let isDefaultWorkspace = $derived(!workspaceId || isDefaultWorkspaceId(workspaceId));
    let archived = $derived(isSessionArchived(session));
    // Seen/checked: daemon flips ready -> completed once the successful
    // completion is acknowledged via inbox read_sequence. Offer Done only then.
    let showDone = $derived(session.status === "completed" && !archived);
    // Working = actively executing; Ready covers both ready (unacknowledged
    // finish) and completed (acknowledged) per daemon SessionStatus.
    let isWorking = $derived(
        session.status === "queued" ||
            session.status === "running" ||
            session.status === "awaiting_children",
    );
    let isReady = $derived(session.status === "ready" || session.status === "completed");
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
                {#if workspaceColorValue}
                    <span
                        class="size-3 shrink-0 rounded-full border border-border"
                        style="background-color: {workspaceColorValue}"
                        aria-label="Workspace color"
                        title={workspaceColorValue}
                    ></span>
                {/if}
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
                {#if isWorking || isReady || showDone}
                    <span class="ms-auto flex shrink-0 items-center gap-1.5">
                        {#if isWorking}
                            <Badge
                                class="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            >
                                <CircleNotchIcon data-icon="inline-start" class="animate-spin" />
                                Working
                            </Badge>
                        {:else if isReady}
                            <Badge
                                class="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                            >
                                <CheckIcon data-icon="inline-start" />
                                Ready
                            </Badge>
                        {/if}
                        {#if showDone}
                            <Button
                                variant="outline"
                                size="xs"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onArchive?.({ sessionId: session.id, session });
                                }}
                            >
                                <CheckIcon />
                                Done
                            </Button>
                        {/if}
                    </span>
                {/if}
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
                {model} · seq {session.last_event_sequence}{#if lastInteractionLabel}
                    · <span title={lastInteractionFull}>{lastInteractionLabel}</span>{/if}
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
