import { alpha, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const appThemeOptions = {
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
    h4: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
    },
    h5: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
    },
    h6: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
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
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "primary",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover": {
            backgroundColor: alpha(theme.palette.secondary.main, 0.28),
          },
        }),
      },
    },
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
          backgroundColor: "#FFF8ED",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
        },
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
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.secondary,
          fontSize: "0.7rem",
          fontWeight: 800,
          letterSpacing: 0,
          textTransform: "uppercase",
        }),
        root: {
          borderBottom: 0,
          verticalAlign: "top",
        },
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

export const appTheme = createTheme({
  ...appThemeOptions,
  palette: {
    mode: "light",
    background: {
      default: "#FFF8ED",
      paper: "#FEF3E2",
    },
    divider: "#F3D7AA",
    primary: {
      main: "#FAB12F",
      contrastText: "#2C1E10",
    },
    secondary: {
      main: "#FA812F",
      contrastText: "#2C1E10",
    },
    error: {
      main: "#DD0303",
      contrastText: "#FFF8ED",
    },
    warning: {
      main: "#DD0303",
      contrastText: "#FFF8ED",
    },
    text: {
      primary: "#2C1E10",
      secondary: "#65462A",
    },
  },
});
