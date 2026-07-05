import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import { familyBudgetTableHeaderTextSx } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

export const familyBudgetMonthTableRowPaddingSx = {
  px: { md: 1, xs: 0.5 },
};

const familyBudgetMonthTableHeaderTextSx = {
  ...familyBudgetTableHeaderTextSx,
  px: { md: 2, xs: 1 },
};

const familyBudgetMonthTableAmountHeaderTextSx = {
  ...familyBudgetMonthTableHeaderTextSx,
  textAlign: "right",
};

type FamilyBudgetTableGridColumns = {
  md: string;
  xs: string;
};

interface FamilyBudgetMonthTableGroup {
  id: string;
  monthIndex: number;
  year: number;
}

interface FamilyBudgetMonthTableColumn {
  align?: "left" | "right";
  label: ReactNode;
}

interface FamilyBudgetMonthTableRenderArgs<TGroup> {
  collapsed: boolean;
  colSpan: number;
  createdAtFormatter: Intl.DateTimeFormat;
  group: TGroup;
  monthLabel: string;
  onToggle: () => void;
}

interface FamilyBudgetMonthTableProps<
  TGroup extends FamilyBudgetMonthTableGroup,
> {
  action: ReactNode;
  ariaLabel: string;
  columns: FamilyBudgetMonthTableColumn[];
  emptyState: ReactNode;
  gridColumns: FamilyBudgetTableGridColumns;
  hasLines: boolean;
  minWidth: {
    sm: number;
    xs: number;
  };
  monthGroups: TGroup[];
  renderMonthGroup: (
    args: FamilyBudgetMonthTableRenderArgs<TGroup>,
  ) => ReactNode;
  title: string;
  titleId: string;
}

export function FamilyBudgetMonthTable<
  TGroup extends FamilyBudgetMonthTableGroup,
>({
  action,
  ariaLabel,
  columns,
  emptyState,
  gridColumns,
  hasLines,
  minWidth,
  monthGroups,
  renderMonthGroup,
  title,
  titleId,
}: FamilyBudgetMonthTableProps<TGroup>) {
  const { i18n } = useTranslation();
  const [collapsedMonthIds, setCollapsedMonthIds] = useState<Set<string>>(() =>
    getDefaultCollapsedMonthIds(monthGroups),
  );
  const colSpan = columns.length + 1;
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        month: "long",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );
  const createdAtFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );

  function toggleMonth(monthId: string) {
    setCollapsedMonthIds((current) => {
      const next = new Set(current);

      if (next.has(monthId)) {
        next.delete(monthId);
      } else {
        next.add(monthId);
      }

      return next;
    });
  }

  return (
    <SectionPanel
      action={action}
      contentSx={{ p: 0 }}
      headerSx={{
        alignItems: { sm: "center", xs: "flex-start" },
        flexDirection: { sm: "row", xs: "column" },
      }}
      title={title}
      titleId={titleId}
    >
      {!hasLines ? emptyState : null}
      <TableContainer
        sx={{
          display: hasLines ? "block" : "none",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          aria-label={ariaLabel}
          stickyHeader
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth,
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={colSpan} sx={{ p: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    display: "grid",
                    gridTemplateColumns: gridColumns,
                    pb: 1,
                    ...familyBudgetMonthTableRowPaddingSx,
                  }}
                >
                  <Box aria-hidden="true" />
                  {columns.map((column, index) => (
                    <Typography
                      key={index}
                      sx={
                        column.align === "right"
                          ? familyBudgetMonthTableAmountHeaderTextSx
                          : familyBudgetMonthTableHeaderTextSx
                      }
                    >
                      {column.label}
                    </Typography>
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthGroups.map((group) =>
              renderMonthGroup({
                collapsed: collapsedMonthIds.has(group.id),
                colSpan,
                createdAtFormatter,
                group,
                monthLabel: monthFormatter.format(
                  new Date(group.year, group.monthIndex, 1),
                ),
                onToggle: () => toggleMonth(group.id),
              }),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionPanel>
  );
}

export function FamilyBudgetMonthGroupHeader({
  amountCells,
  collapsed,
  colSpan,
  gridColumns,
  monthLabel,
  onToggle,
  subtitle,
  summary,
  toggleLabel,
}: {
  amountCells: ReactNode;
  collapsed: boolean;
  colSpan: number;
  gridColumns: FamilyBudgetTableGridColumns;
  monthLabel: string;
  onToggle: () => void;
  subtitle?: ReactNode;
  summary: ReactNode;
  toggleLabel: string;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        component="th"
        scope="rowgroup"
        sx={{ p: 0 }}
      >
        <Box
          sx={(theme) => ({
            alignItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            display: "grid",
            gridTemplateColumns: gridColumns,
            py: 0.85,
            ...familyBudgetMonthTableRowPaddingSx,
          })}
        >
          <IconButton aria-label={toggleLabel} onClick={onToggle} size="small">
            {collapsed ? (
              <KeyboardArrowRightIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
          <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 } }}>
            <Box
              sx={{
                alignItems: "baseline",
                display: "flex",
                gap: 1,
                justifyContent: "flex-start",
                minWidth: 0,
              }}
            >
              <Typography
                noWrap
                sx={{
                  fontWeight: 700,
                  minWidth: 0,
                  textTransform: "capitalize",
                }}
              >
                {monthLabel}
              </Typography>
              <Typography
                color="text.secondary"
                noWrap
                sx={{
                  flexShrink: 0,
                  fontSize: { sm: "0.8125rem", xs: "0.75rem" },
                  fontWeight: 400,
                }}
                variant="body2"
              >
                {summary}
              </Typography>
            </Box>
            {subtitle ? (
              <Box sx={{ minWidth: 0, mt: 0.25 }}>{subtitle}</Box>
            ) : null}
          </Box>
          {amountCells}
          <Box aria-hidden="true" />
        </Box>
      </TableCell>
    </TableRow>
  );
}

export function FamilyBudgetAmountCell({
  tone,
  value,
  weight = 400,
}: {
  tone?: "negative" | "positive";
  value: number | null;
  weight?: number;
}) {
  const familyFormat = useFamilyFormat();

  return (
    <Box
      sx={{
        alignSelf: "center",
        color:
          tone === "positive"
            ? "success.main"
            : tone === "negative"
              ? "error.main"
              : "inherit",
        fontSize: { sm: "0.875rem", xs: "0.8125rem" },
        fontWeight: weight,
        px: { md: 2, xs: 1 },
        py: 1.25,
        textAlign: "right",
        whiteSpace: "nowrap",
      }}
    >
      {value === null ? null : familyFormat.formatCurrency(value)}
    </Box>
  );
}

export function FamilyBudgetLineActions({
  deleteLabel,
  deleteTooltip,
  disabled,
  editLabel,
  editTooltip,
  excludeLabel,
  excludeTooltip,
  isExcluded = false,
  isExcludeSaving = false,
  onDelete,
  onEdit,
  onToggleExcluded,
}: {
  deleteLabel: string;
  deleteTooltip: string;
  disabled: boolean;
  editLabel: string;
  editTooltip: string;
  excludeLabel?: string;
  excludeTooltip?: string;
  isExcluded?: boolean;
  isExcludeSaving?: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleExcluded?: () => void;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        gap: 0.5,
        justifyContent: "flex-end",
        px: { md: 2, xs: 1 },
        py: 1,
      }}
    >
      {onToggleExcluded && excludeLabel && excludeTooltip ? (
        <ActionIconButton
          component="span"
          aria-disabled={disabled || undefined}
          disabled={disabled && !isExcludeSaving}
          icon={
            isExcludeSaving ? (
              <CircularProgress color="inherit" size={18} />
            ) : isExcluded ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )
          }
          label={excludeLabel}
          onClick={() => {
            if (disabled) {
              return;
            }

            onToggleExcluded();
          }}
          size="small"
          stopPropagation
          tooltip={excludeTooltip}
        />
      ) : null}
      <ActionIconButton
        disabled={disabled}
        icon={<EditIcon fontSize="small" />}
        label={editLabel}
        onClick={onEdit}
        size="small"
        stopPropagation
        tooltip={editTooltip}
      />
      <ActionIconButton
        disabled={disabled}
        icon={<DeleteIcon fontSize="small" />}
        label={deleteLabel}
        onClick={onDelete}
        size="small"
        stopPropagation
        tooltip={deleteTooltip}
      />
    </Box>
  );
}

function getDefaultCollapsedMonthIds(
  monthGroups: FamilyBudgetMonthTableGroup[],
): Set<string> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  return new Set(
    monthGroups
      .filter(
        (group) =>
          group.year < currentYear ||
          (group.year === currentYear && group.monthIndex < currentMonthIndex),
      )
      .map((group) => group.id),
  );
}
