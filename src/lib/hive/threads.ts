import type { Mail } from "#lib/components/mail/data.js";

export type DaemonSessionInbox = {
    starred: boolean;
    archived: boolean;
    trashed: boolean;
    read_sequence: number;
};

export type DaemonSession = {
    id: string;
    title: string | null;
    provider: string;
    model: string;
    revision: number;
    last_event_sequence: number;
    inbox?: DaemonSessionInbox | null;
};

export type DaemonPage<T> = {
    items: T[];
    next_after: number | null;
};

export class DaemonError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

async function requestDaemon<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`/api/daemon/v1/${path}`, { signal });
    const data = await response.json().catch(() => {
        throw new DaemonError(
            response.status === 404
                ? "This daemon does not support this endpoint. Restart the updated daemon."
                : `Daemon returned an invalid response (${response.status}).`,
            response.status,
        );
    });
    if (!response.ok)
        throw new DaemonError(
            data.error?.message ?? data.message ?? `Daemon request failed (${response.status})`,
            response.status,
        );
    return data as T;
}

async function allPages<T>(path: string, signal?: AbortSignal): Promise<T[]> {
    const items: T[] = [];
    let after: number | null = null;
    do {
        const batch: DaemonPage<T> = await requestDaemon<DaemonPage<T>>(
            `${path}${path.includes("?") ? "&" : "?"}limit=200${after === null ? "" : `&after=${after}`}`,
            signal,
        );
        items.push(...batch.items);
        after = batch.next_after;
    } while (after !== null);
    return items;
}

/** The inbox list is the only view wired to the daemon. */
export function fetchThreads(signal?: AbortSignal): Promise<DaemonSession[]> {
    return allPages<DaemonSession>("sessions", signal);
}

function displayTitle(session: DaemonSession): string {
    const title = session.title?.trim();
    return title ? title : "Untitled thread";
}

/** Render a daemon thread as an email-like row. IDs stay daemon-owned. */
export function sessionToMail(session: DaemonSession): Mail {
    const title = displayTitle(session);
    const modelLabel = `${session.provider}/${session.model}`;
    const unread = (session.inbox?.read_sequence ?? 0) < session.last_event_sequence;
    return {
        id: session.id,
        name: title,
        email: modelLabel,
        subject: title,
        date: `rev ${session.revision}`,
        teaser: `${modelLabel} · seq ${session.last_event_sequence}`,
        body: `Model ${modelLabel}\nRevision ${session.revision}\nEvent sequence ${session.last_event_sequence}`,
        unread,
    };
}

export function mailsForFolder(folder: string, sessions: DaemonSession[]): Mail[] {
    const visible = sessions.filter((session) => {
        const inbox = session.inbox;
        const trashed = inbox?.trashed ?? false;
        const archived = inbox?.archived ?? false;
        switch (folder) {
            case "Trash":
                return trashed;
            case "Junk":
                return !trashed && archived;
            case "Inbox":
                return !trashed && !archived;
            default:
                return !trashed;
        }
    });
    return visible.map(sessionToMail);
}
