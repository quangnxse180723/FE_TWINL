import { createTheme } from '@mui/material'

export const appTheme = createTheme({
  palette: {
    primary: {
      main: '#0f8a4e',
      dark: '#0b6b3e',
      light: '#18c76d',
    },
    secondary: {
      main: '#0b3f6b',
    },
    background: {
      default: '#f7f7f4',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Manrope, system-ui, sans-serif',
    h1: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
})
