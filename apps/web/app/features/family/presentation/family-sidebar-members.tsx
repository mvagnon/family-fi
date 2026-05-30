import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";

import type { FamilyMember } from "../domain/family";

interface FamilySidebarMembersProps {
  disabled: boolean;
  members: FamilyMember[];
  onAddMember: () => void;
  onDeleteMember: (member: FamilyMember) => void;
}

export function FamilySidebarMembers({
  disabled,
  members,
  onAddMember,
  onDeleteMember,
}: FamilySidebarMembersProps) {
  return (
    <SectionPanel
      action={
        <ActionIconButton
          disabled={disabled}
          icon={<AddIcon />}
          label="Ajouter un membre"
          onClick={onAddMember}
        />
      }
      contentSx={{ pb: { md: 2, xs: 1.5 }, px: { md: 2, xs: 1.5 } }}
      headerSx={{ p: { md: 2, xs: 1.5 } }}
      subtitle={`${members.length} personnes`}
      title="Membres"
      titleId="family-members-title"
      titleVariant="h3"
    >
      <Stack spacing={0.5}>
        {members.map((member) => (
          <FamilySidebarMemberRow
            disabled={disabled}
            key={member.id}
            member={member}
            onDeleteMember={onDeleteMember}
          />
        ))}
      </Stack>
    </SectionPanel>
  );
}

function FamilySidebarMemberRow({
  disabled,
  member,
  onDeleteMember,
}: {
  disabled: boolean;
  member: FamilyMember;
  onDeleteMember: (member: FamilyMember) => void;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: "36px minmax(0, 1fr) auto",
        py: 1,
      }}
    >
      <Avatar
        sx={{
          bgcolor: "primary.light",
          color: "primary.dark",
          fontSize: "0.875rem",
          height: 36,
          width: 36,
        }}
      >
        {member.name.slice(0, 1)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{member.name}</Typography>
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
  );
}
