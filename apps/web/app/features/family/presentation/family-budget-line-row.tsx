import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { alpha } from "@mui/material/styles";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { useTranslation } from "react-i18next";

import type { FamilyBudgetLine } from "../domain/family-budget";
import type { RecurringLine } from "../domain/family";
import type { GeneratedFamilyBudgetLine } from "../domain/family-generated-recurring-lines";
import { getFamilyBudgetLineTitle } from "./family-budget-line-title";
import { familyBudgetTableGridColumns } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

interface FamilyBudgetLineRowProps {
  disabled: boolean;
  line: FamilyBudgetLine;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onToggleGeneratedLine: (line: GeneratedFamilyBudgetLine) => void;
  onViewBudgetLine?: (line: FamilyBudgetLine) => void;
  onViewLine?: (line: RecurringLine) => void;
}

export function FamilyBudgetLineRow({
  disabled,
  line,
  onDeleteLine,
  onEditLine,
  onToggleGeneratedLine,
  onViewBudgetLine,
  onViewLine,
}: FamilyBudgetLineRowProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const recurringLine = line.line;
  const isGenerated = line.kind === "generated";
  const isGeneratedDisabled = isGenerated && !line.isEnabled;
  const lineTitle = getFamilyBudgetLineTitle(line, t);

  function handleLineClick() {
    if (!disabled) {
      if (onViewBudgetLine) {
        onViewBudgetLine(line);
      } else {
        onViewLine?.(recurringLine);
      }
    }
  }

  return (
    <TableRow aria-disabled={disabled || undefined}>
      <TableCell colSpan={4} sx={{ p: 0 }}>
        <ButtonBase
          aria-label={t("family.line.viewLabel", {
            title: lineTitle,
          })}
          disabled={disabled}
          onClick={handleLineClick}
          sx={(theme) => ({
            borderRadius: 0,
            color: "inherit",
            display: "grid",
            gridTemplateColumns: familyBudgetTableGridColumns,
            justifyItems: "stretch",
            opacity: isGeneratedDisabled ? 0.56 : 1,
            textAlign: "left",
            transition: "background-color 150ms ease",
            width: "100%",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          })}
        >
          <Box sx={{ minWidth: 0, px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }}>{lineTitle}</Typography>
            <Typography
              sx={(theme) => ({
                color: alpha(theme.palette.text.secondary, 0.76),
                display: "-webkit-box",
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
              })}
              variant="body2"
            >
              {recurringLine.description}
            </Typography>
          </Box>
          <Box sx={{ alignSelf: "center", px: 2, py: 1.5 }}>
            {familyFormat.formatLineAmount(recurringLine)}
          </Box>
          <Box sx={{ alignSelf: "center", px: 2, py: 1.5 }}>
            {familyFormat.formatRecurrence(recurringLine.recurrenceMonths)}
          </Box>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              gap: 0.5,
              justifyContent: "flex-end",
              px: 2,
              py: 1.5,
            }}
          >
            {isGenerated ? (
              <ActionIconButton
                component="span"
                disabled={disabled}
                icon={
                  line.isEnabled ? (
                    <VisibilityIcon fontSize="small" />
                  ) : (
                    <VisibilityOffIcon fontSize="small" />
                  )
                }
                label={t(
                  line.isEnabled
                    ? "family.line.hideGeneratedLabel"
                    : "family.line.showGeneratedLabel",
                  { title: lineTitle },
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleGeneratedLine(line);
                }}
                size="small"
                tooltip={t(
                  line.isEnabled
                    ? "family.line.hideGeneratedTooltip"
                    : "family.line.showGeneratedTooltip",
                )}
              />
            ) : (
              <>
                <ActionIconButton
                  component="span"
                  disabled={disabled}
                  icon={<EditIcon fontSize="small" />}
                  label={t("family.line.editLabel", {
                    title: lineTitle,
                  })}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditLine(recurringLine);
                  }}
                  size="small"
                  tooltip={t("family.line.editTooltip")}
                />
                <ActionIconButton
                  component="span"
                  disabled={disabled}
                  icon={<DeleteIcon fontSize="small" />}
                  label={t("family.line.deleteLabel", {
                    title: lineTitle,
                  })}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteLine(recurringLine);
                  }}
                  size="small"
                  tooltip={t("family.line.deleteTooltip")}
                />
              </>
            )}
          </Box>
        </ButtonBase>
      </TableCell>
    </TableRow>
  );
}
