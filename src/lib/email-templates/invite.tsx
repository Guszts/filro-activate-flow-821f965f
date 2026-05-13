import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { brand, styles } from './_brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Você foi convidado para o {brand.siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Você foi convidado</Heading>
        <Text style={styles.text}>
          Você foi convidado para entrar no {brand.siteName}. Clique no botão abaixo para aceitar e criar sua conta.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>Aceitar convite</Button>
        <Text style={styles.footer}>Se não esperava este convite, pode ignorar este e-mail.</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
