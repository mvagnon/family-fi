import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateDefaultSpace } from "../application/space-queries";
import type { SpaceRepository } from "../domain/space-repository";
import { useActiveSpace } from "./active-space-provider";
import { SpaceSelectOptionLabel } from "./space-select-option-label";

interface DefaultSpaceSettingsProps {
  repository: SpaceRepository;
}

export function DefaultSpaceSettings({
  repository,
}: DefaultSpaceSettingsProps) {
  const { t } = useTranslation();
  const { defaultSpaceId, error, isFetching, isPending, refetch, spaces } =
    useActiveSpace();
  const updateDefaultSpace = useUpdateDefaultSpace(repository);
  const persistedDefaultSpaceId = useMemo(
    () =>
      defaultSpaceId && spaces.some((space) => space.id === defaultSpaceId)
        ? defaultSpaceId
        : "",
    [defaultSpaceId, spaces],
  );
  const [selectedSpaceId, setSelectedSpaceId] = useState(
    persistedDefaultSpaceId,
  );

  useEffect(() => {
    setSelectedSpaceId(persistedDefaultSpaceId);
  }, [persistedDefaultSpaceId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSpaceId || selectedSpaceId === persistedDefaultSpaceId) {
      return;
    }

    try {
      await updateDefaultSpace.mutateAsync({
        defaultSpaceId: selectedSpaceId,
      });
    } catch {
      // Mutation state drives the snackbar; the submit handler must not leak a rejected promise.
    }
  }

  return (
    <>
      <SectionPanel
        contentSx={{ p: { md: 2.5, xs: 2 }, pt: 0 }}
        subtitle={t("configuration.defaultSpace.description")}
        title={t("configuration.defaultSpace.title")}
        titleId="configuration-default-space-title"
      >
        {isPending ? (
          <Stack
            aria-label={t("configuration.defaultSpace.loading")}
            spacing={1.5}
          >
            <Skeleton height={40} variant="rounded" />
            <Skeleton height={36} width={120} />
          </Stack>
        ) : error ? (
          <Stack spacing={1.5}>
            <Alert severity="error" variant="outlined">
              {t("configuration.defaultSpace.error")}
            </Alert>
            <LoadingButton
              isLoading={isFetching}
              onClick={refetch}
              startIcon={<RefreshIcon />}
              variant="outlined"
            >
              {t("common.retry")}
            </LoadingButton>
          </Stack>
        ) : spaces.length === 0 ? (
          <Alert severity="info" variant="outlined">
            {t("configuration.defaultSpace.empty")}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="default-space-select-label">
                  {t("configuration.defaultSpace.label")}
                </InputLabel>
                <Select
                  id="default-space-select"
                  label={t("configuration.defaultSpace.label")}
                  labelId="default-space-select-label"
                  onChange={(event) => setSelectedSpaceId(event.target.value)}
                  value={selectedSpaceId}
                >
                  <MenuItem disabled value="">
                    {t("configuration.defaultSpace.placeholder")}
                  </MenuItem>
                  {spaces.map((space) => (
                    <MenuItem key={space.id} value={space.id}>
                      <SpaceSelectOptionLabel space={space} variant="body1" />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LoadingButton
                disabled={
                  !selectedSpaceId ||
                  selectedSpaceId === persistedDefaultSpaceId
                }
                isLoading={updateDefaultSpace.isPending}
                type="submit"
                variant="contained"
              >
                {t("common.save")}
              </LoadingButton>
            </Stack>
          </Box>
        )}
      </SectionPanel>
      <FeedbackSnackbar
        message={
          updateDefaultSpace.error
            ? t("configuration.defaultSpace.saveError")
            : undefined
        }
      />
    </>
  );
}
