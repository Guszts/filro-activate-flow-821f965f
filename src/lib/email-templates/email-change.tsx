import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Confirme a alteração de e-mail no {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Confirme a alteração de e-mail</Heading>
        <Text style={styles.text}>
          Você pediu para mudar o e-mail da sua conta no {brand.siteName} de <strong style={{ color: brand.ink }}>{oldEmail}</strong> para <strong style={{ color: brand.ink }}>{newEmail}</strong>.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Confirmar alteração</Button>
        <Text style={styles.footer}>Se não foi você, proteja sua conta imediatamente.</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
