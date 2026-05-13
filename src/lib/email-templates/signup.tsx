import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme seu e-mail no {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirme seu e-mail</Heading>
        <Text style={styles.text}>
          Boas-vindas ao {brand.siteName}. Para começar a ativar sua presença digital, confirme seu e-mail clicando no botão abaixo.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Confirmar e-mail</Button>
        <Text style={styles.footer}>Se não foi você quem criou a conta, ignore este e-mail.</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
