import * as React from 'react'
import { Body, Button, Container, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>You've been invited to {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>You've been invited</Heading>
        <Text style={styles.text}>
          You've been invited to {brand.siteName}. Click below to accept and create your account.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Accept invite</Button>
        <Text style={styles.footer}>If you weren't expecting this invite, you can ignore this email.</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
