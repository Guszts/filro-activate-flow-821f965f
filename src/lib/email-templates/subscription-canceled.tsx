import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import type { TemplateEntry } from './registry'

interface CanceledProps {
  name?: string
  planName?: string
  endsAt?: string
  panelUrl?: string
}

const SubscriptionCanceledEmail = ({ name, planName, endsAt, panelUrl }: CanceledProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Cancelamento confirmado — você mantém o acesso até {endsAt ?? 'o fim do período'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Cancelamento confirmado</Heading>
        <Text style={styles.text}>
          Olá{name ? `, ${name}` : ''}. Confirmamos o cancelamento do seu plano <strong style={{ color: brand.ink }}>{planName ?? '—'}</strong>.
        </Text>
        {endsAt && (
          <div style={styles.card}>
            <Text style={{ ...styles.textInk, margin: 0 }}>
              Você continua com acesso até <strong>{endsAt}</strong>. Depois dessa data, sua assinatura encerra automaticamente e nada mais será cobrado.
            </Text>
          </div>
        )}
        <Text style={styles.text}>Mudou de ideia? Você pode reativar a qualquer momento pelo painel.</Text>
        {panelUrl && <Button style={styles.button} href={panelUrl}>Acessar painel</Button>}
        <Text style={styles.footer}>Foi bom ter você no {brand.siteName}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionCanceledEmail,
  subject: 'Cancelamento confirmado',
  displayName: 'Cancelamento de assinatura',
  previewData: { name: 'João', planName: 'Plano Plus', endsAt: '15/06/2026', panelUrl: 'https://filro.app/painel' },
} satisfies TemplateEntry
