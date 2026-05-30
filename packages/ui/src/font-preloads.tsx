import nunitoSansLatinFontUrl from "@fontsource-variable/nunito-sans/files/nunito-sans-latin-wght-normal.woff2?url";

export const fontPreloadLinks = [
  {
    as: "font",
    crossOrigin: "anonymous",
    href: nunitoSansLatinFontUrl,
    rel: "preload",
    type: "font/woff2",
  },
] as const;
