import LoginIcon from "@mui/icons-material/Login";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "@repo/ui/loading-button";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
  useAuthSession,
  useSignInWithEmail,
} from "../application/auth-session";
import type { AuthRepository } from "../domain/auth-repository";

interface LoginPageProps {
  client: AuthRepository;
}

export function LoginPage({ client }: LoginPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useAuthSession(client);
  const signInMutation = useSignInWithEmail(client);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const trimmedEmail = email.trim();
  const canSubmit = trimmedEmail.length > 0 && password.length > 0;
  const showEmailError = hasSubmitted && !trimmedEmail;
  const showPasswordError = hasSubmitted && !password;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (!canSubmit) {
      return;
    }

    try {
      await signInMutation.mutateAsync({
        email: trimmedEmail,
        password,
      });
    } catch {
      return;
    }

    await session.refetch();
    navigate("/dashboard", { replace: true });
  }

  return (
    <Box component="main" sx={loginRootSx}>
      <Paper
        component="form"
        onSubmit={(event) => void handleSubmit(event)}
        sx={loginPanelSx}
      >
        <Stack spacing={3}>
          <Stack spacing={0.75}>
            <Typography variant="h1">{t("auth.login.title")}</Typography>
            <Typography color="text.secondary" variant="body1">
              {t("auth.login.subtitle")}
            </Typography>
          </Stack>

          {signInMutation.error ? (
            <Alert severity="error" variant="outlined">
              {t("auth.login.error")}
            </Alert>
          ) : null}

          <Stack spacing={1.25}>
            <TextField
              autoComplete="email"
              autoFocus
              error={showEmailError}
              helperText={showEmailError ? t("auth.login.emailRequired") : null}
              label={t("auth.login.email")}
              onChange={(event) => setEmail(event.target.value)}
              sx={loginTextFieldSx}
              type="email"
              value={email}
            />
            <TextField
              autoComplete="current-password"
              error={showPasswordError}
              helperText={
                showPasswordError ? t("auth.login.passwordRequired") : null
              }
              label={t("auth.login.password")}
              onChange={(event) => setPassword(event.target.value)}
              sx={loginTextFieldSx}
              type="password"
              value={password}
            />

            <Stack
              direction={{ sm: "row", xs: "column" }}
              spacing={1}
              sx={loginActionsSx}
            >
              <LoadingButton
                isLoading={signInMutation.isPending || session.isRefetching}
                startIcon={<LoginIcon />}
                type="submit"
                variant="contained"
              >
                {t("auth.login.submit")}
              </LoadingButton>
              <Button disabled variant="outlined">
                {t("auth.login.createAccount")}
              </Button>
            </Stack>
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

const loginTextFieldSx = {
  "& .MuiFormHelperText-root": {
    mt: 0.5,
  },
};

const loginActionsSx = {
  pt: 0.25,
  "& > *": {
    flex: 1,
  },
};
