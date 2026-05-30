import "@fontsource-variable/nunito-sans/wght.css";
import Grow from "@mui/material/Grow";
import { alpha, createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const arcoPalette = {
  blue1: "#E8F3FF",
  blue2: "#BEDAFF",
  blue3: "#94BFFF",
  blue4: "#6AA1FF",
  blue5: "#4080FF",
  blue6: "#165DFF",
  blue7: "#0E42D2",
  cyan1: "#E8FFFB",
  cyan6: "#0FC6C2",
  gray1: "#F7F8FA",
  gray2: "#F2F3F5",
  gray3: "#E5E6EB",
  gray4: "#C9CDD4",
  gray5: "#A9AEB8",
  gray6: "#86909C",
  gray7: "#6B7785",
  gray8: "#4E5969",
  gray9: "#272E3B",
  gray10: "#1D2129",
  green1: "#E8FFEA",
  green6: "#00B42A",
  green7: "#009A29",
  orange1: "#FFF7E8",
  orange6: "#FF7D00",
  orange7: "#D25F00",
  red1: "#FFECE8",
  red6: "#F53F3F",
  red7: "#CB272D",
  white: "#FFFFFF",
} as const;

const fontFamily =
  '"Nunito Sans Variable", "Nunito Sans", ui-sans-serif, system-ui, sans-serif';

const appShadows = [
  "none",
  "0px 4px 10px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
  "0px 8px 20px rgba(0, 0, 0, 0.1)",
] satisfies ThemeOptions["shadows"];

const appThemeOptions = {
  shape: {
    borderRadius: 2,
  },
  shadows: appShadows,
  typography: {
    fontFamily,
    h1: {
      fontSize: "2.25rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 44 / 36,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 32 / 24,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 28 / 20,
    },
    h4: {
      fontSize: "1rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 24 / 16,
    },
    h5: {
      fontSize: "0.875rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 22 / 14,
    },
    h6: {
      fontSize: "0.8125rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 22 / 13,
    },
    body1: {
      fontSize: "0.875rem",
      letterSpacing: 0,
      lineHeight: 22 / 14,
    },
    body2: {
      fontSize: "0.75rem",
      letterSpacing: 0,
      lineHeight: 20 / 12,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 22 / 14,
      textTransform: "none",
    },
    caption: {
      fontSize: "0.75rem",
      letterSpacing: 0,
      lineHeight: 20 / 12,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: 0,
      lineHeight: 20 / 12,
      textTransform: "none",
    },
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          boxShadow: "none",
          minHeight: 32,
          paddingInline: theme.spacing(2),
          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.28)}`,
          },
          "&.MuiButton-containedPrimary": {
            backgroundColor: theme.palette.primary.main,
          },
          "&.MuiButton-containedPrimary:hover": {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: "none",
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderColor: theme.palette.primary.main,
          },
        }),
        text: ({ theme }) => ({
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: "primary",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          padding: theme.spacing(0.75),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          fontWeight: 600,
          minHeight: 24,
          "&.MuiChip-filledDefault": {
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: arcoPalette.gray1,
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        slots: {
          transition: Grow,
        },
      },
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          borderRadius: 4,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          padding: theme.spacing(2, 3),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(2, 3, 3),
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: theme.typography.h3.fontSize,
          fontWeight: 600,
          lineHeight: theme.typography.h3.lineHeight,
          padding: theme.spacing(3, 3, 1.5),
        }),
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "primary",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          "&:focus-visible": {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.28)}`,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.light,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: theme.palette.divider,
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
          borderRadius: 4,
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[200],
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.grey[50],
          color: theme.palette.text.secondary,
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: 0,
          lineHeight: 20 / 12,
          textTransform: "none",
        }),
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: arcoPalette.gray10,
          borderRadius: 2,
          fontSize: "0.75rem",
        },
      },
    },
  },
} satisfies ThemeOptions;

export const appTheme = createTheme({
  ...appThemeOptions,
  palette: {
    mode: "light",
    background: {
      default: arcoPalette.gray1,
      paper: arcoPalette.white,
    },
    divider: arcoPalette.gray3,
    error: {
      light: arcoPalette.red1,
      main: arcoPalette.red6,
      dark: arcoPalette.red7,
      contrastText: arcoPalette.white,
    },
    grey: {
      50: arcoPalette.gray1,
      100: arcoPalette.gray2,
      200: arcoPalette.gray3,
      300: arcoPalette.gray4,
      400: arcoPalette.gray5,
      500: arcoPalette.gray6,
      600: arcoPalette.gray7,
      700: arcoPalette.gray8,
      800: arcoPalette.gray9,
      900: arcoPalette.gray10,
    },
    info: {
      light: arcoPalette.cyan1,
      main: arcoPalette.cyan6,
      contrastText: arcoPalette.white,
    },
    primary: {
      light: arcoPalette.blue4,
      main: arcoPalette.blue6,
      dark: arcoPalette.blue7,
      contrastText: arcoPalette.white,
    },
    secondary: {
      light: arcoPalette.blue1,
      main: arcoPalette.blue5,
      dark: arcoPalette.blue7,
      contrastText: arcoPalette.white,
    },
    success: {
      light: arcoPalette.green1,
      main: arcoPalette.green6,
      dark: arcoPalette.green7,
      contrastText: arcoPalette.white,
    },
    warning: {
      light: arcoPalette.orange1,
      main: arcoPalette.orange6,
      dark: arcoPalette.orange7,
      contrastText: arcoPalette.white,
    },
    text: {
      primary: arcoPalette.gray10,
      secondary: arcoPalette.gray8,
      disabled: arcoPalette.gray5,
    },
  },
});
