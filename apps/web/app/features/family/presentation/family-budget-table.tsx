import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";

import { getCategoryGroups } from "../domain/family-budget";
import type { FamilyCategory, RecurringLine } from "../domain/family";
import { FamilyBudgetEmptyState } from "./family-budget-empty-state";
import { FamilyBudgetCategoryGroup } from "./family-budget-category-group";
import {
  familyBudgetTableGridColumns,
  familyBudgetTableHeaderTextSx,
} from "./family-budget-table-layout";

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
  const hasLines = lines.length > 0;

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
      {!hasLines ? <FamilyBudgetEmptyState /> : null}
      <TableContainer
        sx={{
          display: hasLines ? "block" : "none",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
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
                    gridTemplateColumns: familyBudgetTableGridColumns,
                    backgroundColor: "Background",
                    pb: 1,
                  }}
                >
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    Intitulé
                  </Typography>
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    Montant
                  </Typography>
                  <Typography sx={familyBudgetTableHeaderTextSx}>
                    Récurrence
                  </Typography>
                  <Typography align="right" sx={familyBudgetTableHeaderTextSx}>
                    Actions
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoryGroups.map((group) => (
              <FamilyBudgetCategoryGroup
                disabled={disabled}
                group={group}
                key={group.id}
                onDeleteLine={onDeleteLine}
                onEditLine={onEditLine}
                onViewLine={onViewLine}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionPanel>
  );
}
