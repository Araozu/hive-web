<script lang="ts">
    import { ArrowClockwiseIcon, ChatsCircleIcon } from "phosphor-svelte";
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Label } from "#lib/components/ui/label/index.js";
    import { Switch } from "#lib/components/ui/switch/index.js";
    import { Button } from "#lib/components/ui/button/index.js";
    import { cn } from "#lib/utils.js";
    import type { Mail } from "./data.js";

    let {
        title,
        mails,
        selectedEmail = null,
        loading = false,
        error = null,
        onSelect,
        onRetry,
    }: {
        title: string;
        mails: Mail[];
        selectedEmail?: string | null;
        loading?: boolean;
        error?: string | null;
        onSelect?: (mail: Mail) => void;
        onRetry?: () => void;
    } = $props();

    let query = $state("");
    let unreadsOnly = $state(false);

    function keyFor(mail: Mail) {
        return mail.id ?? mail.email;
    }

    let filtered = $derived(
        mails.filter((mail) => {
            if (unreadsOnly && !mail.unread) return false;
            if (!query) return true;
            const q = query.toLowerCase();
            return (
                mail.name.toLowerCase().includes(q) ||
                mail.email.toLowerCase().includes(q) ||
                mail.subject.toLowerCase().includes(q) ||
                mail.teaser.toLowerCase().includes(q)
            );
        }),
    );
</script>

<Sidebar.Header class="gap-3.5 border-b p-4">
    <div class="flex w-full items-center justify-between">
        <div class="text-base font-medium text-foreground">
            {title}
        </div>
        <Label class="flex items-center gap-2 text-sm">
            <span>Unreads</span>
            <Switch bind:checked={unreadsOnly} class="shadow-none" />
        </Label>
    </div>
    <Sidebar.Input bind:value={query} placeholder="Type to search..." />
</Sidebar.Header>
<Sidebar.Content>
    <Sidebar.Group class="px-0">
        <Sidebar.GroupContent>
            {#if loading}
                <div class="p-4 text-sm text-muted-foreground">Loading threads…</div>
            {:else if error}
                <div class="flex flex-col items-start gap-2 p-4">
                    <p class="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" size="sm" onclick={() => onRetry?.()}>
                        <ArrowClockwiseIcon data-icon="inline-start" />
                        Retry
                    </Button>
                </div>
            {:else}
                {#each filtered as mail (keyFor(mail))}
                    {@const isActive = selectedEmail === keyFor(mail)}
                    {@const replyCount = mail.replies?.length ?? 0}
                    <button
                        type="button"
                        onclick={() => onSelect?.(mail)}
                        aria-current={isActive ? "true" : undefined}
                        class={cn(
                            "flex w-full min-w-0 flex-col items-start gap-2 overflow-hidden border-b p-4 text-start text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                    >
                        <div class="flex w-full min-w-0 items-center gap-2">
                            {#if mail.unread && !isActive}
                                <span
                                    class="size-2 shrink-0 rounded-full bg-primary"
                                    aria-label="Unread"
                                ></span>
                            {/if}
                            <span
                                class={cn(
                                    "min-w-0 flex-1 truncate",
                                    mail.unread && "font-semibold",
                                )}>{mail.name}</span
                            >
                            <span class="ms-auto shrink-0 text-xs opacity-70">{mail.date}</span>
                        </div>
                        <span
                            class={cn(
                                "w-full truncate font-medium",
                                mail.unread && "font-semibold",
                            )}>{mail.subject}</span
                        >
                        <span
                            class="line-clamp-2 w-full overflow-hidden text-xs break-words whitespace-normal opacity-70"
                        >
                            {mail.teaser}
                        </span>
                        {#if replyCount > 0}
                            <span class="flex items-center gap-1 text-xs opacity-70">
                                <ChatsCircleIcon class="size-3.5" />
                                {replyCount}
                                {replyCount === 1 ? "reply" : "replies"}
                            </span>
                        {/if}
                    </button>
                {:else}
                    <div class="p-4 text-sm text-muted-foreground">No messages found.</div>
                {/each}
            {/if}
        </Sidebar.GroupContent>
    </Sidebar.Group>
</Sidebar.Content>
