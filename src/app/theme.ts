import { alpha, createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f4f8f',
      light: '#4f7ab3',
      dark: '#163a67',
    },
    secondary: {
      main: '#0f766e',
    },
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#dbe4f0',
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#b7791f',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.4rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2.15rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.6rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.15rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
    },
    subtitle1: {
      fontSize: '0.98rem',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.98rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.55,
    },
    caption: {
      fontSize: '0.76rem',
      lineHeight: 1.45,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f4f7fb',
          color: '#0f172a',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#17324d',
          color: '#f8fafc',
          borderBottom: '1px solid rgba(226, 232, 240, 0.12)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #dbe4f0',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingInline: 14,
        },
        contained: {
          boxShadow: 'none',
        },
        outlined: {
          borderColor: '#cbd5e1',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f8fafc',
          color: '#334155',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
        body: {
          borderBottomColor: '#e2e8f0',
          verticalAlign: 'top',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        grouped: {
          borderRadius: 8,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          paddingInline: 16,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 44,
          fontWeight: 600,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.15rem',
          fontWeight: 700,
          paddingBottom: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#1f4f8f', 0.08),
          border: '1px solid rgba(31, 79, 143, 0.12)',
        },
      },
    },
  },
});
