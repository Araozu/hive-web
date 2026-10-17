import type { components } from "./openapi.js";

// Proper core names (slop-protocol via utoipa OpenAPI).
// Do not hand-roll these — regenerate with `pnpm generate:api`.
export type SessionResponse = components["schemas"]["SessionResponse"];
export type SessionInbox = components["schemas"]["SessionInbox"];
export type SessionPage = components["schemas"]["Page_SessionResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type WorkspaceResponse = components["schemas"]["WorkspaceResponse"];
export type WorkspacePage = components["schemas"]["Page_WorkspaceResponse"];
export type WorkspaceSelection = components["schemas"]["WorkspaceSelection"];
export type WorkspaceEventResponse = components["schemas"]["WorkspaceEventResponse"];
export type RenameWorkspaceRequest = components["schemas"]["RenameWorkspaceRequest"];
export type UpdateSessionInboxRequest = components["schemas"]["UpdateSessionInboxRequest"];
export type RenameSessionRequest = components["schemas"]["RenameSessionRequest"];
export type SessionStatus = components["schemas"]["SessionStatus"];
export type CommandReceipt = components["schemas"]["CommandReceipt"];
export type QueuedMessageResponse = components["schemas"]["QueuedMessageResponse"];
export type InterruptSessionRequest = components["schemas"]["InterruptSessionRequest"];
export type DeliveryMode = components["schemas"]["DeliveryMode"];
