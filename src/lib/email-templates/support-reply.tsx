import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface SupportReplyProps {
  name?: string
  ticketSubject?: string
  ticketUrl?: string
  preview?: string
}

const SupportReplyEmail = ({ name, ticketSubject, ticketUrl, preview }: SupportReplyProps) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Resposta no suporte — {ticketSubject ?? 'seu ticket'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · suporte</Text>
        <Heading style={styles.h1}>Você tem uma nova resposta{name ? `, ${name}` : ''}</Heading>
        <Text style={styles.text}>
          Nossa equipe respondeu seu ticket <strong style={{ color: brand.ink }}>{ticketSubject ?? '—'}</strong>.
        </Text>
        {preview && (
          <div style={styles.card}>
            <Text style={{ ...styles.textInk, margin: 0, whiteSpace: 'pre-wrap' }}>{preview}</Text>
          </div>
        )}
        {ticketUrl && <Button style={styles.button} href={ticketUrl}>Abrir conversa</Button>}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Responda direto pelo painel para manter o histórico organizado.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SupportReplyEmail,
  subject: (d: Record<string, any>) => `Resposta no suporte — ${d.ticketSubject ?? 'seu ticket'}`,
  displayName: 'Resposta de suporte',
  previewData: { name: 'João', ticketSubject: 'Ajuste no logo', ticketUrl: 'https://filro.site/suporte', preview: 'Olá! Já aplicamos o ajuste...' },
} satisfies TemplateEntry
