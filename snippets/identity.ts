/** Canonical identity for listings. Exactly one of url or handle. */

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "ref",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
]);

const BLOCKED_HOSTS = new Set([
  "t.me",
  "telegram.me",
  "wa.me",
  "chat.whatsapp.com",
  "discord.gg",
  "discord.com",
  "m.me",
  "signal.me",
]);

export type Identity =
  | { kind: "url"; key: string; url: string; handle: null }
  | { kind: "handle"; key: string; url: string; handle: string };

export function parseIdentity(input: {
  url?: string | null;
  handle?: string | null;
  utmSource: string;
}): Identity {
  const rawHandle = input.handle?.trim() ?? "";
  const rawUrl = input.url?.trim() ?? "";

  if (rawHandle && rawUrl) {
    throw new Error("Enter a URL or an @handle, not both");
  }
  if (!rawHandle && !rawUrl) {
    throw new Error("Enter a URL or an @handle");
  }

  if (rawHandle) {
    const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
    if (!/^@[A-Za-z0-9_]{1,15}$/.test(handle)) {
      throw new Error("Invalid X handle");
    }
    const key = handle.toLowerCase();
    const name = key.slice(1);
    return {
      kind: "handle",
      key,
      handle: key,
      url: withUtm(`https://x.com/${name}`, input.utmSource),
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must be http(s)");
  }
  if (parsed.hostname === "localhost" || parsed.hostname.endsWith(".localhost")) {
    throw new Error("localhost is not allowed");
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
    throw new Error("IP addresses are not allowed");
  }

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host)) {
    throw new Error("Chat and invite links are not allowed");
  }

  parsed.hostname = host;
  parsed.hash = "";
  parsed.username = "";
  parsed.password = "";
  parsed.protocol = "https:";

  for (const key of [...parsed.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) {
      parsed.searchParams.delete(key);
    }
  }

  let path = parsed.pathname.replace(/\/+$/, "");
  if (path === "") path = "";
  parsed.pathname = path || "/";

  const search = parsed.searchParams.toString();
  const key =
    `https://${host}${path || ""}` + (search ? `?${search}` : "");

  return {
    kind: "url",
    key,
    url: withUtm(key, input.utmSource),
    handle: null,
  };
}

function withUtm(url: string, source: string): string {
  const u = new URL(url);
  if (!u.searchParams.has("utm_source")) {
    u.searchParams.set("utm_source", source);
  }
  return u.toString();
}
