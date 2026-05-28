import frauncesLatinFontUrl from "@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url";
import soraLatinFontUrl from "@fontsource-variable/sora/files/sora-latin-wght-normal.woff2?url";

export const fontPreloadLinks = [
  {
    as: "font",
    crossOrigin: "anonymous",
    href: soraLatinFontUrl,
    rel: "preload",
    type: "font/woff2",
  },
  {
    as: "font",
    crossOrigin: "anonymous",
    href: frauncesLatinFontUrl,
    rel: "preload",
    type: "font/woff2",
  },
] as const;
