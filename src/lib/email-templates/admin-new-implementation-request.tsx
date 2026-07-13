import * as React from "react";
import { Body, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  fullName?: string;
  email?: string;
  companyName?: string;
  preferredPlan?: string;
  message?: string;
  adminUrl?: string;
}

const AdminNewImplementationRequestEmail = ({
  fullName, email, companyName, preferredPlan, message, adminUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>New implementation request</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · Admin</Text>
        <Heading style={styles.h1}>New implementation request</Heading>
        <Text style={styles.textInk}>
          {fullName} {email ? `<${email}>` : ""}
          {companyName ? ` · ${companyName}` : ""}
        </Text>
        {preferredPlan && (
          <Text style={styles.text}>Preferred plan: <strong>{preferredPlan}</strong></Text>
        )}
        {message && <Text style={styles.text}>{message}</Text>}
        {adminUrl && (
          <Text style={styles.textInk}>
            <a href={adminUrl} style={styles.link}>Open in admin console</a>
          </Text>
        )}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: AdminNewImplementationRequestEmail,
  subject: (d) => `New request${d.companyName ? ` — ${d.companyName}` : ""}`,
  displayName: "Admin: new implementation request",
  to: "hello@filro.site",
  previewData: { fullName: "Alex Doe", email: "alex@acme.com", companyName: "Acme Inc.", preferredPlan: "Revenue System", message: "Interested in a full revamp." },
} satisfies TemplateEntry;

export default AdminNewImplementationRequestEmail;
