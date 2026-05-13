import * as React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import type { TemplateEntry } from './registry'

interface SaleNotificationProps {
  customerName?: string
  customerEmail?: string
  customerWhatsapp?: string
  businessName?: string
  planName?: string
  amount?: string
  sessionId?: string
}

const SaleNotificationEmail = ({
  customerName, customerEmail, customerWhatsapp, businessName, planName, amount, sessionId,
}: SaleNotificationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Nova venda — {planName ?? 'plano Filro'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · admin</Text>
        <Heading style={styles.h1}>💸 Nova venda</Heading>
        <Text style={styles.text}>Um novo pedido foi confirmado e já aparece em <strong style={{ color: brand.ink }}>Tarefas Admin</strong>.</Text>

        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Plano:</strong> {planName ?? '—'}</Text>
          {amount && <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Valor:</strong> {amount}</Text>}
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Cliente:</strong> {customerName ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>E-mail:</strong> {customerEmail ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>WhatsApp:</strong> {customerWhatsapp ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Negócio:</strong> {businessName ?? '—'}</Text>
        </div>

        <Hr style={styles.hr} />
        <Text style={styles.footer}>Stripe session: {sessionId ?? '—'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SaleNotificationEmail,
  subject: (d: Record<string, any>) => `💸 Nova venda — ${d.planName ?? 'Filro'}`,
  displayName: 'Notificação de venda (admin)',
  previewData: {
    customerName: 'Maria Silva',
    customerEmail: 'maria@exemplo.com',
    customerWhatsapp: '+55 11 99999-0000',
    businessName: 'Café da Esquina',
    planName: 'Plano Plus',
    amount: 'R$ 594,00',
    sessionId: 'cs_test_abc123',
  },
} satisfies TemplateEntry
