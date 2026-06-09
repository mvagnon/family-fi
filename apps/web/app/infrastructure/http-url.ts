export function normalizeHttpUrl(value: string): string {
  const trimmedValue = value.trim().replace(/\/+$/, "");

  if (!trimmedValue) {
    throw new Error("URL value cannot be empty.");
  }

  const url = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `${getDefaultProtocol(trimmedValue)}://${trimmedValue}`;

  new URL(url);

  return url;
}

export function normalizeHttpOrigin(value: string): string {
  return new URL(normalizeHttpUrl(value)).origin;
}

function getDefaultProtocol(value: string): "http" | "https" {
  const host = value.split(/[/?#]/, 1)[0]?.toLowerCase() ?? "";

  if (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "127.0.0.1" ||
    host.startsWith("127.0.0.1:") ||
    host === "[::1]" ||
    host.startsWith("[::1]:") ||
    host.endsWith(".railway.internal") ||
    host.includes(".railway.internal:")
  ) {
    return "http";
  }

  return "https";
}
