import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinir sua senha no {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Redefinir sua senha</Heading>
        <Text style={styles.text}>
          Recebemos um pedido para redefinir a senha da sua conta no {brand.siteName}. Clique no botão abaixo para escolher uma nova senha.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Redefinir senha</Button>
        <Text style={styles.footer}>Se você não solicitou, pode ignorar este e-mail. Sua senha continuará a mesma.</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
