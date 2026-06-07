import { Fragment, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
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
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import type {
  FamilyLoanMonthGroup,
  FamilyLoanRepaymentLine,
} from "../domain/family-loans";
import { familyBudgetTableHeaderTextSx } from "./family-budget-table-layout";
import { useFamilyFormat } from "./use-family-format";

const loansTableGridColumns = {
  md: "44px minmax(180px, 1fr) minmax(112px, 140px) minmax(112px, 140px) minmax(112px, 140px) minmax(112px, 140px) 96px",
  xs: "40px minmax(136px, 1fr) minmax(96px, 112px) minmax(96px, 112px) minmax(96px, 112px) minmax(104px, 120px) 88px",
};
const loansTableRowPaddingSx = {
  px: { md: 1, xs: 0.5 },
};
const loansHeaderTextSx = {
  ...familyBudgetTableHeaderTextSx,
  px: { md: 2, xs: 1 },
};
const loansAmountHeaderTextSx = {
  ...loansHeaderTextSx,
  textAlign: "right",
};

interface FamilyLoansTableProps {
  disabled?: boolean;
  hasLoans: boolean;
  monthGroups: FamilyLoanMonthGroup[];
  onAddLine: () => void;
  onDeleteLine: (line: FamilyLoanRepaymentLine) => void;
  onEditLine: (line: FamilyLoanRepaymentLine) => void;
}

export function FamilyLoansTable({
  disabled = false,
  hasLoans,
  monthGroups,
  onAddLine,
  onDeleteLine,
  onEditLine,
}: FamilyLoansTableProps) {
  const { t, i18n } = useTranslation();
  const [collapsedMonthIds, setCollapsedMonthIds] = useState<Set<string>>(() =>
    getDefaultCollapsedMonthIds(monthGroups),
  );
  const hasLines = monthGroups.some((group) => group.lines.length > 0);
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
          disabled={disabled || !hasLoans}
          onClick={onAddLine}
          startIcon={<AddIcon />}
          variant="contained"
        >
          {t("loans.table.addLine")}
        </LoadingButton>
      }
      contentSx={{ p: 0 }}
      headerSx={{
        alignItems: { sm: "center", xs: "flex-start" },
        flexDirection: { sm: "row", xs: "column" },
      }}
      title={t("loans.table.title")}
      titleId="family-loans-table-title"
    >
      {!hasLines ? <LoansEmptyState hasLoans={hasLoans} /> : null}
      <TableContainer
        sx={{
          display: hasLines ? "block" : "none",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <Table
          aria-label={t("loans.table.ariaLabel")}
          stickyHeader
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: { sm: 840, xs: 792 },
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={7} sx={{ p: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "background.paper",
                    display: "grid",
                    gridTemplateColumns: loansTableGridColumns,
                    pb: 1,
                    ...loansTableRowPaddingSx,
                  }}
                >
                  <Box aria-hidden="true" />
                  <Typography sx={loansHeaderTextSx}>
                    {t("loans.table.columns.loan")}
                  </Typography>
                  <Typography sx={loansAmountHeaderTextSx}>
                    {t("loans.table.columns.paid")}
                  </Typography>
                  <Typography sx={loansAmountHeaderTextSx}>
                    {t("loans.table.columns.fees")}
                  </Typography>
                  <Typography sx={loansAmountHeaderTextSx}>
                    {t("loans.table.columns.repayment")}
                  </Typography>
                  <Typography sx={loansAmountHeaderTextSx}>
                    {t("loans.table.columns.remaining")}
                  </Typography>
                  <Typography sx={loansAmountHeaderTextSx}>
                    {t("common.actions")}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthGroups.map((group) => (
              <LoanMonthGroup
                collapsed={collapsedMonthIds.has(group.id)}
                createdAtFormatter={createdAtFormatter}
                disabled={disabled}
                group={group}
                key={group.id}
                monthLabel={monthFormatter.format(
                  new Date(group.year, group.monthIndex, 1),
                )}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
                onToggle={() => toggleMonth(group.id)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionPanel>
  );
}

function LoanMonthGroup({
  collapsed,
  createdAtFormatter,
  disabled,
  group,
  monthLabel,
  onDeleteLine,
  onEditLine,
  onToggle,
}: {
  collapsed: boolean;
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  group: FamilyLoanMonthGroup;
  monthLabel: string;
  onDeleteLine: (line: FamilyLoanRepaymentLine) => void;
  onEditLine: (line: FamilyLoanRepaymentLine) => void;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const toggleLabel = collapsed
    ? t("loans.table.expandMonth", { month: monthLabel })
    : t("loans.table.collapseMonth", { month: monthLabel });

  return (
    <Fragment>
      <TableRow>
        <TableCell colSpan={7} component="th" scope="rowgroup" sx={{ p: 0 }}>
          <Box
            sx={(theme) => ({
              alignItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: "grid",
              gridTemplateColumns: loansTableGridColumns,
              py: 0.85,
              ...loansTableRowPaddingSx,
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
            <Box
              sx={{
                alignItems: "baseline",
                display: "flex",
                gap: 1,
                justifyContent: "flex-start",
                minWidth: 0,
                px: { md: 2, xs: 1 },
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
                {familyFormat.formatCurrency(group.paidAmount)}
              </Typography>
            </Box>
            <LoanAmountCell value={group.paidAmount} weight={700} />
            <LoanAmountCell value={group.feesAmount} weight={700} />
            <LoanAmountCell value={group.repaymentAmount} weight={700} />
            <LoanAmountCell value={group.remainingAmount} weight={700} />
            <Box aria-hidden="true" />
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ borderBottom: 0, p: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            {group.lines.map((line) => (
              <LoanLineRow
                createdAtFormatter={createdAtFormatter}
                disabled={disabled}
                key={line.line.id}
                line={line}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
              />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function LoanLineRow({
  createdAtFormatter,
  disabled,
  line,
  onDeleteLine,
  onEditLine,
}: {
  createdAtFormatter: Intl.DateTimeFormat;
  disabled: boolean;
  line: FamilyLoanRepaymentLine;
  onDeleteLine: (line: FamilyLoanRepaymentLine) => void;
  onEditLine: (line: FamilyLoanRepaymentLine) => void;
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
        ...loansTableRowPaddingSx,
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
      <LoanAmountCell value={line.line.paidAmount} />
      <LoanAmountCell value={line.feesAmount} />
      <LoanAmountCell tone="positive" value={line.repaymentAmount} />
      <LoanAmountCell value={line.remainingAfter} />
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
        <ActionIconButton
          disabled={disabled}
          icon={<EditIcon fontSize="small" />}
          label={t("loans.line.editLabel", { label: lineLabel })}
          onClick={() => onEditLine(line)}
          size="small"
          stopPropagation
          tooltip={t("loans.line.editTooltip")}
        />
        <ActionIconButton
          disabled={disabled}
          icon={<DeleteIcon fontSize="small" />}
          label={t("loans.line.deleteLabel", { label: lineLabel })}
          onClick={() => onDeleteLine(line)}
          size="small"
          stopPropagation
          tooltip={t("loans.line.deleteTooltip")}
        />
      </Box>
    </Box>
  );
}

function LoanAmountCell({
  tone,
  value,
  weight = 400,
}: {
  tone?: "positive";
  value: number;
  weight?: number;
}) {
  const familyFormat = useFamilyFormat();

  return (
    <Box
      sx={{
        alignSelf: "center",
        color: tone === "positive" ? "success.main" : "inherit",
        fontSize: { sm: "0.875rem", xs: "0.8125rem" },
        fontWeight: weight,
        px: { md: 2, xs: 1 },
        py: 1.25,
        textAlign: "right",
        whiteSpace: "nowrap",
      }}
    >
      {familyFormat.formatCurrency(value)}
    </Box>
  );
}

function LoansEmptyState({ hasLoans }: { hasLoans: boolean }) {
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
        <AccountBalanceIcon />
      </Box>
      <Typography sx={{ mt: 1.5 }} variant="h4">
        {t("loans.table.empty.title")}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ maxWidth: 300, mt: 0.5 }}
        variant="body2"
      >
        {hasLoans
          ? t("loans.table.empty.noLinesInYear")
          : t("loans.table.empty.noLoan")}
      </Typography>
    </Box>
  );
}

function getDefaultCollapsedMonthIds(
  monthGroups: FamilyLoanMonthGroup[],
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
