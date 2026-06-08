import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  useAddSpaceMember,
  useRemoveSpaceMember,
  useSpaceMembers,
  useSpaceUserSearch,
  useUpdateSpaceMember,
} from "../application/space-queries";
import type { SpaceRepository } from "../domain/space-repository";
import type {
  AssignableSpaceRole,
  SpaceMember,
  SpaceUserSearchResult,
} from "../domain/spaces";
import { useActiveSpace } from "./active-space-provider";
import { SpaceMembersTable } from "./space-members-table";
import { SpaceUserRoleSelect } from "./space-user-role-select";

interface SpaceUsersSettingsProps {
  repository: SpaceRepository;
}

export function SpaceUsersSettings({ repository }: SpaceUsersSettingsProps) {
  const { t } = useTranslation();
  const { activeSpace, error, isFetching, isPending, permissions, refetch } =
    useActiveSpace();
  const spaceId = activeSpace?.id ?? "";
  const membersQuery = useSpaceMembers(
    repository,
    activeSpace?.id ?? null,
    permissions.canManageSpace,
  );
  const addMember = useAddSpaceMember(repository, spaceId);
  const updateMember = useUpdateSpaceMember(repository, spaceId);
  const removeMember = useRemoveSpaceMember(repository, spaceId);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] =
    useState<SpaceUserSearchResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<AssignableSpaceRole>("read");
  const trimmedSearchText = searchText.trim();
  const userSearch = useSpaceUserSearch(
    repository,
    activeSpace?.id ?? null,
    { query: trimmedSearchText },
    permissions.canManageSpace,
  );
  const mutationError =
    addMember.error ?? updateMember.error ?? removeMember.error;
  const isMutating =
    addMember.isPending || updateMember.isPending || removeMember.isPending;

  useEffect(() => {
    setSearchText("");
    setSelectedUser(null);
    setSelectedRole("read");
  }, [activeSpace?.id]);

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeSpace || !selectedUser) {
      return;
    }

    try {
      await addMember.mutateAsync({
        role: selectedRole,
        userId: selectedUser.id,
      });
      setSearchText("");
      setSelectedUser(null);
      setSelectedRole("read");
    } catch {
      return;
    }
  }

  async function handleUpdateMember(
    member: SpaceMember,
    role: AssignableSpaceRole,
  ) {
    if (member.role === role) {
      return;
    }

    try {
      await updateMember.mutateAsync({
        input: { role },
        userId: member.userId,
      });
    } catch {
      return;
    }
  }

  async function handleRemoveMember(member: SpaceMember) {
    try {
      await removeMember.mutateAsync(member.userId);
    } catch {
      return;
    }
  }

  return (
    <>
      <SectionPanel
        contentSx={{ p: { md: 2.5, xs: 2 }, pt: 0 }}
        subtitle={t("configuration.spaceUsers.description")}
        title={t("configuration.spaceUsers.title")}
        titleId="configuration-space-users-title"
      >
        {isPending ? (
          <Stack
            aria-label={t("configuration.spaceUsers.loading")}
            spacing={1.5}
          >
            <Skeleton height={40} variant="rounded" />
            <Skeleton height={88} variant="rounded" />
          </Stack>
        ) : error ? (
          <Stack spacing={1.5}>
            <Alert severity="error" variant="outlined">
              {t("configuration.spaceUsers.activeSpaceError")}
            </Alert>
            <LoadingButton
              isLoading={isFetching}
              onClick={refetch}
              startIcon={<RefreshIcon />}
              variant="outlined"
            >
              {t("common.retry")}
            </LoadingButton>
          </Stack>
        ) : !activeSpace ? (
          <Alert severity="info" variant="outlined">
            {t("configuration.spaceUsers.empty")}
          </Alert>
        ) : !permissions.canManageSpace ? (
          <Alert severity="info" variant="outlined">
            {t("configuration.spaceUsers.ownerOnly")}
          </Alert>
        ) : membersQuery.isPending ? (
          <Stack
            aria-label={t("configuration.spaceUsers.loading")}
            spacing={1.5}
          >
            <Skeleton height={40} variant="rounded" />
            <Skeleton height={88} variant="rounded" />
          </Stack>
        ) : membersQuery.error ? (
          <Stack spacing={1.5}>
            <Alert severity="error" variant="outlined">
              {t("configuration.spaceUsers.error")}
            </Alert>
            <LoadingButton
              isLoading={membersQuery.isFetching}
              onClick={() => void membersQuery.refetch()}
              startIcon={<RefreshIcon />}
              variant="outlined"
            >
              {t("common.retry")}
            </LoadingButton>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Box component="form" onSubmit={handleAddMember}>
              <Stack
                direction={{ md: "row", xs: "column" }}
                spacing={1.5}
                sx={spaceUserFormRowSx}
              >
                <Autocomplete
                  filterOptions={(options) => options}
                  fullWidth
                  getOptionLabel={getUserOptionLabel}
                  inputValue={searchText}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  loading={userSearch.isFetching}
                  loadingText={t("configuration.spaceUsers.searchLoading")}
                  noOptionsText={
                    trimmedSearchText.length < 4
                      ? t("configuration.spaceUsers.searchMinLength")
                      : t("configuration.spaceUsers.searchEmpty")
                  }
                  onChange={(_, value) => setSelectedUser(value)}
                  onInputChange={(_, value) => setSearchText(value)}
                  options={userSearch.data ?? []}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("configuration.spaceUsers.searchLabel")}
                      size="medium"
                    />
                  )}
                  size="medium"
                  sx={spaceUserSearchAutocompleteSx}
                  value={selectedUser}
                />
                <Box sx={spaceUserRoleFieldSx}>
                  <SpaceUserRoleSelect
                    onChange={setSelectedRole}
                    size="medium"
                    value={selectedRole}
                  />
                </Box>
                <LoadingButton
                  disabled={!selectedUser}
                  isLoading={addMember.isPending}
                  startIcon={<AddIcon />}
                  sx={spaceUserAddButtonSx}
                  type="submit"
                  variant="contained"
                >
                  {t("configuration.spaceUsers.add")}
                </LoadingButton>
              </Stack>
              {userSearch.error ? (
                <Alert severity="error" sx={{ mt: 1.5 }} variant="outlined">
                  {t("configuration.spaceUsers.searchError")}
                </Alert>
              ) : null}
            </Box>

            {(membersQuery.data ?? []).length > 0 ? (
              <SpaceMembersTable
                disabled={isMutating}
                members={membersQuery.data ?? []}
                onRemove={handleRemoveMember}
                onUpdateRole={handleUpdateMember}
              />
            ) : (
              <Alert severity="info" variant="outlined">
                {t("configuration.spaceUsers.membersEmpty")}
              </Alert>
            )}
          </Stack>
        )}
      </SectionPanel>
      <FeedbackSnackbar
        message={
          mutationError ? t("configuration.spaceUsers.saveError") : undefined
        }
      />
    </>
  );
}

function getUserOptionLabel(user: SpaceUserSearchResult): string {
  return `${user.name} <${user.email}>`;
}

const spaceUserFormRowSx = {
  alignItems: { md: "flex-start", xs: "stretch" },
};

const spaceUserSearchAutocompleteSx = {
  alignSelf: "stretch",
  flex: { md: "1 1 320px", xs: "0 1 auto" },
  minWidth: 0,
  width: "100%",
};

const spaceUserRoleFieldSx = {
  flex: { md: "0 0 156px", xs: "0 1 auto" },
  minWidth: 0,
  width: { md: 156, xs: "100%" },
};

const spaceUserAddButtonSx = {
  flex: { md: "0 0 auto", xs: "0 1 auto" },
  minHeight: 56,
  width: { md: "auto", xs: "100%" },
};
