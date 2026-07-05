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
  md: "44px minmax(180px, 1fr) minmax(112px, 140px) minmax(112px, 140px) 152px",
  xs: "40px minmax(128px, 1fr) minmax(92px, 112px) minmax(92px, 112px) 124px",
};

interface FamilyParticipationsTableProps {
  disabled?: boolean;
  exclusionSavingLineId?: string | null;
  monthGroups: FamilyParticipationMonthGroup[];
  onAddLine: () => void;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
  onToggleLineExclusion: (line: FamilyParticipationLine) => void;
  readonly?: boolean;
}

export function FamilyParticipationsTable({
  disabled = false,
  exclusionSavingLineId = null,
  monthGroups,
  onAddLine,
  onDeleteLine,
  onEditLine,
  onToggleLineExclusion,
  readonly = false,
}: FamilyParticipationsTableProps) {
  const { t } = useTranslation();
  const hasLines = monthGroups.some((group) => group.lines.length > 0);
  const hasMembers = monthGroups.some((group) => group.memberGroups.length > 0);

  return (
    <FamilyBudgetMonthTable
      action={
        readonly ? undefined : (
          <LoadingButton
            disabled={disabled}
            onClick={onAddLine}
            startIcon={<AddIcon />}
            variant="contained"
          >
            {t("participations.table.addLine")}
          </LoadingButton>
        )
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
          exclusionSavingLineId={exclusionSavingLineId}
          key={group.id}
          monthLabel={monthLabel}
          onDeleteLine={onDeleteLine}
          onEditLine={onEditLine}
          onToggleLineExclusion={onToggleLineExclusion}
          readonly={readonly}
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
  exclusionSavingLineId,
  monthLabel,
  onDeleteLine,
  onEditLine,
  onToggleLineExclusion,
  readonly,
  onToggle,
}: {
  collapsed: boolean;
  colSpan: number;
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  group: FamilyParticipationMonthGroup;
  exclusionSavingLineId: string | null;
  monthLabel: string;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
  onToggleLineExclusion: (line: FamilyParticipationLine) => void;
  readonly: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const toggleLabel = collapsed
    ? t("participations.table.expandMonth", { month: monthLabel })
    : t("participations.table.collapseMonth", { month: monthLabel });
  const contributingMemberGroups = group.memberGroups
    .filter((memberGroup) => memberGroup.lines.length > 0)
    .sort((left, right) => Math.abs(right.total) - Math.abs(left.total));
  const contributorsSubtitle =
    contributingMemberGroups.length > 0
      ? `${contributingMemberGroups
          .slice(0, 2)
          .map((memberGroup) =>
            t("participations.table.monthContributor", {
              amount: familyFormat.formatCurrency(memberGroup.total),
              member: memberGroup.member.name,
            }),
          )
          .join(", ")}${contributingMemberGroups.length > 2 ? "…" : ""}`
      : undefined;

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
        subtitle={contributorsSubtitle}
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
                exclusionSavingLineId={exclusionSavingLineId}
                key={memberGroup.id}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
                onToggleLineExclusion={onToggleLineExclusion}
                readonly={readonly}
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
  exclusionSavingLineId,
  onDeleteLine,
  onEditLine,
  onToggleLineExclusion,
  readonly,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  group: FamilyParticipationMemberMonthGroup;
  exclusionSavingLineId: string | null;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
  onToggleLineExclusion: (line: FamilyParticipationLine) => void;
  readonly: boolean;
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
            exclusionSavingLineId={exclusionSavingLineId}
            key={line.line.id}
            line={line}
            onDeleteLine={onDeleteLine}
            onEditLine={onEditLine}
            onToggleLineExclusion={onToggleLineExclusion}
            readonly={readonly}
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
  exclusionSavingLineId,
  line,
  onDeleteLine,
  onEditLine,
  onToggleLineExclusion,
  readonly,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  exclusionSavingLineId: string | null;
  line: FamilyParticipationLine;
  onDeleteLine: (line: FamilyParticipationLine) => void;
  onEditLine: (line: FamilyParticipationLine) => void;
  onToggleLineExclusion: (line: FamilyParticipationLine) => void;
  readonly: boolean;
}) {
  const { t } = useTranslation();
  const isExcluded = line.line.isExcludedFromStats;
  const createdAt = createdAtFormatter.format(new Date(line.line.createdAt));
  const lineLabel = [line.member.name, line.line.title, createdAt]
    .filter(Boolean)
    .join(" ");

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: participationTableGridColumns,
        opacity: isExcluded ? 0.56 : 1,
        ...familyBudgetMonthTableRowPaddingSx,
      })}
    >
      <Box aria-hidden="true" />
      <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.5 }}>
        {line.line.title ? (
          <>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {line.line.title}
            </Typography>
            <Typography color="text.secondary" noWrap variant="body2">
              {createdAt}
            </Typography>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
            {createdAt}
          </Typography>
        )}
      </Box>
      <FamilyBudgetAmountCell
        tone="positive"
        value={line.line.amount > 0 ? line.line.amount : null}
      />
      <FamilyBudgetAmountCell
        tone="negative"
        value={line.line.amount < 0 ? Math.abs(line.line.amount) : null}
      />
      {readonly ? (
        <Box aria-hidden="true" />
      ) : (
        <FamilyBudgetLineActions
          deleteLabel={t("participations.line.deleteLabel", {
            label: lineLabel,
          })}
          deleteTooltip={t("participations.line.deleteTooltip")}
          disabled={disabled}
          editLabel={t("participations.line.editLabel", { label: lineLabel })}
          editTooltip={t("participations.line.editTooltip")}
          excludeLabel={t(
            isExcluded
              ? "participations.line.includeLabel"
              : "participations.line.excludeLabel",
            { label: lineLabel },
          )}
          excludeTooltip={t(
            isExcluded
              ? "participations.line.includeTooltip"
              : "participations.line.excludeTooltip",
          )}
          isExcluded={isExcluded}
          isExcludeSaving={exclusionSavingLineId === line.line.id}
          onDelete={() => onDeleteLine(line)}
          onEdit={() => onEditLine(line)}
          onToggleExcluded={() => onToggleLineExclusion(line)}
        />
      )}
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
