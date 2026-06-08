import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { useTranslation } from "react-i18next";

import type { AssignableSpaceRole, SpaceMember } from "../domain/spaces";
import { SpaceUserRoleSelect } from "./space-user-role-select";

interface SpaceMembersTableProps {
  disabled: boolean;
  members: SpaceMember[];
  onRemove: (member: SpaceMember) => void;
  onUpdateRole: (member: SpaceMember, role: AssignableSpaceRole) => void;
}

export function SpaceMembersTable({
  disabled,
  members,
  onRemove,
  onUpdateRole,
}: SpaceMembersTableProps) {
  const { t } = useTranslation();

  return (
    <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
      <Table
        aria-label={t("configuration.spaceUsers.membersAriaLabel")}
        size="small"
        sx={{ minWidth: 620 }}
      >
        <TableHead>
          <TableRow>
            <TableCell>{t("configuration.spaceUsers.member")}</TableCell>
            <TableCell sx={spaceMemberRoleHeaderCellSx}>
              {t("configuration.spaceUsers.role")}
            </TableCell>
            <TableCell align="center" sx={spaceMemberActionsHeaderCellSx}>
              {t("common.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => {
            const isOwner = member.role === "owner";
            const assignableRole =
              member.role === "read" || member.role === "write"
                ? member.role
                : "read";

            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {member.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={spaceMemberRoleCellSx}>
                  {isOwner ? (
                    <Typography sx={{ fontWeight: 600 }} variant="body2">
                      {t("spaces.roles.owner")}
                    </Typography>
                  ) : (
                    <SpaceUserRoleSelect
                      disabled={disabled}
                      onChange={(role) => onUpdateRole(member, role)}
                      value={assignableRole}
                    />
                  )}
                </TableCell>
                <TableCell align="center" sx={spaceMemberActionsCellSx}>
                  {!isOwner ? (
                    <ActionIconButton
                      disabled={disabled}
                      icon={<DeleteIcon fontSize="small" />}
                      label={t("configuration.spaceUsers.removeLabel", {
                        name: member.name,
                      })}
                      onClick={() => onRemove(member)}
                      size="small"
                      tooltip={t("configuration.spaceUsers.removeTooltip")}
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const spaceMemberRoleHeaderCellSx = {
  verticalAlign: "middle",
  width: 180,
};

const spaceMemberActionsHeaderCellSx = {
  verticalAlign: "middle",
  width: 96,
};

const spaceMemberRoleCellSx = {
  verticalAlign: "middle",
  width: 180,
};

const spaceMemberActionsCellSx = {
  verticalAlign: "middle",
  width: 96,
};
