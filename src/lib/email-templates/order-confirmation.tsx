import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface OrderConfirmationProps {
  name?: string
  orderId?: string
  planName?: string
  activationAmount?: string
  monthlyAmount?: string
  totalAmount?: string
  panelUrl?: string
}

const OrderConfirmationEmail = ({
  name, orderId, planName, activationAmount, monthlyAmount, totalAmount, panelUrl,
}: OrderConfirmationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Pedido #{orderId ?? '—'} confirmado</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Pedido confirmado{name ? `, ${name}` : ''}</Heading>
        <Text style={styles.text}>
          Recebemos seu pagamento. Aqui está o comprovante do seu pedido.
        </Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Pedido:</strong> #{orderId ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Plano:</strong> {planName ?? '—'}</Text>
          {activationAmount && <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Ativação:</strong> {activationAmount}</Text>}
          {monthlyAmount && <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Mensalidade:</strong> {monthlyAmount}</Text>}
          {totalAmount && <Text style={{ ...styles.textInk, margin: '6px 0 0' }}><strong>Total pago hoje:</strong> {totalAmount}</Text>}
        </div>
        <Text style={styles.text}>
          Próximo passo: complete as informações do seu negócio no painel para acelerarmos a entrega.
        </Text>
        {panelUrl && <Button style={styles.button} href={panelUrl}>Abrir meu painel</Button>}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Guarde este e-mail como comprovante. Dúvidas? Responda esta mensagem.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: (d: Record<string, any>) => `Pedido #${d.orderId ?? ''} confirmado — ${d.planName ?? 'Filro'}`,
  displayName: 'Confirmação de pedido',
  previewData: { name: 'João', orderId: 'a1b2c3d4', planName: 'Plano Plus', activationAmount: 'R$ 297,00', monthlyAmount: 'R$ 97,00', totalAmount: 'R$ 394,00', panelUrl: 'https://setup.filro.site/painel' },
} satisfies TemplateEntry
