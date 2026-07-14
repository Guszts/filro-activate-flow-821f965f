import * as React from 'react'
import { Body, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface AdminNewSignupProps {
  name?: string
  email?: string
  whatsapp?: string
  businessName?: string
  businessSegment?: string
}

const AdminNewSignupEmail = ({ name, email, whatsapp, businessName, businessSegment }: AdminNewSignupProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>New signup — {name ?? email ?? 'lead'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · admin</Text>
        <Heading style={styles.h1}>New signup</Heading>
        <Text style={styles.text}>A new user confirmed their email and entered the funnel.</Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Name:</strong> {name ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Email:</strong> {email ?? '—'}</Text>
          {whatsapp && <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Phone:</strong> {whatsapp}</Text>}
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Business:</strong> {businessName ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Segment:</strong> {businessSegment ?? '—'}</Text>
        </div>
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Sent automatically after email confirmation.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewSignupEmail,
  subject: (d) => `New signup — ${d.name ?? d.email ?? 'lead'}`,
  displayName: 'Admin new signup',
  previewData: { name: 'Alex Doe', email: 'alex@example.com', businessName: 'Acme Co', businessSegment: 'SaaS' },
} satisfies TemplateEntry

export default AdminNewSignupEmail
