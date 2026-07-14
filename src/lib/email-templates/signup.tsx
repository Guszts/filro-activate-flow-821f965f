import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({ confirmationUrl, token }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Your Filro confirmation code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirm your email</Heading>
        <Text style={styles.text}>
          Use the 6-digit code below to confirm your {brand.siteName} account.
        </Text>
        {token && <Text style={styles.code}>{token}</Text>}
        <Text style={styles.text}>This code expires in 1 hour.</Text>
        <Hr style={styles.hr} />
        <Text style={{ ...styles.text, fontSize: '13px' }}>
          Prefer to confirm via link? Click below.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Confirm via link</Button>
        <Text style={styles.footer}>If you didn't create this account, ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
