import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "@repo/ui/loading-button";
import { useTranslation } from "react-i18next";

import type { SpaceSummary } from "../domain/spaces";
import { useActiveSpace } from "./active-space-provider";

export function SpaceSwitcher() {
  const { t } = useTranslation();
  const {
    activeSpaceId,
    error,
    isFetching,
    isPending,
    refetch,
    selectSpace,
    spaces,
  } = useActiveSpace();

  if (isPending) {
    return (
      <Box aria-label={t("spaces.switcher.loading")} sx={{ pb: 1.25 }}>
        <Skeleton height={40} variant="rounded" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pb: 1.25 }}>
        <Alert severity="warning" sx={{ mb: 1 }} variant="outlined">
          {t("spaces.switcher.error")}
        </Alert>
        <LoadingButton
          fullWidth
          isLoading={isFetching}
          onClick={refetch}
          size="small"
          startIcon={<RefreshIcon />}
          variant="outlined"
        >
          {t("common.retry")}
        </LoadingButton>
      </Box>
    );
  }

  if (spaces.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 1.25 }} variant="outlined">
        {t("spaces.switcher.empty")}
      </Alert>
    );
  }

  return (
    <Box sx={{ pb: 1.25 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="active-space-select-label">
          {t("spaces.switcher.label")}
        </InputLabel>
        <Select
          disabled={spaces.length < 2 || isFetching}
          id="active-space-select"
          label={t("spaces.switcher.label")}
          labelId="active-space-select-label"
          onChange={(event) => selectSpace(event.target.value)}
          value={activeSpaceId ?? ""}
        >
          {spaces.map((space) => (
            <MenuItem key={space.id} value={space.id}>
              <SpaceOptionLabel space={space} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

function SpaceOptionLabel({ space }: { space: SpaceSummary }) {
  const { t } = useTranslation();

  return (
    <ListItemText
      primary={
        <Typography noWrap variant="body2">
          {space.name}
        </Typography>
      }
      secondary={
        <Typography color="text.secondary" noWrap variant="caption">
          {t(`spaces.roles.${space.role}`)}
        </Typography>
      }
    />
  );
}
