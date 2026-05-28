import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface FamilyPageShellProps {
  children: React.ReactNode;
}

export function FamilyPageShell({ children }: FamilyPageShellProps) {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        px: { lg: 5, md: 3, xs: 2 },
        py: { md: 4, xs: 2.5 },
      }}
    >
      <Stack spacing={{ md: 3, xs: 2.25 }}>
        <Stack
          component="header"
          direction={{ md: "row", xs: "column" }}
          spacing={2}
          sx={{
            alignItems: { md: "flex-end", xs: "flex-start" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h1">Foyer</Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 680, mt: 1.25 }}
              variant="body1"
            >
              Dépenses, revenus et récurrences du foyer
            </Typography>
          </Box>
        </Stack>

        {children}
      </Stack>
    </Box>
  );
}
