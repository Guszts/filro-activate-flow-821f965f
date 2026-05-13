import * as React from 'react'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'Filro'
const SENDER_DOMAIN = 'notify.setup.filro.site'
const FROM_DOMAIN = 'setup.filro.site'

function genToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

interface SendArgs {
  templateName: string
  recipientEmail: string
  idempotencyKey?: string
  templateData?: Record<string, any>
  queue?: 'transactional_emails' | 'auth_emails'
}

/**
 * Server-side enqueue for transactional emails. Use from webhooks / server
 * routes that don't have a user JWT — never from client code.
 * Mirrors the rendering + suppression + token logic of the public
 * send-transactional-email route.
 */
export async function sendTransactionalEmailServer(args: SendArgs): Promise<{ ok: boolean; reason?: string }> {
  const { templateName, recipientEmail, idempotencyKey, templateData = {}, queue = 'transactional_emails' } = args
  const tpl = TEMPLATES[templateName]
  if (!tpl) {
    console.error('[email] template not found', { templateName })
    return { ok: false, reason: 'template_not_found' }
  }
  const recipient = tpl.to || recipientEmail
  if (!recipient) return { ok: false, reason: 'no_recipient' }

  const supabase = supabaseAdmin as any
  const normalized = recipient.toLowerCase()
  const messageId = crypto.randomUUID()

  // Suppression check
  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalized)
    .maybeSingle()
  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'suppressed',
    })
    return { ok: false, reason: 'suppressed' }
  }

  // Unsubscribe token (one per email)
  let unsubscribeToken: string
  const { data: existingTok } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalized)
    .maybeSingle()
  if (existingTok && !existingTok.used_at) {
    unsubscribeToken = existingTok.token
  } else if (!existingTok) {
    unsubscribeToken = genToken()
    await supabase
      .from('email_unsubscribe_tokens')
      .upsert({ token: unsubscribeToken, email: normalized }, { onConflict: 'email', ignoreDuplicates: true })
    const { data: stored } = await supabase
      .from('email_unsubscribe_tokens').select('token').eq('email', normalized).maybeSingle()
    unsubscribeToken = stored?.token ?? unsubscribeToken
  } else {
    return { ok: false, reason: 'token_used' }
  }

  // Render
  const element = React.createElement(tpl.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject = typeof tpl.subject === 'function' ? tpl.subject(templateData) : tpl.subject

  await supabase.from('email_send_log').insert({
    message_id: messageId, template_name: templateName, recipient_email: recipient, status: 'pending',
  })

  const { error: enqErr } = await supabase.rpc('enqueue_email', {
    queue_name: queue,
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey || messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqErr) {
    console.error('[email] enqueue failed', { templateName, err: enqErr })
    await supabase.from('email_send_log').insert({
      message_id: messageId, template_name: templateName, recipient_email: recipient,
      status: 'failed', error_message: 'enqueue failed',
    })
    return { ok: false, reason: 'enqueue_failed' }
  }
  return { ok: true }
}

export async function getAdminEmails(): Promise<string[]> {
  const supabase = supabaseAdmin as any
  const { data } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
  if (!data?.length) return []
  const ids = data.map((r: any) => r.user_id)
  const { data: profiles } = await supabase
    .from('profiles').select('email').in('user_id', ids)
  return (profiles ?? []).map((p: any) => p.email).filter(Boolean)
}
