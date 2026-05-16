import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({ confirmationUrl, token }: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de confirmação Filro</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirme seu e-mail</Heading>
        <Text style={styles.text}>
          Use o código de 6 dígitos abaixo para confirmar seu cadastro no {brand.siteName}.
        </Text>
        {token && <Text style={styles.code}>{token}</Text>}
        <Text style={styles.text}>O código expira em 1 hora.</Text>
        <Hr style={styles.hr} />
        <Text style={{ ...styles.text, fontSize: '13px' }}>
          Prefere confirmar por link? Clique no botão abaixo.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Confirmar por link</Button>
        <Text style={styles.footer}>Se não foi você quem criou a conta, ignore este e-mail.</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
