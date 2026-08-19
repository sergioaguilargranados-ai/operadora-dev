import React from 'react'
import { View, Text, Image, StyleSheet, Platform } from 'react-native'
import { useTenantStore } from '../../store/tenant.store'

interface MobileLogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  logoUrl?: string | null
  companyName?: string
}

export const MobileLogo: React.FC<MobileLogoProps> = ({
  variant = 'dark',
  size = 'md',
  logoUrl: propLogoUrl,
  companyName: propCompanyName,
}) => {
  const { logoUrl: tenantLogoUrl, logoMobileUrl, logoDarkUrl, companyName: tenantCompanyName } = useTenantStore()

  const finalLogoUrl = propLogoUrl || logoMobileUrl || (variant === 'dark' ? logoDarkUrl : tenantLogoUrl) || tenantLogoUrl
  const finalCompanyName = propCompanyName || tenantCompanyName || 'AS Operadora'

  const isLight = variant === 'light'
  const textColor = isLight ? '#FFFFFF' : '#000000'

  const isASDefault = !finalCompanyName || finalCompanyName.toLowerCase().includes('as operadora') || finalCompanyName.toLowerCase().includes('as ') || finalCompanyName === 'AS'

  if (finalLogoUrl && typeof finalLogoUrl === 'string' && finalLogoUrl.startsWith('http')) {
    const imgHeight = size === 'lg' ? 70 : size === 'sm' ? 32 : 48
    const imgWidth = size === 'lg' ? 220 : size === 'sm' ? 120 : 180
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: finalLogoUrl }}
          style={{ height: imgHeight, width: imgWidth }}
          resizeMode="contain"
        />
      </View>
    )
  }

  // Exact reproduction of PWA MobileLogo text layout
  const mainSize = size === 'lg' ? 56 : size === 'sm' ? 34 : 44
  const subSize = size === 'lg' ? 9.5 : size === 'sm' ? 7 : 8
  const letterSpacing = size === 'lg' ? 3.5 : size === 'sm' ? 2 : 2.5

  if (isASDefault) {
    return (
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.asMain,
            {
              color: textColor,
              fontSize: mainSize,
            },
          ]}
        >
          AS
        </Text>
        <Text
          style={[
            styles.asSub,
            {
              color: textColor,
              fontSize: subSize,
              letterSpacing,
            },
          ]}
        >
          {'OPERADORA DE\nVIAJES Y EVENTOS'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.textContainer}>
      <Text
        style={[
          styles.tenantTitle,
          {
            color: textColor,
            fontSize: size === 'lg' ? 24 : size === 'sm' ? 15 : 19,
          },
        ]}
      >
        {finalCompanyName.toUpperCase()}
      </Text>
      <Text
        style={[
          styles.asSub,
          {
            color: textColor,
            fontSize: subSize,
            letterSpacing,
            marginTop: 2,
          },
        ]}
      >
        VIAJES Y EVENTOS
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  asMain: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontWeight: '700',
    lineHeight: Platform.select({ ios: undefined, android: undefined, default: undefined }),
    textAlign: 'center',
  },
  asSub: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: -2,
    lineHeight: Platform.select({ ios: 11, android: 11, default: 12 }),
  },
  tenantTitle: {
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
})

export default MobileLogo

