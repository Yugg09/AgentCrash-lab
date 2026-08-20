export interface ParsedRedisUrl {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls: boolean;
}

/** Strip quotes/whitespace and parse redis/rediss URLs (Node URL can't parse rediss://). */
export function parseRedisUrl(raw: string): ParsedRedisUrl {
  const url = raw.trim().replace(/^["']|["']$/g, "");
  const tls = /^rediss:\/\//i.test(url) || url.includes("upstash.io");
  const forParse = url.replace(/^rediss:\/\//i, "https://").replace(/^redis:\/\//i, "http://");

  let parsed: URL;
  try {
    parsed = new URL(forParse);
  } catch {
    throw new Error("Invalid REDIS_URL — copy the TCP URL from Upstash (no quotes)");
  }

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    tls,
  };
}
