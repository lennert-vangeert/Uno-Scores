import type {
  MantineBreakpointsValues,
  MantineThemeOverride,
} from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import type * as React from "react";

// Color information
const colors = {
  text: "#1E1E1E",
  textLight: "#B8B8B8",
  white: "#FFFFFF",
  black: "#000000",
  dark: "#293644",
  medium: "#6F7881",
  light: "#B9C2CC",
  mainBackground: "#FDFDFD", // Semantic white remains for components: change this for dark mode for example
  backgroundTransparent: "transparent",
  warning: "#FFD676",
  default: {
    primary: "#BFDCE5", // background color for default button
    hover: "#B1DDE7", // hover color for default button
    focus: "#B1DDE7", // focus color for default button
    active: "#048C8C", // active color for default button
    disabled: "#E0E7F0", // disabled color for default button
    beige: "#FBF4EB",
    green: "#C9CD13",
  },
  background: {
    primaryBlue: "#B1DDE7",
    primaryPink: "#F2B8D5",
    primaryOrange: "#EB5D2D",
    hover: "#489DFC",
    focus: "#048C8C",
    active: "#0A4D6D",
    disabled: "#E0E7F0",
    textWhite: "#FFFFFF",
    textBlack: "#000000",
    yellow: "#F2BB09",
    purple: "#B098C4",
    darkBlue: "#3B509E",
    lightBlue: "#E5F9FE",
  },
};

// Breakpoints and spacing
const breakpoints: MantineBreakpointsValues = {
  xxs: "20rem",
  xs: "30rem",
  sm: "36rem",
  md: "48rem",
  lg: "58.75rem",
  xl: "80rem",
};

const spacing: MantineBreakpointsValues = {
  xxs: "0.5rem",
  xs: "0.75rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "2.25rem",
  xxl: "2.5rem",
  xxxl: "4rem",
};

// Border radii and widths
const borderRadii = {
  button: "32px",
};

const borderWidths = {
  buttonOutlineVariant: "2px",
  input: "1px",
};

/**
 * MantineStyles
 * @description This variable contains the theme for Mantine components.
 * @type {MantineThemeOverride}
 * @returns {MantineThemeOverride}
 */
const theme: MantineThemeOverride = {
  primaryColor: "default",
  primaryShade: 5,
  white: colors.mainBackground,
  black: colors.text,
  colors: {
    default: [
      colors.default.disabled,
      colors.default.hover,
      "red",
      "red",
      colors.default.focus,
      colors.default.primary,
      colors.default.hover,
      colors.default.primary,
      "red",
      "red",
    ],
    button: [
      colors.background.primaryBlue,
      colors.background.primaryOrange,
      colors.background.primaryPink,
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
    ],
    background: [
      colors.default.beige,
      colors.default.green,
      colors.background.primaryBlue,
      colors.background.primaryOrange,
      colors.background.primaryPink,
      colors.background.yellow,
      colors.background.purple,
      colors.background.darkBlue,
      colors.background.lightBlue,
      colors.textLight,
    ],
    cards: [
      "#383F51",
      "#DDDBF1",
      "#3C4F76",
      "#D1BEB0",
      "#AB9F9D",
      "#383F51",
      "#DDDBF1",
      "#3C4F76",
      "#D1BEB0",
      "#AB9F9D",
    ],
  },
  fontFamily: "neulis-neue",
  fontSizes: {
    xs: "0.75rem",
    sm: "1rem",
    md: "1.25rem",
    lg: "1.5rem",
    xl: "1.75rem",
  },
  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.5",
    lg: "1.6",
    xl: "1.65",
  },
  headings: {
    fontFamily: "Neulis-Neue",
    textWrap: "wrap",
    sizes: {
      h1: {
        fontSize: "4rem",
        fontWeight: "400",
        lineHeight: "1.25",
      },
      h2: {
        fontSize: "2.75rem",
        fontWeight: "400",
        lineHeight: "1",
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: "400",
        lineHeight: "1.5",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: "400",
        lineHeight: "1.5",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
      h6: {
        fontSize: "1rem",
        fontWeight: "900",
        lineHeight: "1.5",
      },
    },
  },
  spacing,
  breakpoints,
  focusRing: "auto",
  components: {
    Input: {
      styles: {
        input: {
          borderWidth: borderWidths.input,
          borderColor: colors.light,
        },
        invalid: {
          color: "error",
        },
      },
    },
    Radio: {
      styles: {
        radio: {
          borderWidth: borderWidths.input,
          borderColor: colors.medium,
        },
      },
    },
    Button: {
      styles: {
        root: {
          borderRadius: borderRadii.button,
          color: colors.text,
          fontWeight: 400,
          fontSize: "1.25rem",
          width: "fit-content",
          minHeight: "3rem",
          padding: "0 2.25rem",
        },
        label: {
          wordWrap: "break-word",
          whiteSpace: "normal",
        },
        outline: {
          borderRadius: borderRadii.button,
          borderImage: borderWidths.buttonOutlineVariant,
        },
      },
    },

    Modal: {
      styles: {
        content: {
          borderRadius: "20px",
          /* Hide scrollbar for Chrome, Safari and Opera */
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
          overflow: "auto",
        },
        body: {
          minWidth: "20rem",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          minWidth: breakpoints.xs,
        },
      },
    },
    Text: {
      styles: {
        root: {
          fontSize: "1.25rem",
          marginBottom: ".25rem",
        },
      },
    },
    Card: {
      styles: {
        root: {
          borderRadius: "20px",
        },
      },
    },
    Drawer: {
      styles: {
        root: {
          DrawerOffset: "0",
        },
      },
    },
    Notification: {
      styles: {
        icon: {
          background: "transparent",
        },
      },
    },
    Accordion: {
      styles: {
        item: {
          backgroundColor: colors.white,
          borderRadius: "20px",
          borderBottom: "none",
          paddingBottom: 0,
        },
        chevron: {
          width: "2rem",
          height: "2rem",
        },
      },
    },
    Alert: {
      styles: {
        root: {
          backgroundColor: colors.background.lightBlue,
          borderRadius: "20px",
        },
        title: {
          color: colors.text,
          fontSize: "1.25rem",
        },
        message: {
          fontSize: "1.25rem",
        },
      },
    },
    Anchor: {
      styles: {
        root: {
          color: colors.text,
          wordWrap: "break-word",
          hyphens: "auto",
        },
      },
    },
    Title: {
      styles: {
        root: {
          wordWrap: "break-word",
          hyphens: "auto",
        },
      },
    },
    List: {
      styles: {
        item: {
          marginBottom: "0.5rem",
        },
      },
    },
    Carousel: {
      styles: {
        control: {
          scale: "1.5",
        },
        controls: {
          padding: "0 1.5rem",
        },
      },
    },
  },
};

type MantineStylesProps = {
  children: React.ReactNode;
};

/**
 * MantineStyles
 * @description This component provides the Mantine theme to its children.
 * @param {MantineStylesProps} children - The children components to be wrapped with the Mantine theme.
 * @returns {JSX.Element}
 */
export const MantineStyles = ({ children }: MantineStylesProps) => (
  <MantineProvider theme={theme}>{children}</MantineProvider>
);
