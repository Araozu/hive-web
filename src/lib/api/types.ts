import type { components } from "./openapi.js";

// Proper core names (slop-protocol via utoipa OpenAPI).
// Do not hand-roll these — regenerate with `pnpm generate:api`.
export type SessionResponse = components["schemas"]["SessionResponse"];
export type SessionInbox = components["schemas"]["SessionInbox"];
export type SessionPage = components["schemas"]["Page_SessionResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
