import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "@repo/ui/loading-button";
import { useTranslation } from "react-i18next";

import type {
  FamilyParticipationLine,
  FamilyParticipationMemberMonthGroup,
  FamilyParticipationMonthGroup,
} from "../domain/family-participations";
import { FamilyBudgetEmptyState } from "./family-budget-empty-state";
import {
  FamilyBudgetAmountCell,
  FamilyBudgetLineActions,
  FamilyBudgetMonthGroupHeader,
  FamilyBudgetMonthTable,
  familyBudgetMonthTableRowPaddingSx,
} from "./family-budget-month-table";
import { useFamilyFormat } from "./use-family-format";

const participationTableGridColumns = {
  md: "44px minmax(180px, 1fr) minmax(112px, 140px) minmax(112px, 140px) 96px",
  xs: "40px minmax(128px, 1fr) minmax(92px, 112px) minmax(92px, 112px) 88px",
};

interface FamilyParticipationsTableProps {
  disabled?: boolean;
  monthGroups: FamilyParticipationMonthGroup[];
  onAddLine: () => void;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
}

export function FamilyParticipationsTable({
  disabled = false,
  monthGroups,
  onAddLine,
  onDeleteLine,
  onEditLine,
}: FamilyParticipationsTableProps) {
  const { t } = useTranslation();
  const hasLines = monthGroups.some((group) => group.lines.length > 0);
  const hasMembers = monthGroups.some((group) => group.memberGroups.length > 0);

  return (
    <FamilyBudgetMonthTable
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
      ariaLabel={t("participations.table.ariaLabel")}
      columns={[
        { label: t("participations.table.columns.member") },
        { align: "right", label: t("participations.table.columns.income") },
        { align: "right", label: t("participations.table.columns.expense") },
        { align: "right", label: t("common.actions") },
      ]}
      emptyState={<ParticipationsEmptyState hasMembers={hasMembers} />}
      gridColumns={participationTableGridColumns}
      hasLines={hasLines}
      minWidth={{ sm: 660, xs: 608 }}
      monthGroups={monthGroups}
      renderMonthGroup={({
        collapsed,
        colSpan,
        createdAtFormatter,
        group,
        monthLabel,
        onToggle,
      }) => (
        <ParticipationMonthGroup
          collapsed={collapsed}
          colSpan={colSpan}
          createdAtFormatter={createdAtFormatter}
          disabled={disabled}
          group={group}
          key={group.id}
          monthLabel={monthLabel}
          onDeleteLine={onDeleteLine}
          onEditLine={onEditLine}
          onToggle={onToggle}
        />
      )}
      title={t("participations.table.title")}
      titleId="family-participations-table-title"
    />
  );
}

function ParticipationMonthGroup({
  collapsed,
  colSpan,
  createdAtFormatter,
  disabled,
  group,
  monthLabel,
  onDeleteLine,
  onEditLine,
  onToggle,
}: {
  collapsed: boolean;
  colSpan: number;
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  group: FamilyParticipationMonthGroup;
  monthLabel: string;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const toggleLabel = collapsed
    ? t("participations.table.expandMonth", { month: monthLabel })
    : t("participations.table.collapseMonth", { month: monthLabel });

  return (
    <>
      <FamilyBudgetMonthGroupHeader
        amountCells={
          <>
            <FamilyBudgetAmountCell
              value={getIncomeAmount(group.lines)}
              weight={700}
            />
            <FamilyBudgetAmountCell
              value={getExpenseAmount(group.lines)}
              weight={700}
            />
          </>
        }
        collapsed={collapsed}
        colSpan={colSpan}
        gridColumns={participationTableGridColumns}
        monthLabel={monthLabel}
        onToggle={onToggle}
        summary={familyFormat.formatCurrency(group.total)}
        toggleLabel={toggleLabel}
      />
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ borderBottom: 0, p: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            {group.memberGroups.map((memberGroup) => (
              <ParticipationMemberGroup
                createdAtFormatter={createdAtFormatter}
                disabled={disabled}
                group={memberGroup}
                key={memberGroup.id}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
              />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function ParticipationMemberGroup({
  createdAtFormatter,
  disabled,
  group,
  onDeleteLine,
  onEditLine,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  group: FamilyParticipationMemberMonthGroup;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
}) {
  const familyFormat = useFamilyFormat();

  return (
    <Box>
      <Box
        sx={(theme) => ({
          alignItems: "center",
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "grid",
          gridTemplateColumns: participationTableGridColumns,
          ...familyBudgetMonthTableRowPaddingSx,
        })}
      >
        <Box aria-hidden="true" />
        <Box
          sx={{
            alignItems: "baseline",
            display: "flex",
            gap: 1,
            justifyContent: "flex-start",
            minWidth: 0,
            px: { md: 2, xs: 1 },
            py: 1.25,
          }}
        >
          <Typography sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
            {group.member.name}
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
            {familyFormat.formatCurrency(group.total)}
          </Typography>
        </Box>
        <FamilyBudgetAmountCell
          value={getIncomeAmount(group.lines)}
          weight={700}
        />
        <FamilyBudgetAmountCell
          value={getExpenseAmount(group.lines)}
          weight={700}
        />
        <Box aria-hidden="true" />
      </Box>
      {group.lines.length > 0 ? (
        group.lines.map((line) => (
          <ParticipationLineRow
            createdAtFormatter={createdAtFormatter}
            disabled={disabled}
            key={line.line.id}
            line={line}
            onDeleteLine={onDeleteLine}
            onEditLine={onEditLine}
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
        ...familyBudgetMonthTableRowPaddingSx,
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
      <Box />
    </Box>
  );
}

function ParticipationLineRow({
  createdAtFormatter,
  disabled,
  line,
  onDeleteLine,
  onEditLine,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  line: FamilyParticipationLine;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
}) {
  const { t } = useTranslation();
  const lineLabel = `${line.member.name} ${createdAtFormatter.format(
    new Date(line.line.createdAt),
  )}`;

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: participationTableGridColumns,
        ...familyBudgetMonthTableRowPaddingSx,
      })}
    >
      <Box aria-hidden="true" />
      <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.5 }}>
        <Typography color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
          {createdAtFormatter.format(new Date(line.line.createdAt))}
        </Typography>
      </Box>
      <FamilyBudgetAmountCell
        tone="positive"
        value={line.line.amount > 0 ? line.line.amount : null}
      />
      <FamilyBudgetAmountCell
        tone="negative"
        value={line.line.amount < 0 ? Math.abs(line.line.amount) : null}
      />
      <FamilyBudgetLineActions
        deleteLabel={t("participations.line.deleteLabel", {
          label: lineLabel,
        })}
        deleteTooltip={t("participations.line.deleteTooltip")}
        disabled={disabled}
        editLabel={t("participations.line.editLabel", { label: lineLabel })}
        editTooltip={t("participations.line.editTooltip")}
        onDelete={() => onDeleteLine(line)}
        onEdit={() => onEditLine(line)}
      />
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
    <FamilyBudgetEmptyState
      description={
        hasMembers
          ? t("participations.table.empty.noLinesInYear")
          : t("participations.table.empty.noMember")
      }
      icon={<ReceiptLongIcon />}
      title={t("participations.table.empty.title")}
    />
  );
}
