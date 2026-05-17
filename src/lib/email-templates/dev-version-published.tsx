import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  businessName?: string
  versionNumber?: number
  previewUrl?: string
  publishedUrl?: string
  notes?: string
  projectUrl?: string
  isPublished?: boolean
}

const DevVersionPublishedEmail = ({
  name,
  businessName,
  versionNumber,
  previewUrl,
  publishedUrl,
  notes,
  projectUrl,
  isPublished,
}: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>
      {isPublished ? 'Seu site Flaro Dev foi publicado' : 'Nova versão do seu projeto Flaro Dev disponível'}
    </Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · Flaro Dev</Text>
        <Heading style={styles.h1}>
          {isPublished
            ? `Seu site está no ar${name ? `, ${name}` : ''}!`
            : `Nova versão disponível${name ? `, ${name}` : ''}`}
        </Heading>
        <Text style={styles.text}>
          {businessName ? `${businessName} — ` : ''}
          {isPublished
            ? 'sua versão mais recente foi publicada e já pode ser acessada online.'
            : `disponibilizamos a versão ${versionNumber ?? ''} para sua revisão.`}
        </Text>
        {(previewUrl || publishedUrl) && (
          <div style={styles.card}>
            {publishedUrl && (
              <Text style={{ ...styles.textInk, margin: 0 }}>
                <strong>Site publicado:</strong>{' '}
                <a style={styles.link} href={publishedUrl}>{publishedUrl}</a>
              </Text>
            )}
            {previewUrl && (
              <Text style={{ ...styles.textInk, margin: publishedUrl ? '8px 0 0' : 0 }}>
                <strong>Preview:</strong>{' '}
                <a style={styles.link} href={previewUrl}>{previewUrl}</a>
              </Text>
            )}
          </div>
        )}
        {notes && (
          <Text style={styles.text}>
            <strong>Notas da equipe:</strong> {notes}
          </Text>
        )}
        {publishedUrl && <Button style={styles.button} href={publishedUrl}>Ver meu site</Button>}
        {projectUrl && (
          <Button
            style={{ ...styles.buttonDark, marginTop: 12 }}
            href={projectUrl}
          >
            Abrir painel do projeto
          </Button>
        )}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>
          Quer ajustes? Envie um pedido pelo chat do projeto e a equipe Filro responde por lá.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DevVersionPublishedEmail,
  subject: (d) =>
    d?.isPublished ? 'Seu site Flaro Dev foi publicado' : `Nova versão do projeto disponível${d?.versionNumber ? ` (v${d.versionNumber})` : ''}`,
  displayName: 'Flaro Dev · Versão publicada',
  previewData: {
    name: 'João',
    businessName: 'Padaria do João',
    versionNumber: 2,
    previewUrl: 'https://preview.filro.site/padariadojoao',
    publishedUrl: 'https://padariadojoao.filro.site',
    notes: 'Atualizamos a vitrine e o botão do WhatsApp conforme solicitado.',
    projectUrl: 'https://setup.filro.site/dev/projeto/exemplo',
    isPublished: true,
  },
} satisfies TemplateEntry
