import AddIcon from "@mui/icons-material/Add";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "@repo/ui/loading-button";
import { useTranslation } from "react-i18next";

import type {
  FamilyLoanMonthGroup,
  FamilyLoanRepaymentLine,
} from "../domain/family-loans";
import { FamilyBudgetEmptyState } from "./family-budget-empty-state";
import {
  FamilyBudgetAmountCell,
  FamilyBudgetLineActions,
  FamilyBudgetMonthGroupHeader,
  FamilyBudgetMonthTable,
  familyBudgetMonthTableRowPaddingSx,
} from "./family-budget-month-table";
import { useFamilyFormat } from "./use-family-format";

const loansTableGridColumns = {
  md: "44px minmax(180px, 1fr) minmax(112px, 140px) minmax(112px, 140px) minmax(112px, 140px) minmax(112px, 140px) 96px",
  xs: "40px minmax(136px, 1fr) minmax(96px, 112px) minmax(96px, 112px) minmax(96px, 112px) minmax(104px, 120px) 88px",
};

interface FamilyLoansTableProps {
  disabled?: boolean;
  hasLoans: boolean;
  monthGroups: FamilyLoanMonthGroup[];
  onAddLine: () => void;
  onDeleteLine: (line: FamilyLoanRepaymentLine) => void;
  onEditLine: (line: FamilyLoanRepaymentLine) => void;
  readonly?: boolean;
}

export function FamilyLoansTable({
  disabled = false,
  hasLoans,
  monthGroups,
  onAddLine,
  onDeleteLine,
  onEditLine,
  readonly = false,
}: FamilyLoansTableProps) {
  const { t } = useTranslation();
  const hasLines = monthGroups.some((group) => group.lines.length > 0);

  return (
    <FamilyBudgetMonthTable
      action={
        readonly ? undefined : (
          <LoadingButton
            disabled={disabled || !hasLoans}
            onClick={onAddLine}
            startIcon={<AddIcon />}
            variant="contained"
          >
            {t("loans.table.addLine")}
          </LoadingButton>
        )
      }
      ariaLabel={t("loans.table.ariaLabel")}
      columns={[
        { label: t("loans.table.columns.loan") },
        { align: "right", label: t("loans.table.columns.paid") },
        { align: "right", label: t("loans.table.columns.fees") },
        { align: "right", label: t("loans.table.columns.repayment") },
        { align: "right", label: t("loans.table.columns.remaining") },
        { align: "right", label: t("common.actions") },
      ]}
      emptyState={<LoansEmptyState hasLoans={hasLoans} />}
      gridColumns={loansTableGridColumns}
      hasLines={hasLines}
      minWidth={{ sm: 840, xs: 792 }}
      monthGroups={monthGroups}
      renderMonthGroup={({
        collapsed,
        colSpan,
        createdAtFormatter,
        group,
        monthLabel,
        onToggle,
      }) => (
        <LoanMonthGroup
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
      title={t("loans.table.title")}
      titleId="family-loans-table-title"
    />
  );
}

function LoanMonthGroup({
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
  group: FamilyLoanMonthGroup;
  monthLabel: string;
  onDeleteLine: (line: FamilyLoanRepaymentLine) => void;
  onEditLine: (line: FamilyLoanRepaymentLine) => void;
  readonly: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const toggleLabel = collapsed
    ? t("loans.table.expandMonth", { month: monthLabel })
    : t("loans.table.collapseMonth", { month: monthLabel });

  return (
    <>
      <FamilyBudgetMonthGroupHeader
        amountCells={
          <>
            <FamilyBudgetAmountCell value={group.paidAmount} weight={700} />
            <FamilyBudgetAmountCell value={group.feesAmount} weight={700} />
            <FamilyBudgetAmountCell
              value={group.repaymentAmount}
              weight={700}
            />
            <FamilyBudgetAmountCell
              value={group.remainingAmount}
              weight={700}
            />
          </>
        }
        collapsed={collapsed}
        colSpan={colSpan}
        gridColumns={loansTableGridColumns}
        monthLabel={monthLabel}
        onToggle={onToggle}
        summary={familyFormat.formatCurrency(group.paidAmount)}
        toggleLabel={toggleLabel}
      />
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ borderBottom: 0, p: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            {group.lines.map((line) => (
              <LoanLineRow
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

function LoanLineRow({
  createdAtFormatter,
  disabled,
  line,
  onDeleteLine,
  onEditLine,
  readonly,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  line: FamilyLoanRepaymentLine;
  onDeleteLine: (line: FamilyLoanRepaymentLine) => void;
  onEditLine: (line: FamilyLoanRepaymentLine) => void;
  readonly: boolean;
}) {
  const { t } = useTranslation();
  const lineLabel = `${line.loan.title} ${createdAtFormatter.format(
    new Date(line.line.createdAt),
  )}`;

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: loansTableGridColumns,
        ...familyBudgetMonthTableRowPaddingSx,
      })}
    >
      <Box aria-hidden="true" />
      <Box sx={{ minWidth: 0, px: { md: 2, xs: 1 }, py: 1.5 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {line.loan.title}
        </Typography>
        <Typography color="text.secondary" noWrap variant="body2">
          {createdAtFormatter.format(new Date(line.line.createdAt))}
        </Typography>
      </Box>
      <FamilyBudgetAmountCell value={line.line.paidAmount} />
      <FamilyBudgetAmountCell value={line.feesAmount} />
      <FamilyBudgetAmountCell tone="positive" value={line.repaymentAmount} />
      <FamilyBudgetAmountCell value={line.remainingAfter} />
      {readonly ? (
        <Box aria-hidden="true" />
      ) : (
        <FamilyBudgetLineActions
          deleteLabel={t("loans.line.deleteLabel", { label: lineLabel })}
          deleteTooltip={t("loans.line.deleteTooltip")}
          disabled={disabled}
          editLabel={t("loans.line.editLabel", { label: lineLabel })}
          editTooltip={t("loans.line.editTooltip")}
          onDelete={() => onDeleteLine(line)}
          onEdit={() => onEditLine(line)}
        />
      )}
    </Box>
  );
}

function LoansEmptyState({ hasLoans }: { hasLoans: boolean }) {
  const { t } = useTranslation();

  return (
    <FamilyBudgetEmptyState
      description={
        hasLoans
          ? t("loans.table.empty.noLinesInYear")
          : t("loans.table.empty.noLoan")
      }
      icon={<AccountBalanceIcon />}
      title={t("loans.table.empty.title")}
      width={300}
    />
  );
}
