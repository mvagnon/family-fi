import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { PageShell } from "@repo/ui/page-shell";
import { SectionPanel } from "@repo/ui/section-panel";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { useLanguagePreference } from "../application/language-preference-provider";
import { parseSupportedLanguage } from "../domain/language-preference";
import {
  supportedLanguages,
  type SupportedLanguage,
} from "../domain/supported-language";
import { FamilySidebarNavigation } from "../../family/presentation/family-sidebar-navigation";

export function ConfigurationPage() {
  const { t } = useTranslation();
  const {
    activeLanguage,
    browserLanguage,
    hasExplicitLanguage,
    resetLanguage,
    setLanguage,
    source,
  } = useLanguagePreference();
  const browserLanguageLabel = t(
    `configuration.languages.${browserLanguage}.label`,
  );

  function handleLanguageChange(event: ChangeEvent<HTMLInputElement>) {
    const language = parseSupportedLanguage(event.target.value);

    if (language) {
      setLanguage(language);
    }
  }

  return (
    <PageShell
      navigation={<FamilySidebarNavigation />}
      subtitle={t("configuration.page.subtitle")}
      title={t("configuration.page.title")}
    >
      <SectionPanel
        action={
          <Chip
            color={source === "explicit" ? "primary" : "default"}
            label={t(`configuration.language.source.${source}`)}
            size="small"
            variant={source === "explicit" ? "filled" : "outlined"}
          />
        }
        contentSx={{ p: { md: 2.5, xs: 2 }, pt: 0 }}
        subtitle={t("configuration.language.subtitle")}
        title={t("configuration.language.title")}
        titleId="configuration-language-title"
      >
        <Stack spacing={2.5}>
          <Typography color="text.secondary" variant="body1">
            {t("configuration.language.description")}
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              aria-label={t("configuration.language.ariaLabel")}
              name="configuration-language"
              onChange={handleLanguageChange}
              sx={{ gap: 1 }}
              value={activeLanguage}
            >
              {supportedLanguages.map((language) => (
                <FormControlLabel
                  control={<Radio />}
                  key={language}
                  label={<LanguageOptionLabel language={language} />}
                  sx={getLanguageOptionSx(activeLanguage === language)}
                  value={language}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Stack
            direction={{ sm: "row", xs: "column" }}
            spacing={1.5}
            sx={{
              alignItems: { sm: "center", xs: "stretch" },
              justifyContent: "space-between",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              {t(
                hasExplicitLanguage
                  ? "configuration.language.browserDetected"
                  : "configuration.language.browserActive",
                { language: browserLanguageLabel },
              )}
            </Typography>
            <Button
              disabled={!hasExplicitLanguage}
              onClick={resetLanguage}
              startIcon={<RestartAltIcon />}
              variant="outlined"
            >
              {t("configuration.language.reset")}
            </Button>
          </Stack>
        </Stack>
      </SectionPanel>
    </PageShell>
  );
}

function LanguageOptionLabel({ language }: { language: SupportedLanguage }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body1">
        {t(`configuration.languages.${language}.label`)}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {t(`configuration.languages.${language}.native`)}
      </Typography>
    </Box>
  );
}

function getLanguageOptionSx(isActive: boolean): SxProps<Theme> {
  return (theme) => ({
    alignItems: "flex-start",
    border: 1,
    borderColor: isActive ? "primary.main" : "divider",
    borderRadius: 1,
    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : "transparent",
    m: 0,
    px: 1.25,
    py: 1,
    transition: theme.transitions.create(["background-color", "border-color"], {
      duration: theme.transitions.duration.shortest,
    }),
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, isActive ? 0.08 : 0.04),
      borderColor: isActive ? "primary.main" : "text.secondary",
    },
    "& .MuiFormControlLabel-label": {
      minWidth: 0,
      width: "100%",
    },
    "& .MuiRadio-root": {
      pt: 0.25,
    },
  });
}
