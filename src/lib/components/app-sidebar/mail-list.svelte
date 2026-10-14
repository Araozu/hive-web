<script lang="ts">
    import * as Sidebar from "#lib/components/ui/sidebar/index.js";
    import { Label } from "#lib/components/ui/label/index.js";
    import { Switch } from "#lib/components/ui/switch/index.js";
    import type { Mail } from "./data.js";

    let { title, mails }: { title: string; mails: Mail[] } = $props();

    let query = $state("");
    let unreadsOnly = $state(false);

    let filtered = $derived(
        mails.filter((mail) => {
            if (!query) return true;
            const q = query.toLowerCase();
            return (
                mail.name.toLowerCase().includes(q) ||
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
                <a
                    href="##"
                    class="flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                    <div class="flex w-full items-center gap-2">
                        <span>{mail.name}</span>
                        <span class="ms-auto text-xs">{mail.date}</span>
                    </div>
                    <span class="font-medium">{mail.subject}</span>
                    <span class="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                        {mail.teaser}
                    </span>
                </a>
            {/each}
        </Sidebar.GroupContent>
    </Sidebar.Group>
</Sidebar.Content>
