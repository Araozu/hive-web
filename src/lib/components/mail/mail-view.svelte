<script lang="ts">
    import {
        ArchiveIcon,
        ArrowBendUpLeftIcon,
        ArrowBendUpRightIcon,
        ChatsCircleIcon,
        DotsThreeIcon,
        EnvelopeOpenIcon,
        TrashIcon,
    } from "phosphor-svelte";
    import * as Avatar from "#lib/components/ui/avatar/index.js";
    import { Badge } from "#lib/components/ui/badge/index.js";
    import { Button } from "#lib/components/ui/button/index.js";
    import * as Card from "#lib/components/ui/card/index.js";
    import { Separator } from "#lib/components/ui/separator/index.js";
    import type { Mail } from "./data.js";

    let { mail, folder = "Inbox" }: { mail: Mail | null; folder?: string } = $props();

    function initialsFor(name: string) {
        return name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }

    let initials = $derived(mail ? initialsFor(mail.name) : "");
    let replyCount = $derived(mail?.replies?.length ?? 0);
</script>

{#if !mail}
    <div class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div
            class="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
        >
            <EnvelopeOpenIcon class="size-6" />
        </div>
        <div class="space-y-1">
            <p class="text-sm font-medium">No message selected</p>
            <p class="text-sm text-muted-foreground">
                Choose a message from the list to read it here.
            </p>
        </div>
    </div>
{:else}
    {#key mail.email}
        <div class="flex flex-col gap-4 p-4 md:p-6">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 space-y-1.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{folder}</Badge>
                        {#if mail.unread}
                            <Badge>Unread</Badge>
                        {/if}
                        {#if replyCount > 0}
                            <Badge variant="outline">
                                <ChatsCircleIcon data-icon="inline-start" />
                                {replyCount + 1} messages
                            </Badge>
                        {/if}
                        <span class="text-xs text-muted-foreground">{mail.date}</span>
                    </div>
                    <h1 class="text-xl font-semibold tracking-tight text-balance">
                        {mail.subject}
                    </h1>
                </div>
                <div class="flex items-center gap-1">
                    <Button variant="ghost" size="icon" aria-label="Archive">
                        <ArchiveIcon />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                        <TrashIcon />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="More actions">
                        <DotsThreeIcon />
                    </Button>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <Avatar.Root class="size-9 rounded-full">
                    <Avatar.Fallback class="rounded-full">{initials}</Avatar.Fallback>
                </Avatar.Root>
                <div class="grid min-w-0 flex-1 text-start text-sm leading-tight">
                    <span class="truncate font-medium">{mail.name}</span>
                    <span class="truncate text-xs text-muted-foreground">
                        {mail.email}
                    </span>
                </div>
                <span class="hidden text-xs text-muted-foreground sm:block"> To me </span>
            </div>

            <Separator />

            <div class="max-w-3xl text-sm leading-6 whitespace-pre-line text-foreground/90">
                {mail.body}
            </div>

            {#if replyCount > 0}
                <div class="flex items-center gap-2 pt-2">
                    <ChatsCircleIcon class="size-4 text-muted-foreground" />
                    <span class="text-sm font-medium">
                        {replyCount}
                        {replyCount === 1 ? "reply" : "replies"}
                    </span>
                </div>
                <div class="flex max-w-3xl flex-col gap-3">
                    {#each mail.replies ?? [] as reply (reply.email + reply.date + reply.body.slice(0, 16))}
                        <Card.Root>
                            <Card.Header>
                                <div class="flex items-center gap-3">
                                    <Avatar.Root class="size-8 rounded-full">
                                        <Avatar.Fallback class="rounded-full">
                                            {initialsFor(reply.name)}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                    <div
                                        class="grid min-w-0 flex-1 text-start text-sm leading-tight"
                                    >
                                        <span class="truncate font-medium">{reply.name}</span>
                                        <span class="truncate text-xs text-muted-foreground">
                                            {reply.email}
                                        </span>
                                    </div>
                                    <span class="shrink-0 text-xs text-muted-foreground">
                                        {reply.date}
                                    </span>
                                </div>
                            </Card.Header>
                            <Card.Content>
                                <div
                                    class="text-sm leading-6 whitespace-pre-line text-foreground/90"
                                >
                                    {reply.body}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            {/if}

            <Separator />

            <div class="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                    <ArrowBendUpLeftIcon data-icon="inline-start" />
                    Reply
                </Button>
                <Button variant="outline" size="sm">
                    <ArrowBendUpRightIcon data-icon="inline-start" />
                    Forward
                </Button>
            </div>
        </div>
    {/key}
{/if}
