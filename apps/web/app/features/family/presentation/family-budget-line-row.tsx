import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { alpha } from "@mui/material/styles";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { useTranslation } from "react-i18next";

import type { RecurringLine } from "../domain/family";
import { familyBudgetTableGridColumns } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

interface FamilyBudgetLineRowProps {
  disabled: boolean;
  line: RecurringLine;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onViewLine?: (line: RecurringLine) => void;
}

export function FamilyBudgetLineRow({
  disabled,
  line,
  onDeleteLine,
  onEditLine,
  onViewLine,
}: FamilyBudgetLineRowProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

  function handleLineClick() {
    if (!disabled) {
      onViewLine?.(line);
    }
  }

  return (
    <TableRow aria-disabled={disabled || undefined}>
      <TableCell colSpan={4} sx={{ p: 0 }}>
        <ButtonBase
          aria-label={t("family.line.viewLabel", { title: line.title })}
          disabled={disabled}
          onClick={handleLineClick}
          sx={(theme) => ({
            borderRadius: 0,
            color: "inherit",
            display: "grid",
            gridTemplateColumns: familyBudgetTableGridColumns,
            justifyItems: "stretch",
            textAlign: "left",
            transition: "background-color 150ms ease",
            width: "100%",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          })}
        >
          <Box sx={{ minWidth: 0, px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }}>{line.title}</Typography>
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
              {line.description}
            </Typography>
          </Box>
          <Box sx={{ alignSelf: "center", px: 2, py: 1.5 }}>
            {familyFormat.formatLineAmount(line)}
          </Box>
          <Box sx={{ alignSelf: "center", px: 2, py: 1.5 }}>
            {familyFormat.formatRecurrence(line.recurrenceMonths)}
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
            <ActionIconButton
              component="span"
              disabled={disabled}
              icon={<EditIcon fontSize="small" />}
              label={t("family.line.editLabel", { title: line.title })}
              onClick={(event) => {
                event.stopPropagation();
                onEditLine(line);
              }}
              size="small"
              tooltip={t("family.line.editTooltip")}
            />
            <ActionIconButton
              component="span"
              disabled={disabled}
              icon={<DeleteIcon fontSize="small" />}
              label={t("family.line.deleteLabel", { title: line.title })}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteLine(line);
              }}
              size="small"
              tooltip={t("family.line.deleteTooltip")}
            />
          </Box>
        </ButtonBase>
      </TableCell>
    </TableRow>
  );
}
