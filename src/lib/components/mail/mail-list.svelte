<script lang="ts">
    import { ChatsCircleIcon } from "phosphor-svelte";
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Label } from "#lib/components/ui/label/index.js";
    import { Switch } from "#lib/components/ui/switch/index.js";
    import { cn } from "#lib/utils.js";
    import type { Mail } from "./data.js";

    let {
        title,
        mails,
        selectedEmail = null,
        onSelect,
    }: {
        title: string;
        mails: Mail[];
        selectedEmail?: string | null;
        onSelect?: (mail: Mail) => void;
    } = $props();

    let query = $state("");
    let unreadsOnly = $state(false);

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
            {#each filtered as mail (mail.email)}
                {@const isActive = selectedEmail === mail.email}
                {@const replyCount = mail.replies?.length ?? 0}
                <button
                    type="button"
                    onclick={() => onSelect?.(mail)}
                    aria-current={isActive ? "true" : undefined}
                    class={cn(
                        "flex w-full flex-col items-start gap-2 border-b p-4 text-start text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                >
                    <div class="flex w-full items-center gap-2">
                        {#if mail.unread && !isActive}
                            <span
                                class="size-2 shrink-0 rounded-full bg-primary"
                                aria-label="Unread"
                            ></span>
                        {/if}
                        <span class={cn(mail.unread && "font-semibold")}>{mail.name}</span>
                        <span class="ms-auto text-xs opacity-70">{mail.date}</span>
                    </div>
                    <span class={cn("font-medium", mail.unread && "font-semibold")}
                        >{mail.subject}</span
                    >
                    <span class="line-clamp-2 w-[260px] text-xs whitespace-break-spaces opacity-70">
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
        </Sidebar.GroupContent>
    </Sidebar.Group>
</Sidebar.Content>
