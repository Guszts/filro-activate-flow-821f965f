import * as React from 'react'
import { Font, Head } from '@react-email/components'

// Shared <Head> with Nunito (rounded) webfont for clients that support it.
// Fallbacks defined in _brand.ts handle the rest (ui-rounded, SF Pro Rounded, system-ui).
export const BrandHead = () => (
  <Head>
    <Font
      fontFamily="Nunito"
      fallbackFontFamily="Arial"
      webFont={{
        url: 'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshRTM9jo7eTWk.woff2',
        format: 'woff2',
      }}
      fontWeight={500}
      fontStyle="normal"
    />
    <Font
      fontFamily="Nunito"
      fallbackFontFamily="Arial"
      webFont={{
        url: 'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshRTM9jo7eTWk.woff2',
        format: 'woff2',
      }}
      fontWeight={800}
      fontStyle="normal"
    />
  </Head>
)

export default BrandHead
