import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface WelcomeSignupProps { name?: string; checkoutUrl?: string }

const WelcomeSignupEmail = ({ name, checkoutUrl }: WelcomeSignupProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Welcome to {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Welcome{name ? `, ${name}` : ''}!</Heading>
        <Text style={styles.text}>
          Your account is confirmed. Next, pick the implementation plan that fits — we'll kick off with
          a written scope and weekly milestones.
        </Text>
        {checkoutUrl && (
          <Button style={styles.button} href={checkoutUrl}>View pricing</Button>
        )}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Reply anytime — a real person will answer.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeSignupEmail,
  subject: 'Welcome to Filro',
  displayName: 'Welcome (post-signup)',
  previewData: { name: 'Alex', checkoutUrl: 'https://filro.site/pricing' },
} satisfies TemplateEntry

export default WelcomeSignupEmail
