<script lang="ts">
    import { ChatsCircleIcon } from "phosphor-svelte";
    import { cn } from "#lib/utils.js";
    import type { Mail } from "./data.js";

    let {
        mail,
        active = false,
        onSelect,
    }: {
        mail: Mail;
        active?: boolean;
        onSelect?: (mail: Mail) => void;
    } = $props();

    let replyCount = $derived(mail.replies?.length ?? 0);
</script>

<button
    type="button"
    onclick={() => onSelect?.(mail)}
    aria-current={active ? "true" : undefined}
    class={cn(
        "flex w-full max-w-full min-w-0 cursor-pointer flex-col items-start gap-2 overflow-hidden border-b p-4 text-start text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground",
    )}
>
    <div class="flex w-full max-w-full min-w-0 items-center gap-2">
        {#if mail.unread && !active}
            <span class="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread"></span>
        {/if}
        <span class={cn("min-w-0 flex-1 truncate", mail.unread && "font-semibold")}>
            {mail.name}
        </span>
        <span class="ms-auto shrink-0 text-xs opacity-70">{mail.date}</span>
    </div>
    <span
        class={cn("w-full max-w-full min-w-0 truncate font-medium", mail.unread && "font-semibold")}
    >
        {mail.subject}
    </span>
    <span
        class="line-clamp-2 w-full max-w-full min-w-0 overflow-hidden text-xs break-words whitespace-normal opacity-70"
    >
        {mail.teaser}
    </span>
    {#if replyCount > 0}
        <span class="flex max-w-full min-w-0 items-center gap-1 text-xs opacity-70">
            <ChatsCircleIcon class="size-3.5" />
            {replyCount}
            {replyCount === 1 ? "reply" : "replies"}
        </span>
    {/if}
</button>
