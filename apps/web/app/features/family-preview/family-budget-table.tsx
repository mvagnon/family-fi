import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { EditIcon } from "./icons";
import { formatCurrency, formatRecurrence } from "./preview-format";
import type { FamilyCategory, RecurringLine } from "./types";

interface FamilyBudgetTableProps {
  categories: FamilyCategory[];
  lines: RecurringLine[];
  onEditLine: (line: RecurringLine) => void;
}

export function FamilyBudgetTable({
  categories,
  lines,
  onEditLine,
}: FamilyBudgetTableProps) {
  const getCategoryLabel = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)?.label ??
    categoryId;

  return (
    <Paper
      aria-labelledby="family-budget-title"
      component="section"
      sx={{ overflow: "hidden" }}
    >
      <Box
        sx={{
          alignItems: { sm: "center" },
          display: "flex",
          flexDirection: { sm: "row", xs: "column" },
          gap: 1.5,
          justifyContent: "space-between",
          p: { md: 3, xs: 2 },
        }}
      >
        <Box>
          <Typography id="family-budget-title" variant="h2">
            Budget récurrent
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
            {lines.length} lignes de revenus et dépenses
          </Typography>
        </Box>
        <Chip color="secondary" label="Tableau de configuration" />
      </Box>

      <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
        <Table
          aria-label="Configuration des dépenses et revenus récurrents"
          stickyHeader
          sx={{ minWidth: 980 }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 300 }}>Intitulé</TableCell>
              <TableCell sx={{ width: 180 }}>Catégorie</TableCell>
              <TableCell sx={{ width: 150 }}>Mouvement</TableCell>
              <TableCell sx={{ width: 170 }}>Montant</TableCell>
              <TableCell sx={{ width: 190 }}>Estimation</TableCell>
              <TableCell sx={{ width: 170 }}>Récurrence</TableCell>
              <TableCell align="right" sx={{ width: 90 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow hover key={line.id}>
                <TableCell>
                  <Typography sx={{ fontWeight: 800 }}>{line.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {line.description}
                  </Typography>
                </TableCell>
                <TableCell>{getCategoryLabel(line.categoryId)}</TableCell>
                <TableCell>
                  {line.movement === "positive" ? "Entrée" : "Sortie"}
                </TableCell>
                <TableCell>
                  {line.isEstimate
                    ? `${formatCurrency(line.minAmount ?? line.amount)} à ${formatCurrency(
                        line.maxAmount ?? line.amount,
                      )}`
                    : formatCurrency(line.amount)}
                </TableCell>
                <TableCell>{line.isEstimate ? "Oui" : "Non"}</TableCell>
                <TableCell>{formatRecurrence(line.recurrenceMonths)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Modifier la ligne">
                    <IconButton
                      aria-label={`Modifier ${line.title}`}
                      onClick={() => onEditLine(line)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
