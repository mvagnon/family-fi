import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { FamilyMember } from "../domain/family";

interface FamilySidebarMembersProps {
  disabled: boolean;
  getMemberSecondaryContent?: (member: FamilyMember) => ReactNode;
  isMemberVisible?: (memberId: string) => boolean;
  members: FamilyMember[];
  onAddMember?: () => void;
  onDeleteMember?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onToggleMemberVisibility?: (member: FamilyMember) => void;
}

export function FamilySidebarMembers({
  disabled,
  getMemberSecondaryContent,
  isMemberVisible,
  members,
  onAddMember,
  onDeleteMember,
  onEditMember,
  onToggleMemberVisibility,
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
            secondaryContent={getMemberSecondaryContent?.(member)}
            isVisible={isMemberVisible?.(member.id) ?? true}
            key={member.id}
            member={member}
            onDeleteMember={onDeleteMember}
            onEditMember={onEditMember}
            onToggleMemberVisibility={onToggleMemberVisibility}
          />
        ))}
      </Stack>
    </SectionPanel>
  );
}

function FamilySidebarMemberRow({
  disabled,
  isVisible,
  member,
  onDeleteMember,
  onEditMember,
  onToggleMemberVisibility,
  secondaryContent,
}: {
  disabled: boolean;
  isVisible: boolean;
  member: FamilyMember;
  onDeleteMember?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onToggleMemberVisibility?: (member: FamilyMember) => void;
  secondaryContent?: ReactNode;
}) {
  const { t } = useTranslation();
  const hasActions = Boolean(
    onDeleteMember || onEditMember || onToggleMemberVisibility,
  );

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "grid",
        gap: 1.25,
        gridTemplateColumns: hasActions
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
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: "center", flexWrap: "wrap", mt: 0.25 }}
        >
          <Typography sx={{ fontWeight: 600 }}>{member.name}</Typography>
          {member.isActive && (
            <Tooltip title={t("family.sidebar.members.activeTooltip")}>
              <CheckIcon
                aria-label={t("family.sidebar.members.activeLabel")}
                color="primary"
                fontSize="small"
              />
            </Tooltip>
          )}
        </Stack>
        {secondaryContent ? (
          <Box sx={{ mt: 0.25, minWidth: 0 }}>{secondaryContent}</Box>
        ) : null}
      </Box>
      {hasActions ? (
        <Stack direction="row" spacing={0.25}>
          {onEditMember ? (
            <ActionIconButton
              disabled={disabled}
              icon={<EditIcon fontSize="small" />}
              label={t("family.sidebar.members.editLabel", {
                name: member.name,
              })}
              onClick={() => onEditMember(member)}
              size="small"
              tooltip={t("family.sidebar.members.editTooltip")}
            />
          ) : null}
          {onToggleMemberVisibility ? (
            <ActionIconButton
              disabled={disabled}
              icon={
                isVisible ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )
              }
              label={t(
                isVisible
                  ? "family.sidebar.members.hideLabel"
                  : "family.sidebar.members.showLabel",
                { name: member.name },
              )}
              onClick={() => onToggleMemberVisibility(member)}
              size="small"
              tooltip={t(
                isVisible
                  ? "family.sidebar.members.hideTooltip"
                  : "family.sidebar.members.showTooltip",
              )}
            />
          ) : null}
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
        </Stack>
      ) : null}
    </Box>
  );
}
