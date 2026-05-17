import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface SitePublishedProps {
  name?: string
  businessName?: string
  publishedUrl?: string
  panelUrl?: string
  projectPdfUrl?: string
}

const SitePublishedEmail = ({ name, businessName, publishedUrl, panelUrl, projectPdfUrl }: SitePublishedProps) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Seu site está no ar</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Seu site está no ar{name ? `, ${name}` : ''}!</Heading>
        <Text style={styles.text}>
          Concluímos a publicação{businessName ? ` de ${businessName}` : ''}. A partir de agora,
          seus clientes já podem acessar online.
        </Text>
        {publishedUrl && (
          <div style={styles.card}>
            <Text style={{ ...styles.textInk, margin: 0 }}>
              <strong>Endereço:</strong> <a style={styles.link} href={publishedUrl}>{publishedUrl}</a>
            </Text>
          </div>
        )}
        {publishedUrl && <Button style={styles.button} href={publishedUrl}>Ver meu site</Button>}
        {projectPdfUrl && (
          <Button style={{ ...styles.button, marginTop: 12, backgroundColor: 'transparent', color: '#000', border: '1px solid #000' }} href={projectPdfUrl}>
            Baixar PDF do projeto
          </Button>
        )}
        <Hr style={styles.hr} />
        {panelUrl && (
          <Text style={styles.text}>
            Solicite ajustes a qualquer momento pelo <a style={styles.link} href={panelUrl}>seu painel</a>.
          </Text>
        )}
        <Text style={styles.footer}>Comemore: é o primeiro passo da sua nova presença digital.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SitePublishedEmail,
  subject: 'Seu site Filro está no ar',
  displayName: 'Site publicado',
  previewData: { name: 'João', businessName: 'Padaria do João', publishedUrl: 'https://padariadojoao.filro.site', panelUrl: 'https://filro.site/painel' },
} satisfies TemplateEntry
