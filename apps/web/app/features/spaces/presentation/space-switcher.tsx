import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import { LoadingButton } from "@repo/ui/loading-button";
import { useTranslation } from "react-i18next";

import { useActiveSpace } from "./active-space-provider";
import { SpaceSelectOptionLabel } from "./space-select-option-label";

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

  if (spaces.length === 1) {
    return null;
  }

  const selectedSpace =
    spaces.find((space) => space.id === activeSpaceId) ?? null;

  return (
    <Box sx={{ pb: 1.25 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="active-space-select-label">
          {t("spaces.switcher.label")}
        </InputLabel>
        <Select
          id="active-space-select"
          label={t("spaces.switcher.label")}
          labelId="active-space-select-label"
          onChange={(event) => selectSpace(event.target.value)}
          renderValue={() =>
            selectedSpace ? (
              <SpaceSelectOptionLabel space={selectedSpace} />
            ) : (
              ""
            )
          }
          value={activeSpaceId ?? ""}
        >
          {spaces.map((space) => (
            <MenuItem key={space.id} value={space.id}>
              <SpaceSelectOptionLabel space={space} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
