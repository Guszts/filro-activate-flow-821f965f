import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  businessName?: string
  requestSummary?: string
  status?: string
  response?: string
  projectUrl?: string
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  done: 'Concluído',
  rejected: 'Não aplicável',
}

const DevChangeAnsweredEmail = ({
  name,
  businessName,
  requestSummary,
  status,
  response,
  projectUrl,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>A equipe Filro respondeu ao seu pedido de alteração</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · Flaro Dev</Text>
        <Heading style={styles.h1}>Sua solicitação foi respondida{name ? `, ${name}` : ''}</Heading>
        <Text style={styles.text}>
          {businessName ? `${businessName} — ` : ''}atualizamos o status do seu pedido de alteração.
        </Text>
        <div style={styles.card}>
          {requestSummary && (
            <Text style={{ ...styles.textInk, margin: 0 }}>
              <strong>Pedido:</strong> {requestSummary}
            </Text>
          )}
          {status && (
            <Text style={{ ...styles.textInk, margin: '8px 0 0' }}>
              <strong>Status:</strong> {STATUS_LABEL[status] ?? status}
            </Text>
          )}
        </div>
        {response && (
          <Text style={styles.text}>
            <strong>Resposta da equipe:</strong> {response}
          </Text>
        )}
        {projectUrl && <Button style={styles.button} href={projectUrl}>Ver no painel</Button>}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>
          Continue conversando pelo chat do projeto — é por lá que organizamos cada alteração.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DevChangeAnsweredEmail,
  subject: 'Resposta ao seu pedido — Flaro Dev',
  displayName: 'Flaro Dev · Pedido respondido',
  previewData: {
    name: 'João',
    businessName: 'Padaria do João',
    requestSummary: 'Trocar a foto principal por uma do salão renovado',
    status: 'done',
    response: 'Substituímos a imagem e ajustamos o contraste do título sobre ela.',
    projectUrl: 'https://setup.filro.site/dev/projeto/exemplo',
  },
} satisfies TemplateEntry
