import * as React from "react";
import { Body, Button, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  planName?: string;
  briefUrl?: string;
}

const WelcomePurchaseEmail = ({ name, planName, briefUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Welcome to {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Welcome{name ? `, ${name}` : ""}!</Heading>
        <Text style={styles.text}>
          Your {planName ?? "implementation"} is confirmed. Next step: complete your
          Implementation Brief so we can start.
        </Text>
        {briefUrl && (
          <Button style={styles.button} href={briefUrl}>
            Start Implementation Brief
          </Button>
        )}
        <Text style={styles.footer}>Reply to this email anytime — a real person will answer.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: WelcomePurchaseEmail,
  subject: (d) => `Welcome to Filro${d.planName ? ` — ${d.planName}` : ""}`,
  displayName: "Welcome after purchase",
  previewData: { name: "Alex", planName: "Revenue System", briefUrl: "https://filro.site/business-info" },
} satisfies TemplateEntry;

export default WelcomePurchaseEmail;
