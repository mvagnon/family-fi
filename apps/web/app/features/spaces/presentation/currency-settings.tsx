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

import { useUpdateSpaceCurrency } from "../application/space-queries";
import type { SpaceRepository } from "../domain/space-repository";
import {
  defaultSpaceCurrency,
  supportedCurrencyCodes,
  supportedCurrencySchema,
  type SupportedCurrency,
} from "../domain/spaces";
import { useActiveSpace } from "./active-space-provider";

interface CurrencySettingsProps {
  repository: SpaceRepository;
}

export function CurrencySettings({ repository }: CurrencySettingsProps) {
  const { i18n, t } = useTranslation();
  const { activeSpace, error, isFetching, isPending, refetch } =
    useActiveSpace();
  const updateSpaceCurrency = useUpdateSpaceCurrency(repository);
  const persistedCurrencyCode =
    activeSpace?.currencyCode ?? defaultSpaceCurrency;
  const [selectedCurrencyCode, setSelectedCurrencyCode] =
    useState<SupportedCurrency>(persistedCurrencyCode);
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const currencyOptions = useMemo(
    () =>
      supportedCurrencyCodes.map((currencyCode) => ({
        currencyCode,
        label: getCurrencyOptionLabel(currencyCode, locale),
      })),
    [locale],
  );

  useEffect(() => {
    setSelectedCurrencyCode(persistedCurrencyCode);
  }, [persistedCurrencyCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeSpace || selectedCurrencyCode === persistedCurrencyCode) {
      return;
    }

    try {
      await updateSpaceCurrency.mutateAsync({
        input: {
          currencyCode: selectedCurrencyCode,
        },
        spaceId: activeSpace.id,
      });
    } catch {
      // Mutation state drives the snackbar; the submit handler must not leak a rejected promise.
    }
  }

  return (
    <>
      <SectionPanel
        contentSx={{ p: { md: 2.5, xs: 2 }, pt: 0 }}
        subtitle={t("configuration.currency.description")}
        title={t("configuration.currency.title")}
        titleId="configuration-currency-title"
      >
        {isPending ? (
          <Stack aria-label={t("configuration.currency.loading")} spacing={1.5}>
            <Skeleton height={40} variant="rounded" />
            <Skeleton height={36} width={120} />
          </Stack>
        ) : error ? (
          <Stack spacing={1.5}>
            <Alert severity="error" variant="outlined">
              {t("configuration.currency.error")}
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
        ) : !activeSpace ? (
          <Alert severity="info" variant="outlined">
            {t("configuration.currency.empty")}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="space-currency-select-label">
                  {t("configuration.currency.label")}
                </InputLabel>
                <Select
                  id="space-currency-select"
                  label={t("configuration.currency.label")}
                  labelId="space-currency-select-label"
                  onChange={(event) =>
                    setSelectedCurrencyCode(
                      parseCurrencySelection(
                        event.target.value,
                        selectedCurrencyCode,
                      ),
                    )
                  }
                  value={selectedCurrencyCode}
                >
                  {currencyOptions.map((option) => (
                    <MenuItem
                      key={option.currencyCode}
                      value={option.currencyCode}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LoadingButton
                disabled={selectedCurrencyCode === persistedCurrencyCode}
                isLoading={updateSpaceCurrency.isPending}
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
          updateSpaceCurrency.error
            ? t("configuration.currency.saveError")
            : undefined
        }
      />
    </>
  );
}

function parseCurrencySelection(
  value: string,
  fallback: SupportedCurrency,
): SupportedCurrency {
  const result = supportedCurrencySchema.safeParse(value);

  return result.success ? result.data : fallback;
}

function getCurrencyOptionLabel(
  currencyCode: SupportedCurrency,
  locale: string,
): string {
  const displayName = getCurrencyDisplayName(currencyCode, locale);

  return `${currencyCode} - ${displayName}`;
}

function getCurrencyDisplayName(
  currencyCode: SupportedCurrency,
  locale: string,
): string {
  try {
    return (
      new Intl.DisplayNames([locale], {
        type: "currency",
      }).of(currencyCode) ?? currencyCode
    );
  } catch {
    return currencyCode;
  }
}
