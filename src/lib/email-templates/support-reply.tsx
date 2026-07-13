import * as React from "react";
import { Body, Button, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  ticketSubject?: string;
  message?: string;
  ticketUrl?: string;
}

const SupportReplyEmail = ({ name, ticketSubject, message, ticketUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>New reply on your support ticket</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>New reply{name ? `, ${name}` : ""}</Heading>
        {ticketSubject && (
          <Text style={styles.textInk}>Ticket: {ticketSubject}</Text>
        )}
        {message && <Text style={styles.text}>{message}</Text>}
        {ticketUrl && (
          <Button style={styles.button} href={ticketUrl}>
            View conversation
          </Button>
        )}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: SupportReplyEmail,
  subject: (d) => `Support: ${d.ticketSubject ?? "new reply"}`,
  displayName: "Support reply",
  previewData: { name: "Alex", ticketSubject: "Question about my project", message: "Thanks for reaching out — we've reviewed and here's what we found...", ticketUrl: "https://filro.site/support" },
} satisfies TemplateEntry;

export default SupportReplyEmail;
