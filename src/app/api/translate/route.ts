import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang = 'en', sourceLang = 'es' } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: 'Texto requerido' }, { status: 400 })
    }

    // Map common language names to codes if needed
    const langMap: Record<string, string> = {
      'inglés': 'en',
      'ingles': 'en',
      'inglés (reino unido)': 'en',
      'francés': 'fr',
      'frances': 'fr',
      'italiano': 'it',
      'alemán': 'de',
      'aleman': 'de',
      'portugués': 'pt',
      'portugues': 'pt',
      'japonés': 'ja',
      'japones': 'ja',
      'chino': 'zh-CN',
      'holandés': 'nl',
      'griego': 'el',
      'catalán': 'ca',
      'euskera': 'eu',
      'gallego': 'gl'
    }

    const normalizedTarget = targetLang.toLowerCase().trim()
    const finalTargetLang = langMap[normalizedTarget] || (normalizedTarget.length === 2 ? normalizedTarget : 'en')

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
