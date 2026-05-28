import SvgIcon from "@mui/material/SvgIcon";
import type { SvgIconProps } from "@mui/material/SvgIcon";

export function PlusIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
    </SvgIcon>
  );
}

export function EditIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="m5 16.3 9.9-9.9 2.7 2.7L7.7 19H5v-2.7ZM16.3 5l1-1a1.9 1.9 0 0 1 2.7 2.7l-1 1L16.3 5Z" />
    </SvgIcon>
  );
}
