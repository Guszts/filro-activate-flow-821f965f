import * as React from "react";
import { Body, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  fullName?: string;
}

const ImplementationRequestConfirmationEmail = ({ fullName }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>We received your request</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Thanks{fullName ? `, ${fullName}` : ""}!</Heading>
        <Text style={styles.text}>
          We received your implementation request. A senior member of our team will
          review it and reply within one business day with a written plan and next
          steps.
        </Text>
        <Text style={styles.footer}>— The {brand.siteName} team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: ImplementationRequestConfirmationEmail,
  subject: "We received your request",
  displayName: "Implementation request confirmation",
  previewData: { fullName: "Alex" },
} satisfies TemplateEntry;

export default ImplementationRequestConfirmationEmail;
