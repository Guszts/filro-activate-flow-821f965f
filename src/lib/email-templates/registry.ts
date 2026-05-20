import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

import { template as welcomePurchase } from './welcome-purchase'
import { template as saleNotification } from './sale-notification'
import { template as paymentFailed } from './payment-failed'
import { template as subscriptionCanceled } from './subscription-canceled'
import { template as welcomeSignup } from './welcome-signup'
import { template as adminNewSignup } from './admin-new-signup'
import { template as orderConfirmation } from './order-confirmation'
import { template as sitePublished } from './site-published'
import { template as supportReply } from './support-reply'
import { template as extraChargeIssued } from './extra-charge-issued'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome-purchase': welcomePurchase,
  'sale-notification': saleNotification,
  'payment-failed': paymentFailed,
  'subscription-canceled': subscriptionCanceled,
  'welcome-signup': welcomeSignup,
  'admin-new-signup': adminNewSignup,
  'order-confirmation': orderConfirmation,
  'site-published': sitePublished,
  'support-reply': supportReply,
  'extra-charge-issued': extraChargeIssued,
}
