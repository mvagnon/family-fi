import { Fragment } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { alpha } from "@mui/material/styles";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";

import { getCategoryGroups, getMonthlyRange } from "../domain/family-budget";
import type { FamilyCategory, RecurringLine } from "../domain/family";
import {
  formatCurrency,
  formatLineAmount,
  formatRecurrence,
} from "./family-format";

const lineHoverBackground = "#f2e5c9";
const lineHoverRadius = 2;
const tableGridColumns = "minmax(300px, 1fr) 170px 170px 120px";
const tableHeaderTextSx = {
  color: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  px: 2,
  textTransform: "inherit",
};

interface FamilyBudgetTableProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  lines: RecurringLine[];
  onAddLine: () => void;
  onDeleteLine: (line: RecurringLine) => void;
  onEditLine: (line: RecurringLine) => void;
  onViewLine?: (line: RecurringLine) => void;
}

export function FamilyBudgetTable({
  categories,
  disabled = false,
  lines,
  onAddLine,
  onDeleteLine,
  onEditLine,
  onViewLine,
}: FamilyBudgetTableProps) {
  const categoryGroups = getCategoryGroups(categories, lines);

  function handleLineClick(line: RecurringLine) {
    if (!disabled) {
      onViewLine?.(line);
    }
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
          Ajouter une ligne
        </LoadingButton>
      }
      contentSx={{ p: 0 }}
      headerSx={{
        alignItems: { sm: "center", xs: "flex-start" },
        flexDirection: { sm: "row", xs: "column" },
      }}
      title="Budget récurrent"
      titleId="family-budget-title"
    >
      <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
        <Table
          aria-label="Configuration des dépenses et revenus récurrents"
          stickyHeader
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 760,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={4} sx={{ p: 0 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: tableGridColumns,
                    pb: 1,
                  }}
                >
                  <Typography sx={tableHeaderTextSx}>Intitulé</Typography>
                  <Typography sx={tableHeaderTextSx}>Montant</Typography>
                  <Typography sx={tableHeaderTextSx}>Récurrence</Typography>
                  <Typography align="right" sx={tableHeaderTextSx}>
                    Actions
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryGroups.map((group) => (
              <Fragment key={group.id}>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    component="th"
                    scope="rowgroup"
                    sx={(theme) => ({
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      p: 0,
                    })}
                  >
                    <Box
                      sx={{
                        alignItems: { sm: "center", xs: "flex-start" },
                        display: "grid",
                        gap: 0.75,
                        gridTemplateColumns: tableGridColumns,
                        px: { md: 2, xs: 1.5 },
                        py: 0.85,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {group.label}
                      </Typography>
                      <Typography
                        sx={{
                          gridColumn: "2 / -1",
                          fontWeight: 800,
                          justifySelf: "end",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCategoryTotal(group.lines)} par mois
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>

                {group.lines.map((line) => (
                  <TableRow aria-disabled={disabled || undefined} key={line.id}>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <ButtonBase
                        aria-label={`Voir ${line.title}`}
                        disabled={disabled}
                        onClick={() => handleLineClick(line)}
                        sx={{
                          borderRadius: 0,
                          color: "inherit",
                          display: "grid",
                          gridTemplateColumns: tableGridColumns,
                          justifyItems: "stretch",
                          textAlign: "left",
                          transition:
                            "background-color 150ms ease,border-radius 360ms ease",
                          width: "100%",
                          "&:hover": {
                            backgroundColor: lineHoverBackground,
                            borderRadius: lineHoverRadius,
                          },
                        }}
                      >
                        <Box sx={{ minWidth: 0, px: 2, py: 1.5 }}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {line.title}
                          </Typography>
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
                          {formatLineAmount(line)}
                        </Box>
                        <Box sx={{ alignSelf: "center", px: 2, py: 1.5 }}>
                          {formatRecurrence(line.recurrenceMonths)}
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
                            label={`Modifier ${line.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditLine(line);
                            }}
                            size="small"
                            tooltip="Modifier la ligne"
                          />
                          <ActionIconButton
                            component="span"
                            disabled={disabled}
                            icon={<DeleteIcon fontSize="small" />}
                            label={`Supprimer ${line.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteLine(line);
                            }}
                            size="small"
                            tooltip="Supprimer la ligne"
                          />
                        </Box>
                      </ButtonBase>
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionPanel>
  );
}

function formatCategoryTotal(lines: RecurringLine[]): string {
  const total = lines.reduce(
    (summary, line) => {
      const range = getMonthlyRange(line);

      return {
        high: summary.high + range.max,
        low: summary.low + range.min,
      };
    },
    { high: 0, low: 0 },
  );

  if (total.low === total.high) {
    return formatCurrency(total.low);
  }

  return `${formatCurrency(total.low)} à ${formatCurrency(total.high)}`;
}
