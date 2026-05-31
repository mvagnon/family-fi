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

const participationTableGridColumns = "minmax(240px, 1fr) 180px";

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
  const [collapsedMonthIds, setCollapsedMonthIds] = useState<Set<string>>(
    () => new Set(),
  );
  const hasMembers = monthGroups.some((group) => group.memberGroups.length > 0);
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        month: "long",
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
      {!hasMembers ? <ParticipationsEmptyState /> : null}
      <TableContainer
        sx={{
          display: hasMembers ? "block" : "none",
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
            minWidth: 520,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} sx={{ p: 0 }}>
                <Box
                  sx={{
                    backgroundColor: "Background",
                    display: "grid",
                    gridTemplateColumns: participationTableGridColumns,
                    pb: 1,
                  }}
                >
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    {t("participations.table.columns.member")}
                  </Typography>
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    {t("participations.table.columns.amount")}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {monthGroups.map((group) => (
              <ParticipationMonthGroup
                collapsed={collapsedMonthIds.has(group.id)}
                group={group}
                key={group.id}
                monthLabel={formatter.format(
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
  group,
  monthLabel,
  onToggle,
}: {
  collapsed: boolean;
  group: FamilyParticipationMonthGroup;
  monthLabel: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const toggleLabel = collapsed
    ? t("participations.table.expandMonth", { month: monthLabel })
    : t("participations.table.collapseMonth", { month: monthLabel });

  return (
    <Fragment>
      <TableRow>
        <TableCell colSpan={2} component="th" scope="rowgroup" sx={{ p: 0 }}>
          <Box
            sx={(theme) => ({
              alignItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: "grid",
              gap: 1,
              gridTemplateColumns: "40px minmax(0, 1fr) auto",
              px: { md: 2, xs: 1.5 },
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
            <Typography
              sx={{
                fontWeight: 700,
                justifySelf: "end",
                whiteSpace: "nowrap",
              }}
            >
              {familyFormat.formatCurrency(group.total)}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={2} sx={{ borderBottom: 0, p: 0 }}>
          <Collapse in={!collapsed} timeout="auto" unmountOnExit>
            {group.memberGroups.map((memberGroup) => (
              <ParticipationMemberGroup
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
  group,
}: {
  group: FamilyParticipationMemberMonthGroup;
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
        })}
      >
        <Box sx={{ minWidth: 0, px: 2, py: 1.25 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {group.member.name}
          </Typography>
        </Box>
        <Box
          sx={{
            alignSelf: "center",
            fontWeight: 700,
            px: 2,
            py: 1.25,
          }}
        >
          {familyFormat.formatCurrency(group.total)}
        </Box>
      </Box>
      {group.lines.length > 0 ? (
        group.lines.map((line) => (
          <ParticipationLineRow key={line.line.id} line={line} />
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
      <Box sx={{ minWidth: 0, px: 2, py: 1.25, pl: { md: 4, xs: 3 } }}>
        <Typography color="text.secondary" variant="body2">
          {t("participations.table.empty.memberLines")}
        </Typography>
      </Box>
      <Box />
    </Box>
  );
}

function ParticipationLineRow({ line }: { line: FamilyParticipationLine }) {
  const familyFormat = useFamilyFormat();

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        display: "grid",
        gridTemplateColumns: participationTableGridColumns,
      })}
    >
      <Box sx={{ minWidth: 0, px: 2, py: 1.5, pl: { md: 4, xs: 3 } }}>
        <Typography color="text.secondary" sx={{ fontWeight: 600 }} noWrap>
          {line.member.name}
        </Typography>
      </Box>
      <Box sx={{ alignSelf: "center", px: 2, py: 1.5 }}>
        {familyFormat.formatCurrency(line.monthlyValue)}
      </Box>
    </Box>
  );
}

function ParticipationsEmptyState() {
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
        {t("participations.table.empty.noMember")}
      </Typography>
    </Box>
  );
}
