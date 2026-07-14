import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface ExtraChargeProps {
  name?: string
  title?: string
  description?: string
  amount?: string
  paymentLink?: string
}

const ExtraChargeEmail = ({ name, title, description, amount, paymentLink }: ExtraChargeProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>New charge — {title ?? 'additional work'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>New charge{name ? `, ${name}` : ''}</Heading>
        <Text style={styles.text}>
          We've issued an additional charge for the requested work.
        </Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>{title ?? '—'}</strong></Text>
          {description && <Text style={{ ...styles.text, margin: '0 0 6px' }}>{description}</Text>}
          {amount && <Text style={{ ...styles.textInk, margin: '6px 0 0' }}><strong>Amount:</strong> {amount}</Text>}
        </div>
        {paymentLink && <Button style={styles.button} href={paymentLink}>Pay now</Button>}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Reply to this email if you have any questions.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ExtraChargeEmail,
  subject: (d) => `New charge — ${d.title ?? 'additional work'}`,
  displayName: 'Extra charge issued',
  previewData: { name: 'Alex', title: 'Landing page revision', description: 'Additional hero section and CTA copy variants.', amount: '$450.00', paymentLink: 'https://filro.site/pay/abc' },
} satisfies TemplateEntry

export default ExtraChargeEmail
