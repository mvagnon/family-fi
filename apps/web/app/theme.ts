import { alpha, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

export const sharedThemeOptions = {
  typography: {
    fontFamily: '"Sora Variable", "Sora", sans-serif',
    h1: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
    },
    h2: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
    },
    h3: {
      fontFamily: '"Fraunces Variable", "Fraunces", serif',
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
  },
} satisfies ThemeOptions;

export const appTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: "light",
    background: {
      default: "#F4F1E8",
      paper: "#E8E2D0",
    },
    divider: "#CDD2C9",
    primary: {
      main: "#2D3A1F",
      contrastText: "#F4F1E8",
    },
    secondary: {
      main: "#B8A678",
      contrastText: "#2D3A1F",
    },
    text: {
      primary: "#2D3A1F",
      secondary: "#2D3A1F",
    },
  },
});
