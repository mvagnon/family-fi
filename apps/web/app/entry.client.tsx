import { startTransition, StrictMode } from "react";
import { CacheProvider } from "@emotion/react";
import { createEmotionCache } from "@repo/ui/create-emotion-cache";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

const emotionCache = createEmotionCache();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <CacheProvider value={emotionCache}>
        <HydratedRouter />
      </CacheProvider>
    </StrictMode>,
  );
});
