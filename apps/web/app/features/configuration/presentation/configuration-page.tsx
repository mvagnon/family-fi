import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { SectionPanel } from "@repo/ui/section-panel";
import {
  useState,
  type ChangeEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { useTranslation } from "react-i18next";

import {
  AppShellContent,
  AppShellHeader,
} from "../../app-shell/presentation/app-shell-layout";
import type { SpaceRepository } from "../../spaces/domain/space-repository";
import { CurrencySettings } from "../../spaces/presentation/currency-settings";
import { DefaultSpaceSettings } from "../../spaces/presentation/default-space-settings";
import { SpaceUsersSettings } from "../../spaces/presentation/space-users-settings";
import { parseSupportedLanguage } from "../domain/language-preference";
import {
  supportedLanguages,
  type SupportedLanguage,
} from "../domain/supported-language";
import { useLanguagePreference } from "./language-preference-provider";

const browserLanguageChoice = "browser";

type LanguageChoice = SupportedLanguage | typeof browserLanguageChoice;
type ConfigurationTab = "user" | "space";

interface ConfigurationPageProps {
  spaceRepository: SpaceRepository;
}

export function ConfigurationPage({ spaceRepository }: ConfigurationPageProps) {
  const { t } = useTranslation();
  const {
    activeLanguage,
    browserLanguage,
    hasExplicitLanguage,
    resetLanguage,
    setLanguage,
  } = useLanguagePreference();
  const [activeTab, setActiveTab] = useState<ConfigurationTab>("user");
  const browserLanguageLabel = t(
    `configuration.languages.${browserLanguage}.label`,
  );
  const selectedLanguageChoice: LanguageChoice = hasExplicitLanguage
    ? activeLanguage
    : browserLanguageChoice;

  function handleLanguageChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value === browserLanguageChoice) {
      resetLanguage();
      return;
    }

    const language = parseSupportedLanguage(event.target.value);

    if (language) {
      setLanguage(language);
    }
  }

  function handleTabChange(_: SyntheticEvent, value: string) {
    if (value === "user" || value === "space") {
      setActiveTab(value);
    }
  }

  return (
    <>
      <AppShellHeader
        subtitle={t("configuration.page.subtitle")}
        title={t("configuration.page.title")}
      />
      <AppShellContent>
        <Stack spacing={2.5}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              aria-label={t("configuration.tabs.ariaLabel")}
              onChange={handleTabChange}
              value={activeTab}
              variant="scrollable"
            >
              <Tab
                aria-controls="configuration-user-settings-panel"
                id="configuration-user-settings-tab"
                label={t("configuration.tabs.user")}
                value="user"
              />
              <Tab
                aria-controls="configuration-space-settings-panel"
                id="configuration-space-settings-tab"
                label={t("configuration.tabs.space")}
                value="space"
              />
            </Tabs>
          </Box>

          <ConfigurationTabPanel
            activeTab={activeTab}
            labelledBy="configuration-user-settings-tab"
            panelId="configuration-user-settings-panel"
            tab="user"
          >
            <SectionPanel
              contentSx={{ p: { md: 2.5, xs: 2 }, pt: 0 }}
              subtitle={t("configuration.language.description")}
              title={t("configuration.language.title")}
              titleId="configuration-language-title"
            >
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  aria-label={t("configuration.language.ariaLabel")}
                  name="configuration-language"
                  onChange={handleLanguageChange}
                  sx={{ gap: 1 }}
                  value={selectedLanguageChoice}
                >
                  <FormControlLabel
                    control={<Radio />}
                    label={
                      <BrowserLanguageOptionLabel
                        browserLanguageLabel={browserLanguageLabel}
                      />
                    }
                    sx={getLanguageOptionSx(
                      selectedLanguageChoice === browserLanguageChoice,
                    )}
                    value={browserLanguageChoice}
                  />
                  {supportedLanguages.map((language) => (
                    <FormControlLabel
                      control={<Radio />}
                      key={language}
                      label={<LanguageOptionLabel language={language} />}
                      sx={getLanguageOptionSx(
                        selectedLanguageChoice === language,
                      )}
                      value={language}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </SectionPanel>
            <DefaultSpaceSettings repository={spaceRepository} />
          </ConfigurationTabPanel>

          <ConfigurationTabPanel
            activeTab={activeTab}
            labelledBy="configuration-space-settings-tab"
            panelId="configuration-space-settings-panel"
            tab="space"
          >
            <Alert severity="info" variant="standard">
              {t("configuration.spaceSettings.scope")}
            </Alert>
            <CurrencySettings repository={spaceRepository} />
            <SpaceUsersSettings repository={spaceRepository} />
          </ConfigurationTabPanel>
        </Stack>
      </AppShellContent>
    </>
  );
}

function ConfigurationTabPanel({
  activeTab,
  children,
  labelledBy,
  panelId,
  tab,
}: {
  activeTab: ConfigurationTab;
  children: ReactNode;
  labelledBy: string;
  panelId: string;
  tab: ConfigurationTab;
}) {
  const isActive = activeTab === tab;

  return (
    <Box
      aria-labelledby={labelledBy}
      hidden={!isActive}
      id={panelId}
      role="tabpanel"
    >
      {isActive ? <Stack spacing={2.5}>{children}</Stack> : null}
    </Box>
  );
}

function BrowserLanguageOptionLabel({
  browserLanguageLabel,
}: {
  browserLanguageLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body1">{browserLanguageLabel}</Typography>
      <Typography color="text.secondary" variant="body2">
        {t("configuration.language.browserDetected")}
      </Typography>
    </Box>
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
  });
}
