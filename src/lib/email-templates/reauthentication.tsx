import * as React from 'react'
import { Body, Container, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Your verification code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirm your identity</Heading>
        <Text style={styles.text}>Use the code below to confirm your identity:</Text>
        <Text style={styles.code}>{token}</Text>
        <Text style={styles.footer}>This code expires shortly. If this wasn't you, ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
