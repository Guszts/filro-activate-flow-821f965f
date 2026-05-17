import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  businessName?: string
  planName?: string
  projectUrl?: string
}

const DevProjectPaidEmail = ({ name, businessName, planName, projectUrl }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Recebemos seu pagamento — seu projeto Flaro Dev entrou na fila</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · Flaro Dev</Text>
        <Heading style={styles.h1}>Pagamento confirmado{name ? `, ${name}` : ''}!</Heading>
        <Text style={styles.text}>
          Recebemos o pagamento do seu projeto{businessName ? ` ${businessName}` : ''}
          {planName ? ` (plano ${planName})` : ''}. Ele já entrou na fila de produção da equipe Filro.
        </Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: 0 }}>
            <strong>Próximo passo:</strong> nossa equipe começa a estruturar o site a partir do modelo
            escolhido e do briefing que você enviou. Você acompanha tudo pelo painel do projeto.
          </Text>
        </div>
        {projectUrl && <Button style={styles.button} href={projectUrl}>Abrir meu projeto</Button>}
        <Hr style={styles.hr} />
        <Text style={styles.text}>
          A qualquer momento você pode enviar pedidos de alteração pelo chat do projeto. Cada pedido é
          classificado e organizado para a nossa equipe responder.
        </Text>
        <Text style={styles.footer}>Obrigado por confiar na Filro.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DevProjectPaidEmail,
  subject: 'Pagamento confirmado — seu projeto Flaro Dev está na fila',
  displayName: 'Flaro Dev · Projeto pago',
  previewData: {
    name: 'João',
    businessName: 'Padaria do João',
    planName: 'Dev Plus',
    projectUrl: 'https://setup.filro.site/dev/projeto/exemplo',
  },
} satisfies TemplateEntry
