import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirme sua identidade</Heading>
        <Text style={styles.text}>Use o código abaixo para confirmar sua identidade:</Text>
        <Text style={styles.code}>{token}</Text>
        <Text style={styles.footer}>Este código expira em breve. Se não foi você, ignore este e-mail.</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
