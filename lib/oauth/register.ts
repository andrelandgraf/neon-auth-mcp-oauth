import "server-only";
import { v4 } from "uuid";

export async function registerOAuthClient() {
  const clientId = v4();
  const registration = {
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    token_endpoint_auth_method: "none",
    redirect_uris: [],
  };
  return registration;
}
