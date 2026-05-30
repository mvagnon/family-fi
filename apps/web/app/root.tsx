import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { fontPreloadLinks } from "@repo/ui/font-preloads";
import { appTheme } from "@repo/ui/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";

import type { Route } from "./+types/root";
import { LanguagePreferenceProvider } from "./features/configuration/application/language-preference-provider";
import { browserLanguagePreferenceRepository } from "./features/configuration/infrastructure/browser-language-preference-repository";
import i18n, { defaultLanguage, type SupportedLanguage } from "./i18n";
import "./app.css";

export const links: Route.LinksFunction = () => [...fontPreloadLinks];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18n.resolvedLanguage ?? i18n.language ?? defaultLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <LanguagePreferenceProvider
          onLanguageChange={syncAppLanguage}
          repository={browserLanguagePreferenceRepository}
        >
          <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <Outlet />
          </ThemeProvider>
        </LanguagePreferenceProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

function syncAppLanguage(language: SupportedLanguage) {
  if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
