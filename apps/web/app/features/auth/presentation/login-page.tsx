import LoginIcon from "@mui/icons-material/Login";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "@repo/ui/loading-button";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useSignInWithHub } from "../application/auth-session";
import type { AuthRepository } from "../domain/auth-repository";

interface LoginPageProps {
  client: AuthRepository;
}

export function LoginPage({ client }: LoginPageProps) {
  const { t } = useTranslation();
  const signInMutation = useSignInWithHub(client);
  const { error, isPending, mutate, mutateAsync } = signInMutation;
  const hasStartedRedirect = useRef(false);

  useEffect(() => {
    if (hasStartedRedirect.current) {
      return;
    }

    hasStartedRedirect.current = true;
    mutate();
  }, [mutate]);

  return (
    <Box component="main" sx={loginRootSx}>
      <Paper aria-busy={isPending} sx={loginPanelSx}>
        <Stack spacing={3}>
          <Stack spacing={0.75}>
            <Typography variant="h1">{t("auth.login.title")}</Typography>
            <Typography color="text.secondary" variant="body1">
              {t("auth.login.subtitle")}
            </Typography>
          </Stack>

          {error ? (
            <Alert severity="error" variant="outlined">
              {t("auth.login.ssoError")}
            </Alert>
          ) : null}

          <Stack spacing={2} sx={{ alignItems: "center" }}>
            {isPending ? (
              <CircularProgress
                aria-label={t("auth.login.redirecting")}
                size={28}
              />
            ) : null}
            <LoadingButton
              isLoading={isPending}
              onClick={() => void mutateAsync()}
              startIcon={<LoginIcon />}
              variant="contained"
            >
              {t("auth.login.continueWithHub")}
            </LoadingButton>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

const loginRootSx = {
  alignItems: "center",
  bgcolor: "background.default",
  display: "grid",
  minHeight: "100vh",
  px: { md: 3, xs: 2 },
  py: { md: 4, xs: 2 },
};

const loginPanelSx = {
  mx: "auto",
  p: { md: 4, xs: 3 },
  width: "min(100%, 440px)",
};
