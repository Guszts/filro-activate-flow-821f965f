import * as React from "react";
import { Body, Button, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  planName?: string;
  billingPortalUrl?: string;
}

const PaymentFailedEmail = ({ name, planName, billingPortalUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>We couldn't process your payment</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Payment issue{name ? `, ${name}` : ""}</Heading>
        <Text style={styles.text}>
          We couldn't process the latest payment for your{planName ? ` ${planName}` : ""} plan.
          To avoid interruption, please update your payment method.
        </Text>
        {billingPortalUrl && (
          <Button style={styles.button} href={billingPortalUrl}>
            Update payment method
          </Button>
        )}
        <Text style={styles.footer}>Reply to this email if you need help.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: PaymentFailedEmail,
  subject: "Payment issue on your Filro plan",
  displayName: "Payment failed",
  previewData: { name: "Alex", planName: "Revenue System", billingPortalUrl: "https://filro.site/settings" },
} satisfies TemplateEntry;

export default PaymentFailedEmail;
