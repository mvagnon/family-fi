import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

interface SectionPanelProps {
  action?: ReactNode;
  children: ReactNode;
  component?: ElementType;
  contentSx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  subtitle?: ReactNode;
  sx?: SxProps<Theme>;
  title: ReactNode;
  titleId?: string;
  titleVariant?: "h2" | "h3";
}

export function SectionPanel({
  action,
  children,
  component = "section",
  contentSx,
  headerSx,
  subtitle,
  sx,
  title,
  titleId,
  titleVariant = "h2",
}: SectionPanelProps) {
  return (
    <Paper
      aria-labelledby={titleId}
      component={component}
      sx={[{ overflow: "hidden" }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack
        direction="row"
        sx={[
          {
            alignItems: "center",
            gap: 1.5,
            justifyContent: "space-between",
            p: { md: 3, xs: 2 },
          },
          ...(Array.isArray(headerSx) ? headerSx : [headerSx]),
        ]}
      >
        <Box>
          <Typography id={titleId} variant={titleVariant}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography color="text.secondary" variant="body2">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Stack>

      <Box sx={contentSx}>{children}</Box>
    </Paper>
  );
}
