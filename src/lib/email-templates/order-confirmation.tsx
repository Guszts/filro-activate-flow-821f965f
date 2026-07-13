import * as React from "react";
import { Body, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  planName?: string;
  total?: string;
  invoiceUrl?: string;
}

const OrderConfirmationEmail = ({ name, planName, total, invoiceUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Order confirmation</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Order confirmed{name ? `, ${name}` : ""}</Heading>
        <Text style={styles.text}>
          Thanks for choosing {planName ?? "Filro"}. {total ? `Total: ${total}.` : ""}
        </Text>
        {invoiceUrl && (
          <Text style={styles.textInk}>
            <a href={invoiceUrl} style={styles.link}>Download invoice</a>
          </Text>
        )}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: OrderConfirmationEmail,
  subject: (d) => `Order confirmed${d.planName ? ` — ${d.planName}` : ""}`,
  displayName: "Order confirmation",
  previewData: { name: "Alex", planName: "Revenue System", total: "$10,997.00" },
} satisfies TemplateEntry;

export default OrderConfirmationEmail;
