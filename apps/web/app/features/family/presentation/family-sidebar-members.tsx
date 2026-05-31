import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import type { FamilyMember } from "../domain/family";

interface FamilySidebarMembersProps {
  disabled: boolean;
  members: FamilyMember[];
  onAddMember?: () => void;
  onDeleteMember?: (member: FamilyMember) => void;
}

export function FamilySidebarMembers({
  disabled,
  members,
  onAddMember,
  onDeleteMember,
}: FamilySidebarMembersProps) {
  const { t } = useTranslation();

  return (
    <SectionPanel
      action={
        onAddMember ? (
          <ActionIconButton
            disabled={disabled}
            icon={<AddIcon />}
            label={t("family.sidebar.members.addLabel")}
            onClick={onAddMember}
          />
        ) : undefined
      }
      contentSx={{ pb: { md: 2, xs: 1.5 }, px: { md: 2, xs: 1.5 } }}
      headerSx={{ p: { md: 2, xs: 1.5 } }}
      subtitle={t("family.sidebar.members.subtitle", {
        count: members.length,
      })}
      title={t("family.sidebar.members.title")}
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
  onDeleteMember?: (member: FamilyMember) => void;
}) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: onDeleteMember
          ? "36px minmax(0, 1fr) auto"
          : "36px minmax(0, 1fr)",
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
        {member.role || !member.isActive ? (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.25 }}
          >
            {member.role ? (
              <Typography color="text.secondary" variant="body2">
                {member.role}
              </Typography>
            ) : null}
            {!member.isActive ? (
              <Chip
                label={t("family.sidebar.members.inactive")}
                size="small"
                variant="outlined"
              />
            ) : null}
          </Stack>
        ) : null}
      </Box>
      {onDeleteMember ? (
        <ActionIconButton
          disabled={disabled}
          icon={<DeleteIcon fontSize="small" />}
          label={t("family.sidebar.members.deleteLabel", {
            name: member.name,
          })}
          onClick={() => onDeleteMember(member)}
          size="small"
          tooltip={t("family.sidebar.members.deleteTooltip")}
        />
      ) : null}
    </Box>
  );
}
