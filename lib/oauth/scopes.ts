export const OAUTH_SCOPES = {
  "appName:entity:read": "Read entity",
  "appName:entity:write": "Write entity",
} as const;

export const allOAuthScopes =
  "appName:entity:read appName:entity:write" as const;
