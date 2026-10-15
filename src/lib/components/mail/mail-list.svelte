<script lang="ts">
    import { ArrowClockwiseIcon } from "phosphor-svelte";
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Label } from "#lib/components/ui/label/index.js";
    import { Switch } from "#lib/components/ui/switch/index.js";
    import { Button } from "#lib/components/ui/button/index.js";
    import type { Mail } from "./data.js";
    import MailListItem from "./mail-list-item.svelte";

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
<Sidebar.Content class="min-w-0 overflow-x-hidden">
    <Sidebar.Group class="max-w-full px-0">
        <Sidebar.GroupContent class="max-w-full min-w-0 overflow-hidden">
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
                    <MailListItem {mail} active={selectedEmail === keyFor(mail)} {onSelect} />
                {:else}
                    <div class="p-4 text-sm text-muted-foreground">No messages found.</div>
                {/each}
            {/if}
        </Sidebar.GroupContent>
    </Sidebar.Group>
</Sidebar.Content>
