import { normalizeHttpOrigin } from "./http-url";

export function normalizeApiBaseUrl(value: string): string {
  return normalizeHttpOrigin(value);
}
