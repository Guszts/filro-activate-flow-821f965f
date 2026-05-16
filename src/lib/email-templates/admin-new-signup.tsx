import * as React from 'react'
import { Body, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface AdminNewSignupProps {
  name?: string
  email?: string
  whatsapp?: string
  businessName?: string
  businessSegment?: string
}

const AdminNewSignupEmail = ({ name, email, whatsapp, businessName, businessSegment }: AdminNewSignupProps) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Novo cadastro — {name ?? email ?? 'cliente'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName} · admin</Text>
        <Heading style={styles.h1}>Novo cadastro</Heading>
        <Text style={styles.text}>Um novo usuário confirmou o e-mail e entrou no funil.</Text>
        <div style={styles.card}>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Nome:</strong> {name ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>E-mail:</strong> {email ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>WhatsApp:</strong> {whatsapp ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Negócio:</strong> {businessName ?? '—'}</Text>
          <Text style={{ ...styles.textInk, margin: '0 0 6px' }}><strong>Segmento:</strong> {businessSegment ?? '—'}</Text>
        </div>
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Aguardando conversão em pedido.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewSignupEmail,
  subject: (d: Record<string, any>) => `Novo cadastro — ${d.name ?? d.email ?? 'cliente'}`,
  displayName: 'Aviso ao admin: novo cadastro',
  previewData: { name: 'Maria', email: 'maria@ex.com', whatsapp: '+55 11 99999-0000', businessName: 'Café', businessSegment: 'Alimentação' },
} satisfies TemplateEntry
