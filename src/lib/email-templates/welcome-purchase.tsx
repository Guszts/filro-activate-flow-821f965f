import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import type { TemplateEntry } from './registry'

interface WelcomePurchaseProps {
  name?: string
  planName?: string
  businessName?: string
  panelUrl?: string
}

const WelcomePurchaseEmail = ({ name, planName, businessName, panelUrl }: WelcomePurchaseProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Pagamento confirmado — vamos ativar seu {planName ?? 'plano'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Pagamento confirmado{name ? `, ${name}` : ''}!</Heading>
        <Text style={styles.text}>
          Recebemos seu pagamento e seu plano <strong style={{ color: brand.ink }}>{planName ?? '—'}</strong> está ativo.
          A partir de agora, nossa equipe começa a preparar a sua presença digital{businessName ? ` para ${businessName}` : ''}.
        </Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: 0 }}>
            <strong>Próximo passo:</strong> entre no seu painel e envie as informações do negócio para acelerarmos a entrega.
          </Text>
        </div>
        {panelUrl && (
          <Button style={styles.button} href={panelUrl}>Acessar meu painel</Button>
        )}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>
          Qualquer dúvida, é só responder este e-mail. Vamos juntos.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomePurchaseEmail,
  subject: (d: Record<string, any>) => `Pagamento confirmado — ${d.planName ?? 'seu plano Filro'}`,
  displayName: 'Boas-vindas pós-compra',
  previewData: { name: 'João', planName: 'Plano Plus', businessName: 'Padaria do João', panelUrl: 'https://filro.app/painel' },
} satisfies TemplateEntry
