import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";

import type { FamilyCategory, FamilyMember } from "../domain/family";

interface FamilySidebarProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  members: FamilyMember[];
  onAddCategory: () => void;
  onAddMember: () => void;
  onDeleteCategory: (category: FamilyCategory) => void;
  onDeleteMember: (member: FamilyMember) => void;
}

export function FamilySidebar({
  categories,
  disabled = false,
  members,
  onAddCategory,
  onAddMember,
  onDeleteCategory,
  onDeleteMember,
}: FamilySidebarProps) {
  const sharedCategories = categories.filter(
    (category) => category.kind === "shared",
  );
  const professionalCategories = categories.filter(
    (category) => category.kind === "professional",
  );

  return (
    <Stack component="aside" spacing={2.5}>
      <SectionPanel
        action={
          <ActionIconButton
            disabled={disabled}
            icon={<AddIcon />}
            label="Ajouter un membre"
            onClick={onAddMember}
          />
        }
        contentSx={{ pb: { md: 2.5, xs: 2 }, px: { md: 2.5, xs: 2 } }}
        headerSx={{ p: { md: 2.5, xs: 2 } }}
        subtitle={`${members.length} personnes`}
        title="Membres"
        titleId="family-members-title"
        titleVariant="h3"
      >
        <Stack spacing={1.5}>
          {members.map((member) => (
            <Box
              key={member.id}
              sx={{
                alignItems: "center",
                display: "grid",
                gap: 1.25,
                gridTemplateColumns: "40px minmax(0, 1fr) auto",
                py: 1.25,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 800,
                  height: 40,
                  width: 40,
                }}
              >
                {member.name.slice(0, 1)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }}>{member.name}</Typography>
                {member.role ? (
                  <Typography color="text.secondary" variant="body2">
                    {member.role}
                  </Typography>
                ) : null}
              </Box>
              <ActionIconButton
                disabled={disabled}
                icon={<DeleteIcon fontSize="small" />}
                label={`Supprimer ${member.name}`}
                onClick={() => onDeleteMember(member)}
                size="small"
                tooltip="Supprimer le membre"
              />
            </Box>
          ))}
        </Stack>
      </SectionPanel>

      <SectionPanel
        action={
          <ActionIconButton
            disabled={disabled}
            icon={<AddIcon />}
            label="Ajouter une catégorie"
            onClick={onAddCategory}
          />
        }
        contentSx={{ pb: { md: 2.5, xs: 2 }, px: { md: 2.5, xs: 2 } }}
        headerSx={{ p: { md: 2.5, xs: 2 } }}
        title="Catégories"
        titleId="family-categories-title"
        titleVariant="h3"
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {sharedCategories.map((category) => (
            <Box
              key={category.id}
              sx={{ alignItems: "center", display: "inline-flex", gap: 0.25 }}
            >
              <Chip label={category.label} />
              <ActionIconButton
                disabled={disabled}
                icon={<DeleteIcon fontSize="small" />}
                label={`Supprimer ${category.label}`}
                onClick={() => onDeleteCategory(category)}
                size="small"
                tooltip="Supprimer la catégorie"
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
          {professionalCategories.map((category) => (
            <Chip
              color="primary"
              key={getCategoryChipKey(category)}
              label={category.label}
            />
          ))}
        </Box>
      </SectionPanel>
    </Stack>
  );
}

function getCategoryChipKey(category: FamilyCategory): string {
  return `${category.kind}-${category.ownerId ?? category.id.replace(/^pro-/, "")}`;
}
