<script lang="ts">
    import { Button } from "#lib/components/ui/button/index.js";
    import { Input } from "#lib/components/ui/input/index.js";
    import * as Avatar from "#lib/components/ui/avatar/index.js";
    import { Separator } from "#lib/components/ui/separator/index.js";
    import { ScrollArea } from "#lib/components/ui/scroll-area/index.js";
    import { Badge } from "#lib/components/ui/badge/index.js";
    import { Plus, PaperPlaneRight, Robot, User, DotOutline } from "phosphor-svelte";

    type Project = {
        id: string;
        name: string;
        desc: string;
        status: "active" | "idle" | "done";
    };

    type Msg = {
        id: number;
        role: "user" | "agent";
        text: string;
    };

    let projects: Project[] = $state([
        { id: "p1", name: "website-redesign", desc: "Landing + docs", status: "active" },
        { id: "p2", name: "api-migration", desc: "REST -> tRPC", status: "active" },
        { id: "p3", name: "data-pipeline", desc: "Nightly sync", status: "idle" },
        { id: "p4", name: "onboarding-bot", desc: "Slack helper", status: "done" },
    ]);

    let activeId = $state("p1");
    let activeProject = $derived(projects.find((p) => p.id === activeId) ?? projects[0]);

    let messages: Msg[] = $state([
        {
            id: 1,
            role: "agent",
            text: "Hey! I am a demo agent. Pick a project on the left and ask me anything.",
        },
        { id: 2, role: "user", text: "What can you do?" },
        {
            id: 3,
            role: "agent",
            text: "I can scaffold tasks, summarize status, and draft plans. This is just unstyled demo data.",
        },
    ]);

    let draft = $state("");
    let nextId = $state(4);
    let thinking = $state(false);

    function selectProject(id: string) {
        activeId = id;
        messages = [
            {
                id: nextId++,
                role: "agent",
                text: `Switched to ${projects.find((p) => p.id === id)?.name}. What do you want to do here?`,
            },
        ];
    }

    function send() {
        const text = draft.trim();
        if (!text || thinking) return;
        messages.push({ id: nextId++, role: "user", text });
        draft = "";
        thinking = true;
        setTimeout(() => {
            messages.push({
                id: nextId++,
                role: "agent",
                text: `Demo reply for "${activeProject.name}": I saw "${text}". I would plan → run → verify here.`,
            });
            thinking = false;
        }, 700);
    }
</script>

<div class="flex h-screen bg-background text-foreground">
    <!-- LEFT: projects -->
    <aside class="flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div class="flex items-center justify-between px-3 py-3">
            <div class="text-xs font-semibold tracking-wide uppercase opacity-70">Projects</div>
            <Button variant="ghost" size="icon-sm" aria-label="New project">
                <Plus />
            </Button>
        </div>
        <Separator />
        <ScrollArea class="flex-1 px-2 py-2">
            <div class="flex flex-col gap-1">
                {#each projects as p (p.id)}
                    <button
                        onclick={() => selectProject(p.id)}
                        class="rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted {activeId ===
                        p.id
                            ? 'bg-muted'
                            : 'bg-transparent'}"
                    >
                        <div class="flex items-center justify-between gap-2">
                            <span class="truncate text-xs font-medium">{p.name}</span>
                            <Badge
                                variant={p.status === "done" ? "secondary" : "outline"}
                                class="h-4 px-1 text-[10px]"
                            >
                                {p.status}
                            </Badge>
                        </div>
                        <div class="mt-0.5 truncate text-[11px] opacity-60">{p.desc}</div>
                    </button>
                {/each}
            </div>
        </ScrollArea>
        <Separator />
        <div class="flex items-center gap-2 px-3 py-3">
            <Avatar.Root class="size-6">
                <Avatar.Fallback class="text-[10px]">D</Avatar.Fallback>
            </Avatar.Root>
            <div class="text-[11px] opacity-70">demo workspace</div>
        </div>
    </aside>

    <!-- CENTER: chat -->
    <main class="flex min-w-0 flex-1 flex-col">
        <div class="flex items-center justify-between border-b px-4 py-2.5">
            <div class="flex min-w-0 items-center gap-2">
                <DotOutline class="size-6 text-green-500" weight="fill" />
                <div class="truncate text-sm font-medium">{activeProject.name}</div>
                <Badge variant="secondary" class="hidden sm:inline-flex"
                    >{activeProject.status}</Badge
                >
            </div>
            <div class="text-[11px] opacity-50">tiny demo agent</div>
        </div>

        <ScrollArea class="flex-1 px-4 py-4">
            <div class="mx-auto flex w-full max-w-2xl flex-col gap-3">
                {#each messages as m (m.id)}
                    <div class="flex gap-2.5 {m.role === 'user' ? 'flex-row-reverse' : ''}">
                        <Avatar.Root class="size-7 shrink-0">
                            <Avatar.Fallback>
                                {#if m.role === "agent"}
                                    <Robot class="size-3.5" />
                                {:else}
                                    <User class="size-3.5" />
                                {/if}
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <div
                            class="max-w-[75%] rounded-md border px-3 py-2 text-[13px] leading-relaxed {m.role ===
                            'user'
                                ? 'border-transparent bg-primary text-primary-foreground'
                                : 'bg-card text-card-foreground'}"
                        >
                            {m.text}
                        </div>
                    </div>
                {/each}
                {#if thinking}
                    <div class="flex gap-2.5">
                        <Avatar.Root class="size-7 shrink-0">
                            <Avatar.Fallback><Robot class="size-3.5" /></Avatar.Fallback>
                        </Avatar.Root>
                        <div class="rounded-md border bg-card px-3 py-2 text-[13px] opacity-60">
                            thinking…
                        </div>
                    </div>
                {/if}
            </div>
        </ScrollArea>

        <div class="border-t p-3">
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    send();
                }}
                class="mx-auto flex w-full max-w-2xl gap-2"
            >
                <Input bind:value={draft} placeholder="Ask the agent…" class="h-8 text-[13px]" />
                <Button type="submit" size="sm" disabled={!draft.trim()}>
                    <PaperPlaneRight />
                    Send
                </Button>
            </form>
            <div class="mx-auto mt-1.5 w-full max-w-2xl text-[11px] opacity-40">
                Demo only — no backend, replies are faked with setTimeout.
            </div>
        </div>
    </main>

    <!-- RIGHT: empty -->
    <aside class="hidden w-64 shrink-0 flex-col border-l bg-sidebar/50 md:flex">
        <div class="px-4 py-3 text-xs font-semibold tracking-wide uppercase opacity-70">
            Details
        </div>
        <Separator />
        <div class="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <div class="rounded-md border border-dashed p-6 text-[12px] opacity-50">
                empty sidebar<br />nothing selected
            </div>
            <div class="text-[11px] opacity-40">placeholder for agent context / tools</div>
        </div>
    </aside>
</div>
