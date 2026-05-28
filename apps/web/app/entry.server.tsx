import { PassThrough } from "node:stream";

import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import type { ReactElement } from "react";
import type { AppLoadContext, EntryContext } from "react-router";
import { createEmotionCache } from "@repo/ui/create-emotion-cache";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
  // If you have middleware enabled:
  // loadContext: RouterContextProvider
) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  const userAgent = request.headers.get("user-agent");

  // Ensure requests from bots and SPA Mode renders wait for all content to load before responding.
  // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
  const readyOption: keyof RenderToPipeableStreamOptions =
    (userAgent && isbot(userAgent)) || routerContext.isSpaMode
      ? "onAllReady"
      : "onShellReady";
  const emotionCache = createEmotionCache();
  const { constructStyleTagsFromChunks, extractCriticalToChunks } =
    createEmotionServer(emotionCache);

  return renderMarkupToString(
    <CacheProvider value={emotionCache}>
      <ServerRouter context={routerContext} url={request.url} />
    </CacheProvider>,
    readyOption,
    (error) => {
      responseStatusCode = 500;
      console.error(error);
    },
  ).then((markup) => {
    const emotionChunks = extractCriticalToChunks(markup);
    const emotionStyleTags = constructStyleTagsFromChunks(emotionChunks);
    const html = injectIntoHead(markup, emotionStyleTags);

    responseHeaders.set("Content-Type", "text/html");

    return new Response(html, {
      headers: responseHeaders,
      status: responseStatusCode,
    });
  });
}

function renderMarkupToString(
  element: ReactElement,
  readyOption: keyof RenderToPipeableStreamOptions,
  onRenderError: (error: unknown) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let shellRendered = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const body = new PassThrough();

    body.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    body.on("end", () => {
      clearTimeout(timeoutId);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    body.on("error", reject);

    const { abort, pipe } = renderToPipeableStream(element, {
      [readyOption]() {
        shellRendered = true;
        pipe(body);
      },
      onShellError(error: unknown) {
        clearTimeout(timeoutId);
        reject(error);
      },
      onError(error: unknown) {
        if (shellRendered) {
          onRenderError(error);
        }
      },
    });

    timeoutId = setTimeout(() => abort(), streamTimeout + 1000);
  });
}

function injectIntoHead(markup: string, content: string): string {
  return markup.replace("</head>", `${content}</head>`);
}
