import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import type { FamilyCategory } from "../domain/family";

interface FamilySidebarCategoriesProps {
  disabled: boolean;
  professionalCategories: FamilyCategory[];
  sharedCategories: FamilyCategory[];
  onAddCategory?: () => void;
  onDeleteCategory?: (category: FamilyCategory) => void;
}

export function FamilySidebarCategories({
  disabled,
  professionalCategories,
  sharedCategories,
  onAddCategory,
  onDeleteCategory,
}: FamilySidebarCategoriesProps) {
  const { t } = useTranslation();

  return (
    <SectionPanel
      action={
        onAddCategory ? (
          <ActionIconButton
            disabled={disabled}
            icon={<AddIcon />}
            label={t("family.sidebar.categories.addLabel")}
            onClick={onAddCategory}
          />
        ) : undefined
      }
      contentSx={{ pb: { md: 2, xs: 1.5 }, px: { md: 2, xs: 1.5 } }}
      headerSx={{ p: { md: 2, xs: 1.5 } }}
      title={t("family.sidebar.categories.title")}
      titleId="family-categories-title"
      titleVariant="h3"
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {sharedCategories.map((category) => (
          <Chip
            deleteIcon={<CloseIcon fontSize="small" />}
            disabled={disabled}
            key={category.id}
            label={category.label}
            onDelete={
              onDeleteCategory ? () => onDeleteCategory(category) : undefined
            }
            sx={{
              "& .MuiChip-deleteIcon": {
                color: "text.secondary",
                fontSize: 16,
                mr: 0.75,
                opacity: 0.72,
                transition: "color 120ms ease, opacity 120ms ease",
              },
              "& .MuiChip-deleteIcon:hover": {
                color: "error.main",
                opacity: 1,
              },
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {professionalCategories.map((category) => (
          <Chip
            color="primary"
            key={getCategoryChipKey(category)}
            label={category.label}
          />
        ))}
      </Box>
    </SectionPanel>
  );
}

function getCategoryChipKey(category: FamilyCategory): string {
  return `${category.kind}-${category.ownerId ?? category.id.replace(/^pro-/, "")}`;
}
