import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';
import { BrandFooter } from '@/components/BrandFooter';

// Este componente se renderiza en el servidor
export default async function ExpoLandingPage() {
  let content = {
    hero_video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    hero_title: 'AS Operadora en la Expo 2026',
    hero_subtitle: 'Descubre las mejores opciones de viaje corporativo y recompensas.',
    sections_json: [] as any[]
  };

  try {
    const result = await query(
      'SELECT hero_video_url, hero_title, hero_subtitle, sections_json FROM expo_landing_content ORDER BY id DESC LIMIT 1'
    );
    if (result.rows.length > 0) {
      const data = result.rows[0];
      content = {
        hero_video_url: data.hero_video_url || content.hero_video_url,
        hero_title: data.hero_title || content.hero_title,
        hero_subtitle: data.hero_subtitle || content.hero_subtitle,
        sections_json: typeof data.sections_json === 'string' 
          ? JSON.parse(data.sections_json) 
          : (data.sections_json || [])
      };
    }
  } catch (err) {
    console.error('Error loading expo content in server:', err);
  }

  return (
    <div className="min-h-screen flex flex-col expo-bg-white text-expo-gray">
      <style dangerouslySetInnerHTML={{__html: `
        .font-bodoni { font-family: 'Bodoni FLF', 'Bodoni MT', 'Didot', serif; }
        .font-avenir { font-family: 'Avenir Next Arabic', 'Avenir Next', 'Avenir', sans-serif; }
        .expo-bg-white { background-color: #FFFFFF; }
        .expo-text-black { color: #000000; }
        .expo-text-gray { color: #1C1C1E; }
        .expo-bg-gray { background-color: #F4F4F6; }
        .expo-bg-translucent { background-color: rgba(255, 255, 255, 0.65); backdrop-filter: blur(8px); }
      `}} />
      
      {/* Reutilizando elementos del header del sitio */}
      <div className="absolute top-0 w-full z-50 expo-bg-translucent shadow-sm">
        <header className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo className="py-2" />
          <UserMenu />
        </header>
      </div>

      {/* Hero Section con Video */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
        >
          <source src={content.hero_video_url} type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
        
        {/* Overlay para oscurecer un poco el video y que resalte el texto si es necesario, 
            pero el cliente pidió translucido blanco al 65% para tarjetas. 
            Aplicaremos el overlay translúcido al contenedor de texto */}
        
        <div className="relative z-10 text-center expo-bg-translucent p-10 rounded-2xl max-w-4xl mx-4 border border-white/50 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-bodoni expo-text-black mb-6 tracking-tight">
            {content.hero_title}
          </h1>
          <p className="text-xl md:text-2xl font-avenir expo-text-gray mb-10 max-w-2xl mx-auto">
            {content.hero_subtitle}
          </p>
          <Link 
            href="/expo/registro" 
            className="inline-block bg-black text-white font-avenir text-lg px-8 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-105"
          >
            Regístrate Ahora
          </Link>
        </div>
      </section>

      {/* Secciones Dinámicas */}
      {content.sections_json && content.sections_json.length > 0 && (
        <div className="w-full">
          {content.sections_json.map((section: any, idx: number) => (
            <section 
              key={idx} 
              className={`py-24 px-6 md:px-12 ${idx % 2 === 0 ? 'expo-bg-gray' : 'expo-bg-white'}`}
            >
              <div className={`max-w-7xl mx-auto flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                <div className="flex-1 w-full">
                  {section.image_url ? (
                    <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                      <img 
                        src={section.image_url} 
                        alt={section.title} 
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="h-[400px] w-full bg-gray-200 rounded-2xl flex items-center justify-center">
                      <span className="text-gray-400 font-avenir">Sin Imagen</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bodoni expo-text-black">
                    {section.title}
                  </h2>
                  <div className="w-20 h-1 bg-black rounded-full"></div>
                  <p className="text-lg md:text-xl font-avenir expo-text-gray leading-relaxed">
                    {section.text}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer del sitio */}
      <div className="mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
}
