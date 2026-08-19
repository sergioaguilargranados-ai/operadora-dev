import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang = 'en', sourceLang = 'es' } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: 'Texto requerido' }, { status: 400 })
    }

    // Map common language and country names to ISO codes
    const langMap: Record<string, string> = {
      'inglés': 'en',
      'ingles': 'en',
      'inglés (reino unido)': 'en',
      'reino unido': 'en',
      'londres': 'en',
      'estados unidos': 'en',
      'francés': 'fr',
      'frances': 'fr',
      'francia': 'fr',
      'parís': 'fr',
      'paris': 'fr',
      'italiano': 'it',
      'italia': 'it',
      'roma': 'it',
      'alemán': 'de',
      'aleman': 'de',
      'alemania': 'de',
      'berlín': 'de',
      'berlin': 'de',
      'portugués': 'pt',
      'portugues': 'pt',
      'portugal': 'pt',
      'brasil': 'pt',
      'lisboa': 'pt',
      'japonés': 'ja',
      'japones': 'ja',
      'japón': 'ja',
      'japon': 'ja',
      'tokio': 'ja',
      'chino': 'zh-CN',
      'china': 'zh-CN',
      'holandés': 'nl',
      'holandes': 'nl',
      'países bajos': 'nl',
      'amsterdam': 'nl',
      'griego': 'el',
      'grecia': 'el',
      'atenas': 'el',
      'santorini': 'el',
      'turco': 'tr',
      'turquía': 'tr',
      'turquia': 'tr',
      'estambul': 'tr',
      'árabe': 'ar',
      'arabe': 'ar',
      'dubai': 'ar',
      'egipto': 'ar',
      'catalán': 'ca',
      'euskera': 'eu',
      'gallego': 'gl',
      'español': 'es',
      'espanol': 'es',
      'español (castellano)': 'es'
    }

    const normalizedTarget = targetLang.toLowerCase().trim()
    let finalTargetLang = langMap[normalizedTarget]
    if (!finalTargetLang) {
      // Buscar coincidencias parciales
      for (const [key, code] of Object.entries(langMap)) {
        if (normalizedTarget.includes(key)) {
          finalTargetLang = code
          break
        }
      }
    }
    if (!finalTargetLang) {
      finalTargetLang = normalizedTarget.length === 2 ? normalizedTarget : 'en'
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${finalTargetLang}&dt=t&q=${encodeURIComponent(text)}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Error en API de traducción')
    }
    
    const data = await response.json()
    // data[0] is an array of translated segments. We join them.
    let translatedText = ''
    if (data && data[0] && Array.isArray(data[0])) {
      translatedText = data[0].map((item: any) => item[0]).join('')
    }

    return NextResponse.json({ success: true, translation: translatedText })
  } catch (error: any) {
    console.error('Error translating:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
