// Filro brand styles for emails (editorial, paper/ink).
export const brand = {
  siteName: "Filro",
  siteUrl: "https://filro.app",
  ink: "#1f2433",
  inkSoft: "#626B7A",
  paper: "#ffffff",
  bg: "#ECEEF3",
  accent: "#1f2433",
  fontFamily:
    "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  displayFont:
    "Georgia, 'Iowan Old Style', 'Apple Garamond', 'Palatino Linotype', 'Times New Roman', serif",
};

export const styles = {
  main: {
    backgroundColor: brand.bg,
    fontFamily: brand.fontFamily,
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: brand.paper,
    borderRadius: "20px",
    margin: "32px auto",
    padding: "40px 32px",
    maxWidth: "560px",
  },
  brand: {
    fontFamily: brand.displayFont,
    fontSize: "20px",
    fontWeight: 700 as const,
    color: brand.ink,
    letterSpacing: "-0.01em",
    margin: "0 0 28px",
  },
  h1: {
    fontFamily: brand.displayFont,
    fontSize: "32px",
    fontWeight: 800 as const,
    color: brand.ink,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    margin: "0 0 16px",
  },
  text: {
    fontSize: "15px",
    color: brand.inkSoft,
    lineHeight: 1.65,
    margin: "0 0 18px",
  },
  textInk: {
    fontSize: "15px",
    color: brand.ink,
    lineHeight: 1.65,
    margin: "0 0 18px",
  },
  button: {
    backgroundColor: brand.ink,
    color: brand.paper,
    fontSize: "15px",
    fontWeight: 600 as const,
    borderRadius: "999px",
    padding: "14px 26px",
    textDecoration: "none",
    display: "inline-block",
  },
  card: {
    backgroundColor: brand.bg,
    borderRadius: "14px",
    padding: "18px 20px",
    margin: "8px 0 24px",
  },
  hr: {
    border: "none",
    borderTop: "1px solid #E3E6EE",
    margin: "28px 0",
  },
  footer: {
    fontSize: "12px",
    color: "#9099A8",
    margin: "20px 0 0",
    lineHeight: 1.5,
  },
  link: { color: brand.ink, textDecoration: "underline" },
  code: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "28px",
    fontWeight: 700 as const,
    color: brand.ink,
    letterSpacing: "0.18em",
    backgroundColor: brand.bg,
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center" as const,
    margin: "0 0 24px",
  },
};
