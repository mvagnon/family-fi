import LoginIcon from "@mui/icons-material/Login";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { useSignInWithLogto } from "~/features/auth/application/auth-session";
import { authClient } from "~/features/auth/infrastructure/auth-client";

export default function SignedOutRoute() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const signIn = useSignInWithLogto(authClient);
  const hasAuthError = searchParams.get("auth_error") === "1";

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        bgcolor: "background.default",
        color: "text.primary",
        display: "grid",
        minHeight: "100vh",
        p: 3,
        placeItems: "center",
      }}
    >
      <Stack spacing={2.5} sx={{ maxWidth: 420, width: "100%" }}>
        <Typography component="h1" variant="h5">
          {hasAuthError
            ? t("auth.signedOut.errorTitle")
            : t("auth.signedOut.title")}
        </Typography>
        {hasAuthError ? (
          <Alert severity="error">{t("auth.signedOut.errorDescription")}</Alert>
        ) : (
          <Typography color="text.secondary" variant="body2">
            {t("auth.signedOut.description")}
          </Typography>
        )}
        <Button
          loading={signIn.isPending}
          loadingPosition="start"
          onClick={() => signIn.mutate()}
          startIcon={<LoginIcon />}
          variant="contained"
        >
          {t("auth.signedOut.signIn")}
        </Button>
      </Stack>
    </Box>
  );
}
