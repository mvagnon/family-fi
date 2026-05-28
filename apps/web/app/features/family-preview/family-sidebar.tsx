import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { PlusIcon } from "./icons";
import type { FamilyCategory, FamilyMember } from "./types";

interface FamilySidebarProps {
  categories: FamilyCategory[];
  members: FamilyMember[];
  onAddCategory: () => void;
  onAddMember: () => void;
}

export function FamilySidebar({
  categories,
  members,
  onAddCategory,
  onAddMember,
}: FamilySidebarProps) {
  const sharedCategories = categories.filter(
    (category) => category.kind === "shared",
  );
  const professionalCategories = categories.filter(
    (category) => category.kind === "professional",
  );

  return (
    <Stack component="aside" spacing={2.5}>
      <Paper
        aria-labelledby="family-members-title"
        component="section"
        sx={{ p: { md: 2.5, xs: 2 } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography id="family-members-title" variant="h3">
              Membres
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {members.length} personnes
            </Typography>
          </Box>
          <Tooltip title="Ajouter un membre">
            <IconButton aria-label="Ajouter un membre" onClick={onAddMember}>
              <PlusIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {members.map((member, index) => (
            <Box
              key={member.id}
              sx={(theme) => ({
                alignItems: "center",
                borderTop:
                  index === 0 ? 0 : `1px solid ${theme.palette.divider}`,
                display: "grid",
                gap: 1.25,
                gridTemplateColumns: "40px minmax(0, 1fr)",
                py: 1.25,
              })}
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
                <Typography color="text.secondary" variant="body2">
                  {member.role}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper
        aria-labelledby="family-categories-title"
        component="section"
        sx={{ p: { md: 2.5, xs: 2 } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Box>
            <Typography id="family-categories-title" variant="h3">
              Catégories
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Noms utilisés pour classer les lignes.
            </Typography>
          </Box>
          <Tooltip title="Ajouter une catégorie">
            <IconButton
              aria-label="Ajouter une catégorie"
              onClick={onAddCategory}
            >
              <PlusIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {sharedCategories.map((category) => (
            <Chip key={category.id} label={category.label} />
          ))}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
          {professionalCategories.map((category) => (
            <Chip
              color="secondary"
              key={category.id}
              label={category.label}
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>
    </Stack>
  );
}
