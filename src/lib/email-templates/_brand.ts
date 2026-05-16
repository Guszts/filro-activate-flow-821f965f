// Filro brand styles for emails — Flaro design system
// Rounded typography (Pangram Sans Rounded / Nunito) + Flaro palette (ink, paper, lime, flame).
// Custom webfonts don't load in most email clients, so we use Nunito via Google Fonts as
// the primary, with ui-rounded / system-ui fallbacks that render rounded on Apple/modern OSes.
export const brand = {
  siteName: "Filro",
  siteUrl: "https://filro.site",
  // Flaro tokens (converted from oklch in src/styles.css)
  ink: "#1f2433",        // --ink
  inkSoft: "#626B7A",    // --ink-soft
  paper: "#ffffff",      // --paper
  bg: "#F4F5F8",         // soft paper bg
  surface: "#ECEEF3",    // card surface
  stone: "#B8BBC4",      // --stone
  lime: "#B7FF2A",       // --lime (Flaro accent)
  limeInk: "#1f2433",    // text on lime
  flame: "#FF3B26",      // --flame
  azure: "#5C75D6",      // --azure
  accent: "#B7FF2A",
  fontFamily:
    "'Nunito', 'Pangram Sans Rounded', ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  displayFont:
    "'Nunito', 'Pangram Sans Rounded', ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};

export const styles = {
  main: {
    backgroundColor: brand.bg,
    fontFamily: brand.fontFamily,
    margin: 0,
    padding: 0,
    color: brand.ink,
  },
  container: {
    backgroundColor: brand.paper,
    borderRadius: "28px",
    margin: "32px auto",
    padding: "40px 32px",
    maxWidth: "560px",
    border: `1px solid ${brand.surface}`,
  },
  brand: {
    fontFamily: brand.displayFont,
    fontSize: "22px",
    fontWeight: 900 as const,
    color: brand.ink,
    letterSpacing: "-0.02em",
    margin: "0 0 28px",
  },
  h1: {
    fontFamily: brand.displayFont,
    fontSize: "32px",
    fontWeight: 900 as const,
    color: brand.ink,
    lineHeight: 1.15,
    letterSpacing: "-0.025em",
    margin: "0 0 16px",
  },
  text: {
    fontFamily: brand.fontFamily,
    fontSize: "15px",
    fontWeight: 500 as const,
    color: brand.inkSoft,
    lineHeight: 1.65,
    margin: "0 0 18px",
  },
  textInk: {
    fontFamily: brand.fontFamily,
    fontSize: "15px",
    fontWeight: 600 as const,
    color: brand.ink,
    lineHeight: 1.65,
    margin: "0 0 18px",
  },
  button: {
    backgroundColor: brand.lime,
    color: brand.limeInk,
    fontFamily: brand.displayFont,
    fontSize: "15px",
    fontWeight: 800 as const,
    borderRadius: "999px",
    padding: "14px 28px",
    textDecoration: "none",
    display: "inline-block",
    letterSpacing: "-0.01em",
  },
  buttonDark: {
    backgroundColor: brand.ink,
    color: brand.paper,
    fontFamily: brand.displayFont,
    fontSize: "15px",
    fontWeight: 800 as const,
    borderRadius: "999px",
    padding: "14px 28px",
    textDecoration: "none",
    display: "inline-block",
    letterSpacing: "-0.01em",
  },
  card: {
    backgroundColor: brand.surface,
    borderRadius: "18px",
    padding: "20px 22px",
    margin: "8px 0 24px",
  },
  hr: {
    border: "none",
    borderTop: `1px solid ${brand.surface}`,
    margin: "28px 0",
  },
  footer: {
    fontFamily: brand.fontFamily,
    fontSize: "12px",
    fontWeight: 500 as const,
    color: brand.stone,
    margin: "20px 0 0",
    lineHeight: 1.5,
  },
  link: { color: brand.ink, textDecoration: "underline", fontWeight: 700 as const },
  code: {
    fontFamily: brand.displayFont,
    fontSize: "32px",
    fontWeight: 900 as const,
    color: brand.ink,
    letterSpacing: "0.22em",
    backgroundColor: brand.lime,
    borderRadius: "18px",
    padding: "20px",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
};
