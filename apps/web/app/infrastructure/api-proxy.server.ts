import { normalizeHttpOrigin } from "./http-url";

interface ProxyApiRequestOptions {
  request: Request;
  upstreamOrigin: string;
}

type RequestInitWithDuplex = RequestInit & {
  duplex?: "half";
};

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "keep-alive",
  "host",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const RESPONSE_HEADERS_TO_DROP = new Set([
  ...HOP_BY_HOP_HEADERS,
  "content-encoding",
]);

export async function proxyApiRequest({
  request,
  upstreamOrigin,
}: ProxyApiRequestOptions): Promise<Response> {
  const requestUrl = new URL(request.url);
  const targetUrl = new URL(
    `${requestUrl.pathname}${requestUrl.search}`,
    normalizeHttpOrigin(upstreamOrigin),
  );
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : request.body;
  const init: RequestInitWithDuplex = {
    body,
    headers: createRequestHeaders(request, requestUrl),
    method: request.method,
    redirect: "manual",
  };

  if (body) {
    init.duplex = "half";
  }

  const upstreamResponse = await fetch(targetUrl, init);
  const headers = createResponseHeaders({
    requestOrigin: requestUrl.origin,
    upstreamOrigin: targetUrl.origin,
    upstreamResponse,
  });

  return new Response(upstreamResponse.body, {
    headers,
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  });
}

function createRequestHeaders(request: Request, requestUrl: URL): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.append(key, value);
    }
  });

  headers.set("x-forwarded-host", requestUrl.host);
  headers.set("x-forwarded-proto", requestUrl.protocol.replace(":", ""));

  return headers;
}

function createResponseHeaders(input: {
  requestOrigin: string;
  upstreamOrigin: string;
  upstreamResponse: Response;
}): Headers {
  const headers = new Headers();

  input.upstreamResponse.headers.forEach((value, key) => {
    if (!RESPONSE_HEADERS_TO_DROP.has(key.toLowerCase())) {
      headers.append(key, value);
    }
  });

  const setCookies = (
    input.upstreamResponse.headers as HeadersWithSetCookie
  ).getSetCookie?.();

  if (setCookies?.length) {
    headers.delete("set-cookie");

    for (const setCookie of setCookies) {
      headers.append("set-cookie", setCookie);
    }
  }

  const location = headers.get("location");

  if (location) {
    headers.set(
      "location",
      rewriteLocation(location, input.requestOrigin, input.upstreamOrigin),
    );
  }

  return headers;
}

function rewriteLocation(
  location: string,
  requestOrigin: string,
  upstreamOrigin: string,
): string {
  try {
    const locationUrl = new URL(location, upstreamOrigin);

    if (locationUrl.origin !== upstreamOrigin) {
      return location;
    }

    return new URL(
      `${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`,
      requestOrigin,
    ).toString();
  } catch {
    return location;
  }
}
