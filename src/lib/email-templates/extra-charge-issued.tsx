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
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Nova cobrança — {title ?? 'serviço extra'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Nova cobrança{name ? `, ${name}` : ''}</Heading>
        <Text style={styles.text}>
          Emitimos uma cobrança extra referente ao serviço solicitado.
        </Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>{title ?? '—'}</strong></Text>
          {description && <Text style={{ ...styles.text, margin: '0 0 6px' }}>{description}</Text>}
          {amount && <Text style={{ ...styles.textInk, margin: '6px 0 0' }}><strong>Valor:</strong> {amount}</Text>}
        </div>
        {paymentLink && <Button style={styles.button} href={paymentLink}>Pagar agora</Button>}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Pagamento seguro processado pela Stripe.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ExtraChargeEmail,
  subject: (d: Record<string, any>) => `Nova cobrança Filro — ${d.title ?? 'serviço'}`,
  displayName: 'Cobrança extra emitida',
  previewData: { name: 'João', title: 'Ajustes adicionais', description: 'Conjunto de revisões fora do escopo do plano.', amount: 'R$ 150,00', paymentLink: 'https://buy.stripe.com/xxx' },
} satisfies TemplateEntry
