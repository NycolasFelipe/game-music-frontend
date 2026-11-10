import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

/**
 * Identidade "revista" (ADR-0002): papel, tinta e um vermelho de destaque.
 * As paletas têm a cor de marca no índice 6 (o `primaryShade`), para que
 * `filled` use a tinta chapada e o hover escureça um passo.
 */
export const PAPER = "#f2ede3";
export const INK = "#131211";
export const PRESS_RED = "#d4241b";

/** Tinta: do papel (0) à tinta chapada (6) e além (hover). */
const ink: MantineColorsTuple = [
  "#f2ede3",
  "#e4ddcf",
  "#c9c0ae",
  "#a69c89",
  "#6d665c",
  "#35322d",
  "#131211",
  "#0f0e0d",
  "#0b0a09",
  "#070606",
];

/** Vermelho de impressão, o único destaque da revista. */
const press: MantineColorsTuple = [
  "#fdeceb",
  "#f8cfcc",
  "#f0a19b",
  "#e8726a",
  "#e04a40",
  "#d93228",
  "#d4241b",
  "#b81e16",
  "#981811",
  "#78120c",
];

/** Verde só para números positivos (caixa, saldo). */
const ledgerGreen: MantineColorsTuple = [
  "#e9f3ec",
  "#cfe5d5",
  "#a3ccb0",
  "#74b088",
  "#4c9466",
  "#378551",
  "#2c7a3f",
  "#256836",
  "#1e552c",
  "#164222",
];

/** Cinzas quentes, puxados para o papel. */
const warmGray: MantineColorsTuple = [
  "#f7f3ec",
  "#ece6da",
  "#ddd5c6",
  "#c9c0ae",
  "#b9b1a3",
  "#8f877a",
  "#6d665c",
  "#57514a",
  "#403c37",
  "#2a2724",
];

/**
 * Mantine theme. As cores nomeadas que o código já usa (teal, grape, orange…)
 * são remapeadas para a paleta da revista, para os componentes existentes
 * herdarem a identidade sem reescrita.
 */
export const theme = createTheme({
  white: PAPER,
  black: INK,
  primaryColor: "ink",
  primaryShade: 6,
  colors: {
    ink,
    press,
    red: press,
    orange: press,
    yellow: press,
    pink: press,
    teal: ledgerGreen,
    green: ledgerGreen,
    lime: ledgerGreen,
    gray: warmGray,
    grape: ink,
    violet: ink,
    indigo: ink,
    blue: ink,
    cyan: ink,
  },
  defaultRadius: 0,
  radius: { xs: "0", sm: "0", md: "0", lg: "0", xl: "0" },
  fontFamily: '"Libre Franklin", system-ui, sans-serif',
  fontFamilyMonospace: '"IBM Plex Mono", ui-monospace, monospace',
  headings: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontWeight: "900",
  },
  shadows: {
    xs: "2px 2px 0 rgba(19,18,17,.12)",
    sm: "4px 4px 0 rgba(19,18,17,.14)",
    md: "6px 6px 0 rgba(19,18,17,.15)",
    lg: "8px 8px 0 rgba(19,18,17,.16)",
    xl: "10px 10px 0 rgba(19,18,17,.18)",
  },
  components: {
    Button: {
      styles: {
        root: { borderWidth: 2 },
        label: {
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 800,
        },
      },
    },
    Badge: {
      defaultProps: { variant: "outline" },
      styles: {
        root: {
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontWeight: 600,
          letterSpacing: "0.04em",
          borderWidth: 1,
        },
      },
    },
    Paper: {
      styles: { root: { backgroundColor: "transparent" } },
    },
    Card: {
      styles: { root: { backgroundColor: "transparent" } },
    },
    Modal: {
      defaultProps: { overlayProps: { backgroundOpacity: 0.5, color: INK } },
      styles: {
        content: {
          backgroundColor: PAPER,
          borderTop: `8px solid ${PRESS_RED}`,
          boxShadow: "0 30px 80px rgba(0,0,0,.4)",
        },
        header: { backgroundColor: PAPER },
        title: {
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 900,
          fontSize: 26,
          lineHeight: 1.1,
        },
      },
    },
    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: INK,
          color: PAPER,
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 12,
        },
      },
    },
    HoverCard: {
      styles: {
        dropdown: { backgroundColor: PAPER, border: `1px solid ${INK}` },
      },
    },
    Popover: {
      styles: {
        dropdown: { backgroundColor: PAPER, border: `1px solid ${INK}` },
      },
    },
    Notification: {
      styles: {
        root: {
          backgroundColor: PAPER,
          border: `1px solid ${INK}`,
          boxShadow: "6px 6px 0 rgba(19,18,17,.18)",
        },
        title: {
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 900,
          fontSize: 16,
        },
        description: { color: INK },
      },
    },
    Progress: {
      styles: { root: { backgroundColor: "transparent", border: `1px solid ${INK}` } },
    },
    SegmentedControl: {
      defaultProps: { color: "ink" },
      styles: {
        root: { backgroundColor: "transparent", border: `1px solid ${INK}` },
        label: {
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: 12,
        },
      },
    },
    Tabs: {
      styles: {
        tab: {
          fontWeight: 800,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        },
      },
    },
  },
});

/**
 * Variáveis do tema claro: a "folha" é papel e o texto é tinta. Bordas padrão
 * viram fio de tinta, como nas colunas de uma revista.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": PAPER,
    "--mantine-color-text": INK,
    "--mantine-color-dimmed": "#6d665c",
    "--mantine-color-default-border": INK,
    "--mantine-color-default": "transparent",
    "--mantine-color-default-hover": "#e9e2d4",
    "--mantine-color-default-color": INK,
    "--mantine-color-placeholder": "#8f877a",
    "--mantine-color-anchor": INK,
  },
  dark: {},
});
