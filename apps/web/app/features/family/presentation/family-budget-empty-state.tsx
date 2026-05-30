import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export function FamilyBudgetEmptyState() {
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
        Aucune ligne récurrente
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ maxWidth: 240, mt: 0.5 }}
        variant="body2"
      >
        Les dépenses et revenus ajoutés apparaîtront ici.
      </Typography>
    </Box>
  );
}
