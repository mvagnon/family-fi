import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import type { AssignableSpaceRole } from "../domain/spaces";

interface SpaceUserRoleSelectProps {
  disabled?: boolean;
  label?: string;
  onChange: (role: AssignableSpaceRole) => void;
  size?: "small" | "medium";
  value: AssignableSpaceRole;
}

export function SpaceUserRoleSelect({
  disabled = false,
  label,
  onChange,
  size = "small",
  value,
}: SpaceUserRoleSelectProps) {
  const { t } = useTranslation();
  const generatedLabelId = useId();
  const selectLabel = label ?? t("configuration.spaceUsers.role");

  return (
    <FormControl fullWidth size={size}>
      <InputLabel id={generatedLabelId}>{selectLabel}</InputLabel>
      <Select
        disabled={disabled}
        label={selectLabel}
        labelId={generatedLabelId}
        onChange={(event) => {
          if (event.target.value === "read" || event.target.value === "write") {
            onChange(event.target.value);
          }
        }}
        value={value}
      >
        <MenuItem value="read">{t("spaces.roles.read")}</MenuItem>
        <MenuItem value="write">{t("spaces.roles.write")}</MenuItem>
      </Select>
    </FormControl>
  );
}
