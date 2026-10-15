import type { SessionInbox, SessionResponse } from "#lib/api/types.js";

export type { SessionInbox, SessionResponse };
export type { SessionPage } from "#lib/api/types.js";

/** @deprecated Use `SessionInbox` from `#lib/api/types.js`. */
export type DaemonSessionInbox = SessionInbox;
/** @deprecated Use `SessionResponse` from `#lib/api/types.js`. */
export type DaemonSession = SessionResponse;

// Daemon-owned identity. Core `SessionResponse.id` is unique — no email fallback.
export function sessionKey(session: SessionResponse): string {
    return session.id;
}

export function displayTitle(session: SessionResponse): string {
    const title = session.title?.trim();
    return title ? title : "Untitled thread";
}

export function modelLabel(session: SessionResponse): string {
    return `${session.provider}/${session.model}`;
}

export function isSessionUnread(session: SessionResponse): boolean {
    return (session.inbox?.read_sequence ?? 0) < session.last_event_sequence;
}

export function sessionsForFolder(folder: string, sessions: SessionResponse[]): SessionResponse[] {
    return sessions.filter((session) => {
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
}
