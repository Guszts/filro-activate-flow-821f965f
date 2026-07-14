import * as React from 'react'
import { Body, Button, Container, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Reset your {brand.siteName} password</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Reset your password</Heading>
        <Text style={styles.text}>
          We received a request to reset the password for your {brand.siteName} account. Click below to choose a new password.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Reset password</Button>
        <Text style={styles.footer}>If you didn't request this, you can safely ignore this email. Your password won't change.</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
