import AddIcon from "@mui/icons-material/Add";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "@repo/ui/loading-button";
import { useTranslation } from "react-i18next";

import type {
  FamilyDistributionLine,
  FamilyDistributionMonthGroup,
} from "../domain/family-distributions";
import { FamilyBudgetEmptyState } from "./family-budget-empty-state";
import {
  FamilyBudgetAmountCell,
  FamilyBudgetLineActions,
  FamilyBudgetMonthGroupHeader,
  FamilyBudgetMonthTable,
  familyBudgetMonthTableRowPaddingSx,
} from "./family-budget-month-table";
import { useFamilyFormat } from "./use-family-format";

const distributionsTableGridColumns = {
  md: "44px minmax(220px, 1fr) minmax(112px, 140px) minmax(112px, 140px) minmax(112px, 140px) 96px",
  xs: "40px minmax(180px, 1fr) minmax(96px, 112px) minmax(96px, 112px) minmax(96px, 112px) 88px",
};

interface FamilyDistributionsTableProps {
  disabled?: boolean;
  hasMembers: boolean;
  monthGroups: FamilyDistributionMonthGroup[];
  onAddLine: () => void;
  onDeleteLine: (line: FamilyDistributionLine) => void;
  onEditLine: (line: FamilyDistributionLine) => void;
  readonly?: boolean;
}

export function FamilyDistributionsTable({
  disabled = false,
  hasMembers,
  monthGroups,
  onAddLine,
  onDeleteLine,
  onEditLine,
  readonly = false,
}: FamilyDistributionsTableProps) {
  const { t } = useTranslation();
  const hasLines = monthGroups.some((group) => group.lines.length > 0);

  return (
    <FamilyBudgetMonthTable
      action={
        readonly ? undefined : (
          <LoadingButton
            disabled={disabled || !hasMembers}
            onClick={onAddLine}
            startIcon={<AddIcon />}
            variant="contained"
          >
            {t("distributions.table.addLine")}
          </LoadingButton>
        )
      }
      ariaLabel={t("distributions.table.ariaLabel")}
      columns={[
        { label: t("distributions.table.columns.distribution") },
        { align: "right", label: t("distributions.table.columns.base") },
        { align: "right", label: t("distributions.table.columns.received") },
        { align: "right", label: t("distributions.table.columns.balance") },
        { align: "right", label: t("common.actions") },
      ]}
      emptyState={<DistributionsEmptyState hasMembers={hasMembers} />}
      gridColumns={distributionsTableGridColumns}
      hasLines={hasLines}
      minWidth={{ sm: 760, xs: 712 }}
      monthGroups={monthGroups}
      renderMonthGroup={({
        collapsed,
        colSpan,
        createdAtFormatter,
        group,
        monthLabel,
        onToggle,
      }) => (
        <DistributionMonthGroup
          collapsed={collapsed}
          colSpan={colSpan}
          createdAtFormatter={createdAtFormatter}
          disabled={disabled}
          group={group}
          key={group.id}
          monthLabel={monthLabel}
          onDeleteLine={onDeleteLine}
          onEditLine={onEditLine}
          readonly={readonly}
          onToggle={onToggle}
        />
      )}
      title={t("distributions.table.title")}
      titleId="family-distributions-table-title"
    />
  );
}

function DistributionMonthGroup({
  collapsed,
  colSpan,
  createdAtFormatter,
  disabled,
  group,
  monthLabel,
  onDeleteLine,
  onEditLine,
  readonly,
  onToggle,
}: {
  collapsed: boolean;
  colSpan: number;
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  group: FamilyDistributionMonthGroup;
  monthLabel: string;
  onDeleteLine: (line: FamilyDistributionLine) => void;
  onEditLine: (line: FamilyDistributionLine) => void;
  readonly: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const toggleLabel = collapsed
    ? t("distributions.table.expandMonth", { month: monthLabel })
    : t("distributions.table.collapseMonth", { month: monthLabel });

  return (
    <>
      <FamilyBudgetMonthGroupHeader
        amountCells={
          <>
            <FamilyBudgetAmountCell value={group.baseAmount} weight={700} />
            <FamilyBudgetAmountCell value={group.receivedAmount} weight={700} />
            <FamilyBudgetAmountCell
              tone={
                group.balanceDelta > 0
                  ? "positive"
                  : group.balanceDelta < 0
                    ? "negative"
                    : undefined
              }
              value={group.balanceDelta}
              weight={700}
            />
          </>
        }
        collapsed={collapsed}
        colSpan={colSpan}
        gridColumns={distributionsTableGridColumns}
        monthLabel={monthLabel}
        onToggle={onToggle}
        summary={familyFormat.formatCurrency(group.receivedAmount)}
        toggleLabel={toggleLabel}
      />
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ borderBottom: 0, p: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            {group.lines.map((line) => (
              <DistributionLineRow
                createdAtFormatter={createdAtFormatter}
                disabled={disabled}
                key={line.line.id}
                line={line}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
                readonly={readonly}
              />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function DistributionLineRow({
  createdAtFormatter,
  disabled,
  line,
  onDeleteLine,
  onEditLine,
  readonly,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  line: FamilyDistributionLine;
  onDeleteLine: (line: FamilyDistributionLine) => void;
  onEditLine: (line: FamilyDistributionLine) => void;
  readonly: boolean;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const createdAt = createdAtFormatter.format(new Date(line.line.createdAt));
  const lineLabel = `${createdAt} ${line.memberAmounts
    .map((memberAmount) => memberAmount.member.name)
    .join(", ")}`;

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: distributionsTableGridColumns,
        ...familyBudgetMonthTableRowPaddingSx,
      })}
    >
      <Box aria-hidden="true" />
      <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.5 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {createdAt}
        </Typography>
        <Stack spacing={0.25} sx={{ mt: 0.5, minWidth: 0 }}>
          {line.memberAmounts.map((memberAmount) => (
            <Typography
              color="text.secondary"
              key={memberAmount.member.id}
              noWrap
              variant="body2"
            >
              {t("distributions.table.memberAmount", {
                amount: familyFormat.formatCurrency(memberAmount.amount),
                balance: familyFormat.formatCurrency(memberAmount.balanceDelta),
                member: memberAmount.member.name,
              })}
            </Typography>
          ))}
        </Stack>
      </Box>
      <FamilyBudgetAmountCell value={line.baseAmount} />
      <FamilyBudgetAmountCell value={line.receivedAmount} />
      <FamilyBudgetAmountCell
        tone={
          line.balanceDelta > 0
            ? "positive"
            : line.balanceDelta < 0
              ? "negative"
              : undefined
        }
        value={line.balanceDelta}
      />
      {readonly ? (
        <Box aria-hidden="true" />
      ) : (
        <FamilyBudgetLineActions
          deleteLabel={t("distributions.line.deleteLabel", {
            label: lineLabel,
          })}
          deleteTooltip={t("distributions.line.deleteTooltip")}
          disabled={disabled}
          editLabel={t("distributions.line.editLabel", { label: lineLabel })}
          editTooltip={t("distributions.line.editTooltip")}
          onDelete={() => onDeleteLine(line)}
          onEdit={() => onEditLine(line)}
        />
      )}
    </Box>
  );
}

function DistributionsEmptyState({ hasMembers }: { hasMembers: boolean }) {
  const { t } = useTranslation();

  return (
    <FamilyBudgetEmptyState
      description={
        hasMembers
          ? t("distributions.table.empty.noLinesInYear")
          : t("distributions.table.empty.noMember")
      }
      icon={<CallSplitIcon />}
      title={t("distributions.table.empty.title")}
      width={320}
    />
  );
}
