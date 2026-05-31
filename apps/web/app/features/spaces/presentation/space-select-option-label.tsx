import GppGoodIcon from "@mui/icons-material/GppGood";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import type { SpaceSummary } from "../domain/spaces";

interface SpaceSelectOptionLabelProps {
  space: SpaceSummary;
  variant?: "body1" | "body2";
}

export function SpaceSelectOptionLabel({
  space,
  variant = "body2",
}: SpaceSelectOptionLabelProps) {
  const { t } = useTranslation();
  const isOwner = space.role === "owner";

  return (
    <Box sx={spaceOptionLabelSx}>
      <Typography noWrap sx={spaceOptionTextSx} variant={variant}>
        {getSpaceLabel(space, t)}
      </Typography>
      {isOwner ? (
        <Tooltip title={t("spaces.switcher.ownerIndicator")}>
          <GppGoodIcon
            aria-label={t("spaces.switcher.ownerIndicator")}
            sx={spaceOwnerIconSx}
          />
        </Tooltip>
      ) : null}
    </Box>
  );
}

function getSpaceLabel(space: SpaceSummary, t: TFunction): string {
  if (space.role === "owner") {
    return t("spaces.switcher.personalSpace");
  }

  return t("spaces.switcher.externalSpace", {
    email: space.ownerEmail,
  });
}

const spaceOptionLabelSx = {
  alignItems: "center",
  color: "text.primary",
  display: "inline-flex",
  gap: 0.75,
  maxWidth: "100%",
  minWidth: 0,
  verticalAlign: "middle",
};

const spaceOptionTextSx = {
  flex: "0 1 auto",
  minWidth: 0,
};

const spaceOwnerIconSx = {
  color: "inherit",
  flex: "0 0 auto",
  fontSize: 15,
};
