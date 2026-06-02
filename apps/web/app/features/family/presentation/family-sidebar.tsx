import Stack from "@mui/material/Stack";

import type { FamilyCategory, FamilyMember } from "../domain/family";
import { FamilySidebarCategories } from "./family-sidebar-categories";
import { FamilySidebarMembers } from "./family-sidebar-members";

interface FamilySidebarProps {
  categories: FamilyCategory[];
  disabled?: boolean;
  isMemberVisible?: (memberId: string) => boolean;
  members: FamilyMember[];
  onAddCategory: () => void;
  onAddMember: () => void;
  onDeleteCategory: (category: FamilyCategory) => void;
  onDeleteMember: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onToggleMemberVisibility?: (member: FamilyMember) => void;
}

export function FamilySidebar({
  categories,
  disabled = false,
  isMemberVisible,
  members,
  onAddCategory,
  onAddMember,
  onDeleteCategory,
  onDeleteMember,
  onEditMember,
  onToggleMemberVisibility,
}: FamilySidebarProps) {
  const sharedCategories = categories.filter(
    (category) => category.kind === "shared",
  );
  const professionalCategories = categories.filter(
    (category) => category.kind === "professional",
  );

  return (
    <Stack component="aside" spacing={2}>
      <FamilySidebarMembers
        disabled={disabled}
        isMemberVisible={isMemberVisible}
        members={members}
        onAddMember={onAddMember}
        onDeleteMember={onDeleteMember}
        onEditMember={onEditMember}
        onToggleMemberVisibility={onToggleMemberVisibility}
      />
      <FamilySidebarCategories
        disabled={disabled}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
        professionalCategories={professionalCategories}
        sharedCategories={sharedCategories}
      />
    </Stack>
  );
}
