import type { ReactNode } from "react";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

interface FamilyBudgetEmptyStateProps {
  description?: string;
  icon?: ReactNode;
  title?: string;
  width?: number;
}

export function FamilyBudgetEmptyState({
  description,
  icon,
  title,
  width = 240,
}: FamilyBudgetEmptyStateProps = {}) {
  const { t } = useTranslation();
  const emptyTitle = title ?? t("family.budget.empty.title");
  const emptyDescription = description ?? t("family.budget.empty.description");

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
        {icon ?? <ReceiptLongIcon />}
      </Box>
      <Typography sx={{ mt: 1.5 }} variant="h4">
        {emptyTitle}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ maxWidth: width, mt: 0.5 }}
        variant="body2"
      >
        {emptyDescription}
      </Typography>
    </Box>
  );
}
