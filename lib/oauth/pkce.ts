import { createHash } from "crypto";

export function verifyPKCE(verifier: string, challenge: string): boolean {
  const hash = createHash("sha256").update(verifier).digest("base64url");
  return hash === challenge;
}
