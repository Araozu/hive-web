import type { SessionInbox, SessionResponse, WorkspaceResponse } from "#lib/api/types.js";

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

/** Workspace id referenced by a session, if any. Only project-backed
 * sessions have one — ad-hoc sessions with a direct `execution.root`
 * have no managed workspace record and therefore nothing renameable. */
export function sessionWorkspaceId(session: SessionResponse): string | null {
    return session.managed_workspace_id?.trim() || session.latest_run?.workspace_id?.trim() || null;
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
    const runWorkspace = session.latest_run?.workspace_id?.trim();
    if (runWorkspace) return runWorkspace;
    const managed = session.managed_workspace_id?.trim();
    if (managed) return managed;
    const project =
        session.spec?.project?.project_id?.trim() ||
        session.requested_spec?.project?.project_id?.trim();
    if (project) return project;
    return "No workspace";
}

export function workspaceName(session: SessionResponse): string {
    const root = session.execution?.root?.trim();
    if (root) return basenameOf(root);
    return workspaceLabel(session);
}

/**
 * Proper display name: prefers the daemon-owned `WorkspaceResponse.name`
 * (set via POST /v1/workspaces/{id}/rename, defaults to the workspace id),
 * then falls back to the local basename heuristic.
 */
export function resolveWorkspaceName(
    session: SessionResponse,
    workspacesById?: Map<string, WorkspaceResponse> | null,
): string {
    const id = sessionWorkspaceId(session);
    if (id) {
        const name = workspacesById?.get(id)?.name?.trim();
        if (name) return name;
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
    }
    return workspaceLabel(session);
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
