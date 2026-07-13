import * as React from "react";
import { Body, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  planName?: string;
  endsAt?: string;
}

const SubscriptionCanceledEmail = ({ name, planName, endsAt }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Your subscription has been canceled</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Subscription canceled{name ? `, ${name}` : ""}</Heading>
        <Text style={styles.text}>
          Your{planName ? ` ${planName}` : ""} subscription has been canceled.
          {endsAt ? ` You'll keep access until ${endsAt}.` : ""}
        </Text>
        <Text style={styles.footer}>You can reactivate at any time from your dashboard.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: SubscriptionCanceledEmail,
  subject: (d) => `Subscription canceled${d.planName ? `: ${d.planName}` : ""}`,
  displayName: "Subscription canceled",
  previewData: { name: "Alex", planName: "Revenue System", endsAt: "Dec 31, 2026" },
} satisfies TemplateEntry;

export default SubscriptionCanceledEmail;
