import * as React from 'react'
import { Body, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface SaleNotificationProps {
  customerName?: string
  customerEmail?: string
  businessName?: string
  planName?: string
  amount?: string
  originalAmount?: string
  discountAmount?: string
  promoCode?: string
  sessionId?: string
}

const SaleNotificationEmail = ({
  customerName, customerEmail, businessName, planName,
  amount, originalAmount, discountAmount, promoCode, sessionId,
}: SaleNotificationProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>New sale — {planName ?? 'Filro plan'} — {amount ?? ''}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · admin</Text>
        <Heading style={styles.h1}>New sale</Heading>
        <Text style={styles.text}>A new order was confirmed and is now visible in <strong style={{ color: brand.ink }}>Admin Tasks</strong>.</Text>

        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Plan:</strong> {planName ?? '—'}</Text>
          {amount && (
            <Text style={{ ...styles.textInk, margin: '0 0 6px', fontSize: 18 }}>
              <strong>Paid:</strong> <span style={{ color: brand.ink, fontWeight: 700 }}>{amount}</span>
              {originalAmount && (
                <span style={{ color: '#999', marginLeft: 8, textDecoration: 'line-through', fontSize: 14 }}>
                  {originalAmount}
                </span>
              )}
            </Text>
          )}
          {promoCode && <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Promo code:</strong> {promoCode}{discountAmount ? ` (−${discountAmount})` : ''}</Text>}
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Customer:</strong> {customerName ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Email:</strong> {customerEmail ?? '—'}</Text>
          {businessName && <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Business:</strong> {businessName}</Text>}
          {sessionId && <Text style={{ ...styles.footer, margin: '10px 0 0' }}>Session: {sessionId}</Text>}
        </div>
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Sent automatically after Stripe webhook confirmation.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SaleNotificationEmail,
  subject: (d) => `New sale — ${d.planName ?? 'Filro'} — ${d.amount ?? ''}`,
  displayName: 'Sale notification (admin)',
  previewData: { customerName: 'Alex Doe', customerEmail: 'alex@example.com', businessName: 'Acme Co', planName: 'Revenue System', amount: '$10,997.00', sessionId: 'cs_test_123' },
} satisfies TemplateEntry

export default SaleNotificationEmail
