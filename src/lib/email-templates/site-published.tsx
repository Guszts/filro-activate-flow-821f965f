import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface SitePublishedProps {
  name?: string
  businessName?: string
  publishedUrl?: string
  panelUrl?: string
  projectPdfUrl?: string
}

const SitePublishedEmail = ({ name, businessName, publishedUrl, panelUrl, projectPdfUrl }: SitePublishedProps) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Your site is live</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Your site is live{name ? `, ${name}` : ''}!</Heading>
        <Text style={styles.text}>
          We've shipped {businessName ? businessName : 'your project'}. Your customers can access it right now.
        </Text>
        {publishedUrl && (
          <div style={styles.card}>
            <Text style={{ ...styles.textInk, margin: 0 }}>
              <strong>URL:</strong> <a style={styles.link} href={publishedUrl}>{publishedUrl}</a>
            </Text>
          </div>
        )}
        {panelUrl && <Button style={styles.button} href={panelUrl}>Open dashboard</Button>}
        {projectPdfUrl && (
          <Text style={{ ...styles.text, marginTop: 16 }}>
            <a style={styles.link} href={projectPdfUrl}>Download project brief (PDF)</a>
          </Text>
        )}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Reply anytime to request changes or ask a question.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SitePublishedEmail,
  subject: (d) => `Your site is live${d.businessName ? ` — ${d.businessName}` : ''}`,
  displayName: 'Site published',
  previewData: { name: 'Alex', businessName: 'Acme Co', publishedUrl: 'https://acme.com', panelUrl: 'https://filro.site/dashboard' },
} satisfies TemplateEntry

export default SitePublishedEmail
