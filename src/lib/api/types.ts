import type { components } from "./openapi.js";

// Proper core names (slop-protocol via utoipa OpenAPI).
// Do not hand-roll these — regenerate with `pnpm generate:api`.
export type SessionResponse = components["schemas"]["SessionResponse"];
export type SessionInbox = components["schemas"]["SessionInbox"];
export type SessionPage = components["schemas"]["Page_SessionResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type WorkspaceResponse = components["schemas"]["WorkspaceResponse"];
export type WorkspacePage = components["schemas"]["Page_WorkspaceResponse"];
export type ProjectResponse = components["schemas"]["ProjectResponse"];
export type ProjectPage = components["schemas"]["Page_ProjectResponse"];
export type RenameWorkspaceRequest = components["schemas"]["RenameWorkspaceRequest"];
