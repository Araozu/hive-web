<script lang="ts">
    import { cn } from "#lib/utils.js";
    import type { SessionResponse } from "#lib/api/types.js";
    import { displayTitle, isSessionUnread, modelLabel } from "#lib/hive/threads.js";
    import * as ContextMenu from "#lib/components/ui/context-menu/index.js";

    let {
        session,
        active = false,
        onSelect,
    }: {
        session: SessionResponse;
        active?: boolean;
        onSelect?: (session: SessionResponse) => void;
    } = $props();

    let title = $derived(displayTitle(session));
    let model = $derived(modelLabel(session));
    let unread = $derived(isSessionUnread(session));
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
                    <span class="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread"
                    ></span>
                {/if}
                <span class={cn("min-w-0 flex-1 truncate", unread && "font-semibold")}>
                    {title}
                </span>
                <span class="ms-auto shrink-0 text-xs opacity-70">rev {session.revision}</span>
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
        <ContextMenu.Item>Profile</ContextMenu.Item>
        <ContextMenu.Item>Billing</ContextMenu.Item>
        <ContextMenu.Item>Team</ContextMenu.Item>
        <ContextMenu.Item>Subscription</ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>
