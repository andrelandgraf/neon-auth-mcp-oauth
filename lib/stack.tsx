import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
});

export function getLoginUrl(afterAuthReturnTo: string) {
  return `${process.env.NEXT_PUBLIC_ORIGIN}/handler/login?after_auth_return_to=${encodeURIComponent(afterAuthReturnTo)}`;
}
