import type { SessionInbox, SessionResponse, WorkspaceResponse } from "#lib/api/types.js";

export type { SessionInbox, SessionResponse };
export type { SessionPage } from "#lib/api/types.js";

/** @deprecated Use `SessionInbox` from `#lib/api/types.js`. */
export type DaemonSessionInbox = SessionInbox;
/** @deprecated Use `SessionResponse` from `#lib/api/types.js`. */
export type DaemonSession = SessionResponse;

/** Built-in workspace for threads without a directory. Cannot be renamed or removed. */
export const DEFAULT_WORKSPACE_ID = "default";

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

export function isDefaultWorkspaceId(id: string | null | undefined): boolean {
    return (id?.trim() ?? "") === DEFAULT_WORKSPACE_ID;
}

/** Authoritative workspace id selected by a session, including `default`.
 * Every session has one — unified workspaces removed the old
 * `managed_workspace_id` / `spec.project` fields. Falls back to the latest
 * run for very old daemons. */
export function sessionWorkspaceId(session: SessionResponse): string | null {
    const direct = session.workspace_id?.trim();
    if (direct) return direct;
    // Pre-unified daemons exposed the workspace only via the latest run.
    const run = session.latest_run?.workspace_id?.trim();
    return run || null;
}

export function hasDirectExecutionRoot(session: SessionResponse): boolean {
    return Boolean(session.execution?.root?.trim());
}

function basenameOf(path: string): string {
    const base = path
        .replace(/[/\\]+$/, "")
        .split(/[/\\]/)
        .pop()
        ?.trim();
    return base || path;
}

export function workspaceLabel(session: SessionResponse): string {
    const root = session.execution?.root?.trim();
    if (root) return root;
    const id = sessionWorkspaceId(session);
    if (id && !isDefaultWorkspaceId(id)) return id;
    const specId =
        session.spec?.workspace?.workspace_id?.trim() ||
        session.requested_spec?.workspace?.workspace_id?.trim();
    if (specId && !isDefaultWorkspaceId(specId)) return specId;
    return "No workspace";
}

export function workspaceName(session: SessionResponse): string {
    const root = session.execution?.root?.trim();
    if (root) return basenameOf(root);
    const id =
        sessionWorkspaceId(session) ||
        session.spec?.workspace?.workspace_id?.trim() ||
        session.requested_spec?.workspace?.workspace_id?.trim();
    if (id) {
        if (isDefaultWorkspaceId(id)) return "No workspace";
        return id;
    }
    return "No workspace";
}

/**
 * Proper display name: prefers the daemon-owned `WorkspaceResponse.name`
 * (set via POST /v1/workspaces/{id}/rename). The built-in `default`
 * workspace is named "No workspace" and has no path.
 */
export function resolveWorkspaceName(
    session: SessionResponse,
    workspacesById?: Map<string, WorkspaceResponse> | null,
): string {
    const id = sessionWorkspaceId(session);
    if (id) {
        const name = workspacesById?.get(id)?.name?.trim();
        if (name) return name;
        if (isDefaultWorkspaceId(id)) return "No workspace";
    }
    return workspaceName(session);
}

/** Full tooltip: daemon path when known, otherwise the raw label fallback. */
export function resolveWorkspaceFull(
    session: SessionResponse,
    workspacesById?: Map<string, WorkspaceResponse> | null,
): string {
    const id = sessionWorkspaceId(session);
    if (id) {
        const workspace = workspacesById?.get(id);
        const name = workspace?.name?.trim();
        const path = workspace?.path?.trim();
        if (name && path && name !== path) return `${name} — ${path}`;
        if (path) return path;
        if (name) return name;
        if (isDefaultWorkspaceId(id)) return "No workspace";
    }
    return workspaceLabel(session);
}

/** The built-in `default` workspace cannot be renamed or removed. */
export function canRenameWorkspace(
    session: SessionResponse,
    workspacesById?: Map<string, WorkspaceResponse> | null,
): boolean {
    const id = sessionWorkspaceId(session);
    if (!id || isDefaultWorkspaceId(id)) return false;
    const workspace = workspacesById?.get(id);
    if (workspace?.is_default) return false;
    return true;
}

export function isSessionUnread(session: SessionResponse): boolean {
    return (session.inbox?.read_sequence ?? 0) < session.last_event_sequence;
}

/** Last user interaction in Unix milliseconds (daemon clock).
 * Null until input is accepted, including for migrated sessions whose
 * historical input times are unknown. */
export function sessionLastInteractionMs(session: SessionResponse): number | null {
    const ts = session.last_user_activity_at ?? null;
    if (typeof ts !== "number" || !Number.isFinite(ts)) return null;
    return ts;
}

/** Newest-first comparison by last interaction. Sessions without a timestamp
 * sort below sessions with one. Ties fall back to event sequence, then id. */
export function compareSessionsByLastInteraction(a: SessionResponse, b: SessionResponse): number {
    const aTs = sessionLastInteractionMs(a);
    const bTs = sessionLastInteractionMs(b);
    if (aTs === null && bTs === null) {
        if (b.last_event_sequence !== a.last_event_sequence)
            return b.last_event_sequence - a.last_event_sequence;
        return a.id.localeCompare(b.id);
    }
    if (aTs === null) return 1;
    if (bTs === null) return -1;
    if (bTs !== aTs) return bTs - aTs;
    if (b.last_event_sequence !== a.last_event_sequence)
        return b.last_event_sequence - a.last_event_sequence;
    return a.id.localeCompare(b.id);
}

/** Copy sorted by last interaction, more recent above. */
export function sortSessionsByLastInteraction(sessions: SessionResponse[]): SessionResponse[] {
    return [...sessions].sort(compareSessionsByLastInteraction);
}

/** Opaque RGB workspace color (#RRGGBB) for the session's workspace, if known. */
export function resolveWorkspaceColor(
    session: SessionResponse,
    workspacesById?: Map<string, WorkspaceResponse> | null,
): string | null {
    const id = sessionWorkspaceId(session);
    if (!id) return null;
    const color = workspacesById?.get(id)?.color?.trim();
    return color || null;
}

/** Short relative label for a last-interaction timestamp. Empty when unknown. */
export function formatLastInteraction(ts: number | null | undefined): string {
    if (ts == null || !Number.isFinite(ts)) return "";
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return "";
    const diff = Date.now() - ts;
    if (diff < 0) return date.toLocaleString();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function sessionsForFolder(folder: string, sessions: SessionResponse[]): SessionResponse[] {
    return sessions
        .filter((session) => {
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
        })
        .sort(compareSessionsByLastInteraction);
}
