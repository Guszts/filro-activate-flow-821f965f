import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso ao {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Seu link de acesso</Heading>
        <Text style={styles.text}>Clique no botão abaixo para entrar na sua conta. Este link expira em breve.</Text>
        <Button style={styles.button} href={confirmationUrl}>Entrar</Button>
        <Text style={styles.footer}>Se você não pediu este link, pode ignorar com segurança.</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
