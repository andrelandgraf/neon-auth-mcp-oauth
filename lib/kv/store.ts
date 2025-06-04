import "server-only";
import { Redis } from "@upstash/redis";
import { config } from "@/lib/config";
import { remember } from "@epic-web/remember";

function getKVClient() {
  return remember(
    "kv",
    () =>
      new Redis({
        url: config.kv.restUrl,
        token: config.kv.restToken,
      }),
  );
}

export const kv = getKVClient();
