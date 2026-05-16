import * as React from 'react'
import { Body, Button, Container, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'
import { BrandHead } from './_head'
import type { TemplateEntry } from './registry'

interface WelcomeSignupProps {
  name?: string
  checkoutUrl?: string
}

const WelcomeSignupEmail = ({ name, checkoutUrl }: WelcomeSignupProps) => (
  <Html lang="pt-BR" dir="ltr">
    <BrandHead />
    <Preview>Bem-vindo ao {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Bem-vindo{name ? `, ${name}` : ''}!</Heading>
        <Text style={styles.text}>
          Seu cadastro foi confirmado. Agora é só escolher seu plano para começarmos a preparar
          sua presença digital — entregamos em até 24h depois do pagamento confirmado.
        </Text>
        {checkoutUrl && (
          <Button style={styles.button} href={checkoutUrl}>Escolher meu plano</Button>
        )}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>Qualquer dúvida, é só responder este e-mail.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeSignupEmail,
  subject: 'Bem-vindo ao Filro',
  displayName: 'Boas-vindas (pós-cadastro)',
  previewData: { name: 'João', checkoutUrl: 'https://filro.site/checkout' },
} satisfies TemplateEntry
