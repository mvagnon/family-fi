import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface FamilyYearSelectorCardProps {
  currentYear: number;
  label: string;
  nextLabel: string;
  onYearChange: (year: number) => void;
  previousLabel: string;
  year: number;
  yearAriaLabel: string;
}

export function FamilyYearSelectorCard({
  currentYear,
  label,
  nextLabel,
  onYearChange,
  previousLabel,
  year,
  yearAriaLabel,
}: FamilyYearSelectorCardProps) {
  return (
    <Paper
      component="section"
      sx={{
        bgcolor: "background.paper",
        display: "grid",
        justifyItems: "center",
        justifySelf: { md: "start", xs: "stretch" },
        maxWidth: "100%",
        px: { md: 3, xs: 2.5 },
        py: { md: 2.5, xs: 2 },
        textAlign: "center",
        width: { md: "fit-content", xs: "100%" },
      }}
    >
      <Typography
        color="text.secondary"
        sx={{ justifySelf: "start", textAlign: "left" }}
        variant="overline"
      >
        {label}
      </Typography>
      <Stack
        spacing={1.5}
        sx={{
          alignItems: "center",
          mt: 1,
        }}
      >
        <Stack
          aria-label={yearAriaLabel}
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", justifyContent: "center" }}
        >
          <IconButton
            aria-label={previousLabel}
            onClick={() => onYearChange(year - 1)}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              minWidth: 72,
              textAlign: "center",
            }}
            variant="h2"
          >
            {year}
          </Typography>
          <IconButton
            aria-label={nextLabel}
            disabled={year >= currentYear}
            onClick={() => onYearChange(year + 1)}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
