import * as React from 'react'
import { Body, Button, Container, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Confirm your email change at {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirm your email change</Heading>
        <Text style={styles.text}>
          You requested to change your {brand.siteName} email from <strong style={{ color: brand.ink }}>{oldEmail}</strong> to <strong style={{ color: brand.ink }}>{newEmail}</strong>.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Confirm change</Button>
        <Text style={styles.footer}>If this wasn't you, secure your account immediately.</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
