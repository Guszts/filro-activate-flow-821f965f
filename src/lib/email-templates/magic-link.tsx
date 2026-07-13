import * as React from "react";
import { Body, Button, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";

interface MagicLinkEmailProps {
  confirmationUrl?: string;
  token?: string;
}

export const MagicLinkEmail = ({ confirmationUrl, token }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Your {brand.siteName} login link</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Sign in to {brand.siteName}</Heading>
        <Text style={styles.text}>
          Click the button below to sign in. This link expires in 60 minutes and can be used once.
        </Text>
        {confirmationUrl && (
          <Button style={styles.button} href={confirmationUrl}>
            Sign in
          </Button>
        )}
        {token && (
          <Text style={styles.textInk}>
            Or use this code: <strong>{token}</strong>
          </Text>
        )}
        <Text style={styles.footer}>
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default MagicLinkEmail;
