import { Fragment, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import type {
  FamilyParticipationLine,
  FamilyParticipationMemberMonthGroup,
  FamilyParticipationMonthGroup,
} from "../domain/family-participations";
import { familyBudgetTableHeaderTextSx } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

const participationTableGridColumns = {
  md: "44px minmax(180px, 1fr) minmax(112px, 140px) minmax(112px, 140px)",
  xs: "40px minmax(128px, 1fr) minmax(92px, 112px) minmax(92px, 112px)",
};
const participationHeaderTextSx = {
  ...familyBudgetTableHeaderTextSx,
  px: { md: 2, xs: 1 },
};
const participationAmountHeaderTextSx = {
  ...participationHeaderTextSx,
  textAlign: "right",
};

interface FamilyParticipationsTableProps {
  disabled?: boolean;
  monthGroups: FamilyParticipationMonthGroup[];
  onAddLine: () => void;
}

export function FamilyParticipationsTable({
  disabled = false,
  monthGroups,
  onAddLine,
}: FamilyParticipationsTableProps) {
  const { t, i18n } = useTranslation();
  const [collapsedMonthIds, setCollapsedMonthIds] = useState<Set<string>>(() =>
    getDefaultCollapsedMonthIds(monthGroups),
  );
  const hasLines = monthGroups.some((group) => group.lines.length > 0);
  const hasMembers = monthGroups.some((group) => group.memberGroups.length > 0);
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
      action={
        <LoadingButton
          disabled={disabled}
          onClick={onAddLine}
          startIcon={<AddIcon />}
          variant="contained"
        >
          {t("participations.table.addLine")}
        </LoadingButton>
      }
      contentSx={{ p: 0 }}
      headerSx={{
        alignItems: { sm: "center", xs: "flex-start" },
        flexDirection: { sm: "row", xs: "column" },
      }}
      title={t("participations.table.title")}
      titleId="family-participations-table-title"
    >
      {!hasLines ? <ParticipationsEmptyState hasMembers={hasMembers} /> : null}
      <TableContainer
        sx={{
          display: hasLines ? "block" : "none",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          aria-label={t("participations.table.ariaLabel")}
          stickyHeader
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: { sm: 560, xs: 520 },
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={4} sx={{ p: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    display: "grid",
                    gridTemplateColumns: participationTableGridColumns,
                    pb: 1,
                  }}
                >
                  <Box aria-hidden="true" />
                  <Typography sx={participationHeaderTextSx}>
                    {t("participations.table.columns.member")}
                  </Typography>
                  <Typography sx={participationAmountHeaderTextSx}>
                    {t("participations.table.columns.income")}
                  </Typography>
                  <Typography sx={participationAmountHeaderTextSx}>
                    {t("participations.table.columns.expense")}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthGroups.map((group) => (
              <ParticipationMonthGroup
                collapsed={collapsedMonthIds.has(group.id)}
                createdAtFormatter={createdAtFormatter}
                group={group}
                key={group.id}
                monthLabel={monthFormatter.format(
                  new Date(group.year, group.monthIndex, 1),
                )}
                onToggle={() => toggleMonth(group.id)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionPanel>
  );
}

function ParticipationMonthGroup({
  collapsed,
  createdAtFormatter,
  group,
  monthLabel,
  onToggle,
}: {
  collapsed: boolean;
  createdAtFormatter: Intl.DateTimeFormat;
  group: FamilyParticipationMonthGroup;
  monthLabel: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const toggleLabel = collapsed
    ? t("participations.table.expandMonth", { month: monthLabel })
    : t("participations.table.collapseMonth", { month: monthLabel });

  return (
    <Fragment>
      <TableRow>
        <TableCell colSpan={4} component="th" scope="rowgroup" sx={{ p: 0 }}>
          <Box
            sx={(theme) => ({
              alignItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: "grid",
              gridTemplateColumns: participationTableGridColumns,
              py: 0.85,
            })}
          >
            <IconButton
              aria-label={toggleLabel}
              onClick={onToggle}
              size="small"
            >
              {collapsed ? (
                <KeyboardArrowRightIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </IconButton>
            <Typography sx={{ fontWeight: 700, textTransform: "capitalize" }}>
              {monthLabel}
            </Typography>
            <ParticipationAmountCell
              value={getIncomeAmount(group.lines)}
              weight={700}
            />
            <ParticipationAmountCell
              value={getExpenseAmount(group.lines)}
              weight={700}
            />
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} sx={{ borderBottom: 0, p: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            {group.memberGroups.map((memberGroup) => (
              <ParticipationMemberGroup
                createdAtFormatter={createdAtFormatter}
                group={memberGroup}
                key={memberGroup.id}
              />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function ParticipationMemberGroup({
  createdAtFormatter,
  group,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  group: FamilyParticipationMemberMonthGroup;
}) {
  return (
    <Box>
      <Box
        sx={(theme) => ({
          alignItems: "center",
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "grid",
          gridTemplateColumns: participationTableGridColumns,
        })}
      >
        <Box aria-hidden="true" />
        <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.25 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {group.member.name}
          </Typography>
        </Box>
        <ParticipationAmountCell
          value={getIncomeAmount(group.lines)}
          weight={600}
        />
        <ParticipationAmountCell
          value={getExpenseAmount(group.lines)}
          weight={600}
        />
      </Box>
      {group.lines.length > 0 ? (
        group.lines.map((line) => (
          <ParticipationLineRow
            createdAtFormatter={createdAtFormatter}
            key={line.line.id}
            line={line}
          />
        ))
      ) : (
        <ParticipationEmptyLine />
      )}
    </Box>
  );
}

function ParticipationEmptyLine() {
  const { t } = useTranslation();

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: participationTableGridColumns,
      })}
    >
      <Box aria-hidden="true" />
      <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.25 }}>
        <Typography color="text.secondary" variant="body2">
          {t("participations.table.empty.memberLines")}
        </Typography>
      </Box>
      <Box />
      <Box />
    </Box>
  );
}

function ParticipationLineRow({
  createdAtFormatter,
  line,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  line: FamilyParticipationLine;
}) {
  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: participationTableGridColumns,
      })}
    >
      <Box aria-hidden="true" />
      <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.5 }}>
        <Typography color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
          {createdAtFormatter.format(new Date(line.line.createdAt))}
        </Typography>
      </Box>
      <ParticipationAmountCell
        tone="positive"
        value={line.line.amount > 0 ? line.line.amount : null}
      />
      <ParticipationAmountCell
        tone="negative"
        value={line.line.amount < 0 ? Math.abs(line.line.amount) : null}
      />
    </Box>
  );
}

function ParticipationAmountCell({
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

function getIncomeAmount(lines: FamilyParticipationLine[]): number {
  return lines.reduce(
    (total, line) => total + Math.max(line.line.amount, 0),
    0,
  );
}

function getExpenseAmount(lines: FamilyParticipationLine[]): number {
  return lines.reduce(
    (total, line) => total + Math.abs(Math.min(line.line.amount, 0)),
    0,
  );
}

function ParticipationsEmptyState({ hasMembers }: { hasMembers: boolean }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "grid",
        justifyItems: "center",
        minHeight: 180,
        px: 2,
        py: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={(theme) => ({
          alignItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          borderRadius: "50%",
          color: "primary.main",
          display: "grid",
          height: 48,
          justifyItems: "center",
          width: 48,
        })}
      >
        <ReceiptLongIcon />
      </Box>
      <Typography sx={{ mt: 1.5 }} variant="h4">
        {t("participations.table.empty.title")}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ maxWidth: 280, mt: 0.5 }}
        variant="body2"
      >
        {hasMembers
          ? t("participations.table.empty.noLinesInYear")
          : t("participations.table.empty.noMember")}
      </Typography>
    </Box>
  );
}

function getDefaultCollapsedMonthIds(
  monthGroups: FamilyParticipationMonthGroup[],
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
