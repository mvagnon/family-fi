import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useAuthSession, useSignOut } from "../application/auth-session";
import type { AuthUser } from "../domain/auth";
import type { AuthRepository } from "../domain/auth-repository";

interface AccountMenuProps {
  repository: AuthRepository;
}

export function AccountMenu({ repository }: AccountMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useAuthSession(repository);
  const signOut = useSignOut(repository);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  if (session.isPending) {
    return <AccountMenuSkeleton />;
  }

  if (!session.user) {
    return null;
  }

  const userLabel = getUserLabel(session.user);

  async function handleSignOut() {
    setAnchorEl(null);

    try {
      await signOut.mutateAsync();
      navigate("/login", { replace: true });
    } catch {
      // Mutation state drives the snackbar; the click handler must not leak a rejected promise.
    }
  }

  return (
    <>
      <Box sx={accountMenuRootSx}>
        <ButtonBase
          aria-controls={isMenuOpen ? "account-actions-menu" : undefined}
          aria-expanded={isMenuOpen ? "true" : undefined}
          aria-haspopup="menu"
          aria-label={t("auth.account.openMenu")}
          disabled={signOut.isPending}
          onClick={(event: MouseEvent<HTMLElement>) =>
            setAnchorEl(event.currentTarget)
          }
          sx={accountButtonSx}
        >
          <Avatar
            alt={userLabel}
            src={session.user.image ?? undefined}
            sx={{ height: 34, width: 34 }}
          >
            {getUserInitials(session.user)}
          </Avatar>
          <Box sx={{ minWidth: 0, textAlign: "left" }}>
            <Typography noWrap variant="body2">
              {userLabel}
            </Typography>
            <Typography color="text.secondary" noWrap variant="caption">
              {session.user.email}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon
            fontSize="small"
            sx={{
              color: "text.secondary",
              ml: "auto",
              transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: (theme) =>
                theme.transitions.create("transform", {
                  duration: theme.transitions.duration.shortest,
                }),
            }}
          />
        </ButtonBase>
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          id="account-actions-menu"
          onClose={() => setAnchorEl(null)}
          open={isMenuOpen}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <MenuItem
            disabled={signOut.isPending}
            onClick={() => void handleSignOut()}
          >
            <ListItemIcon>
              {signOut.isPending ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <LogoutIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{t("auth.account.signOut")}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      <FeedbackSnackbar
        message={signOut.error ? t("auth.account.signOutError") : undefined}
      />
    </>
  );
}

function AccountMenuSkeleton() {
  return (
    <Box sx={accountMenuRootSx}>
      <Box sx={accountButtonSx}>
        <Skeleton height={34} variant="circular" width={34} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton height={18} width="70%" />
          <Skeleton height={16} width="90%" />
        </Box>
      </Box>
    </Box>
  );
}

function getUserLabel(user: AuthUser): string {
  const name = user.name.trim();

  return name || user.email;
}

function getUserInitials(user: AuthUser): string {
  const label = getUserLabel(user);
  const words = label.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }

  return label.slice(0, 2).toUpperCase();
}

const accountMenuRootSx = {
  borderTop: 1,
  borderColor: "divider",
  mt: 1.25,
  pt: 1.25,
};

const accountButtonSx = (theme: Theme) => ({
  alignItems: "center",
  borderRadius: 1,
  display: "flex",
  gap: 1,
  minHeight: 48,
  px: 1,
  py: 0.75,
  textAlign: "left",
  width: "100%",
  "&:hover": {
    bgcolor: alpha(theme.palette.primary.main, 0.05),
  },
  "&.Mui-disabled": {
    opacity: 0.7,
  },
});
