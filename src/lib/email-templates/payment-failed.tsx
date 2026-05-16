import * as React from 'react'
import { Body, Button, Container, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface PaymentFailedProps {
  name?: string
  planName?: string
  portalUrl?: string
}

const PaymentFailedEmail = ({ name, planName, portalUrl }: PaymentFailedProps) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Não conseguimos cobrar sua mensalidade do {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Não conseguimos cobrar sua mensalidade</Heading>
        <Text style={styles.text}>
          Olá{name ? `, ${name}` : ''}. Tentamos renovar seu plano <strong style={{ color: brand.ink }}>{planName ?? '—'}</strong>, mas o pagamento não foi aprovado.
        </Text>
        <Text style={styles.text}>
          Vamos tentar mais algumas vezes nos próximos dias. Para evitar a suspensão do seu plano, atualize seu meio de pagamento agora.
        </Text>
        {portalUrl && (
          <Button style={styles.button} href={portalUrl}>Atualizar pagamento</Button>
        )}
        <Text style={styles.footer}>Se você acabou de atualizar, pode ignorar este aviso.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentFailedEmail,
  subject: 'Falha ao processar sua mensalidade',
  displayName: 'Falha de pagamento',
  previewData: { name: 'João', planName: 'Plano Plus', portalUrl: 'https://filro.app/painel' },
} satisfies TemplateEntry
