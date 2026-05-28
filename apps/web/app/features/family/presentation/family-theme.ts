import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

import { sharedThemeOptions } from "~/theme";

const familyThemeOptions = {
  cssVariables: true,
  palette: {
    mode: "light",
    background: {
      default: "#FFFDF5",
      paper: "#FFFBEA",
    },
    divider: "#F2EDC8",
    primary: {
      main: "#306D29",
      contrastText: "#FFFDF5",
    },
    secondary: {
      main: "#0D530E",
      contrastText: "#FFFDF5",
    },
    text: {
      primary: "#0D530E",
      secondary: "#306D29",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Sora Variable", "Sora", sans-serif',
    h1: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
      fontSize: "4rem",
      fontWeight: 760,
      letterSpacing: 0,
      lineHeight: 0.96,
    },
    h2: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
      fontSize: "1.65rem",
      fontWeight: 720,
      letterSpacing: 0,
      lineHeight: 1.05,
    },
    h3: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
      fontSize: "1.25rem",
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.1,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "none",
    },
    overline: {
      fontSize: "0.72rem",
      fontWeight: 800,
      letterSpacing: 0,
    },
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#FFFDF5",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundImage: "none",
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontSize: "0.72rem",
          fontWeight: 800,
          letterSpacing: 0,
          textTransform: "uppercase",
        }),
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
          verticalAlign: "top",
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },
  },
} satisfies ThemeOptions;

export const familyTheme = createTheme({
  ...sharedThemeOptions,
  ...familyThemeOptions,
  components: {
    ...sharedThemeOptions.components,
    ...familyThemeOptions.components,
  },
});
