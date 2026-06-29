"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Playfair_Display, Inter } from 'next/font/google';
import { Plane, Building, Users, Briefcase, ChevronRight, Shield, Star, HeartHandshake, Globe, ArrowRight, Menu } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { BrandFooter } from '@/components/BrandFooter';
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function InicioLanding() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inicio/content')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRegister = (type: string) => {
    router.push(`/registro-leads?type=${encodeURIComponent(type)}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Cargando...</div>;
  }

  const sj = data?.sections_json ? (typeof data.sections_json === 'string' ? JSON.parse(data.sections_json) : data.sections_json) : {};

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      {/* HEADER */}
      <header className="absolute w-full top-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 lg:px-8 h-24 flex items-center justify-between">
          <Logo forceDefault />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-black font-semibold text-sm hover:underline px-2"
            >
              Acceso
            </button>
            <button 
              onClick={() => handleRegister('Viajero')}
              className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              Regístrate
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO PRINCIPAL (SPLIT LAYOUT) */}
      <section className="relative min-h-[90vh] flex items-center bg-white pt-24 pb-12 lg:pt-0 lg:pb-0 overflow-hidden">
        {/* Imagen a la derecha */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] z-0 h-full">
          <img 
            src={data?.hero_video_url || "/inicio/WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg"} 
            alt="Hero image" 
            className="w-full h-full object-cover"
          />
          {/* Overlay gradiente suave desde la izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent lg:w-[60%] hidden lg:block"></div>
          {/* Overlay oscuro móvil */}
          <div className="absolute inset-0 bg-white/80 lg:hidden"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 flex pt-32 lg:pt-32 pb-12">
          <div className="w-full lg:w-[70%] xl:w-[65%] lg:pr-8">
            <h1 className={`text-5xl md:text-6xl lg:text-[4rem] font-medium text-black mb-6 leading-[1.1] tracking-tight ${playfair.className} max-w-2xl`}>
              {data?.hero_title || "Viajes y eventos diseñados para inspirar, conectar y crecer."}
            </h1>
            <p className="text-sm md:text-base text-gray-800 mb-12 max-w-lg font-normal leading-relaxed">
              {data?.hero_subtitle || "Soluciones para viajeros, agencias de viajes, agencias de eventos y empresas con atención personalizada y experiencias memorables en cada destino."}
            </p>

            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-3">
              <button onClick={() => handleRegister('Viajero')} className="bg-black text-white px-4 py-3 rounded text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto whitespace-nowrap">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Soy viajero
              </button>
              <button onClick={() => handleRegister('Agencia de Viajes')} className="bg-white text-black border border-gray-300 px-4 py-3 rounded text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto whitespace-nowrap">
                <Plane className="w-4 h-4 shrink-0" /> Soy agencia de viajes
              </button>
              <button onClick={() => handleRegister('Agencia de Eventos')} className="bg-white text-black border border-gray-300 px-4 py-3 rounded text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto whitespace-nowrap">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Soy agencia de eventos
              </button>
              <button onClick={() => handleRegister('Empresa')} className="bg-white text-black border border-gray-300 px-4 py-3 rounded text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto whitespace-nowrap">
                <Briefcase className="w-4 h-4 shrink-0" /> Soy empresa
              </button>
              <button onClick={() => handleRegister('Proveedor')} className="bg-white text-black border border-gray-300 px-4 py-3 rounded text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto whitespace-nowrap">
                <Globe className="w-4 h-4 shrink-0" /> Soy proveedor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ¿CÓMO PODEMOS AYUDARTE? */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <h3 className="text-xs font-bold tracking-[0.2em] text-center text-gray-500 mb-16 uppercase">{sj?.ayudas?.title || "¿CÓMO PODEMOS AYUDARTE?"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: sj?.ayudas?.items?.[0]?.title || "Viajeros", 
                img: sj?.ayudas?.items?.[0]?.img || "14WhatsApp_Image_2026-06-12_at_6.00.02_PM_(1).jpeg", 
                icon: Briefcase,
                bullets: sj?.ayudas?.items?.[0]?.bullets || ["Paquetes personalizados", "Viajes grupales", "Cruceros"],
                action: sj?.ayudas?.items?.[0]?.action || "Explorar viajes"
              },
              { 
                title: sj?.ayudas?.items?.[1]?.title || "Agencias de Viajes", 
                img: sj?.ayudas?.items?.[1]?.img || "8WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", 
                icon: Plane,
                bullets: sj?.ayudas?.items?.[1]?.bullets || ["Tarifas preferenciales", "Creación de grupos", "Soporte especializado 24/7"],
                action: sj?.ayudas?.items?.[1]?.action || "Afiliar mi agencia de viajes"
              },
              { 
                title: sj?.ayudas?.items?.[2]?.title || "Agencias de Eventos", 
                img: sj?.ayudas?.items?.[2]?.img || "7WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", 
                icon: Globe,
                bullets: sj?.ayudas?.items?.[2]?.bullets || ["Organización integral", "Logística y producción", "Proveedores especializados"],
                action: sj?.ayudas?.items?.[2]?.action || "Conocer más"
              },
              { 
                title: sj?.ayudas?.items?.[3]?.title || "Empresas", 
                img: sj?.ayudas?.items?.[3]?.img || "6WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", 
                icon: Briefcase,
                bullets: sj?.ayudas?.items?.[3]?.bullets || ["Viajes incentivos", "Congresos y ferias", "Integración de equipos"],
                action: sj?.ayudas?.items?.[3]?.action || "Solicitar propuesta"
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col group">
                <div className="relative mb-6">
                  <div className="h-48 overflow-hidden rounded-sm">
                    <img src={item.img?.startsWith('http') ? item.img : (item.img?.startsWith('/') ? item.img : `/inicio/${item.img}`)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  {/* Icono flotante */}
                  <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <item.icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="px-2 pt-4">
                  <h4 className={`text-xl font-medium mb-4 ${playfair.className}`}>{item.title}</h4>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    {item.bullets.map((bullet: string, j: number) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-black rounded-full"></span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleRegister(item.title)} className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wide">
                    {item.action} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINOS QUE TE ESPERAN */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-4 uppercase">{sj?.destinos?.title || "DESTINOS QUE TE ESPERAN"}</h3>
            <h2 className={`text-4xl md:text-5xl font-medium mb-4 ${playfair.className}`}>{sj?.destinos?.heading || "Descubre el mundo"}</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">{sj?.destinos?.desc || "Cada continente, experiencias únicas y momentos que recordarás siempre."}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: sj?.destinos?.items?.[0]?.name || "América", desc: sj?.destinos?.items?.[0]?.desc || "Naturaleza, cultura y aventura", img: sj?.destinos?.items?.[0]?.img || "1WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
              { name: sj?.destinos?.items?.[1]?.name || "Europa", desc: sj?.destinos?.items?.[1]?.desc || "Historia, arte y elegancia", img: sj?.destinos?.items?.[1]?.img || "3WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
              { name: sj?.destinos?.items?.[2]?.name || "África", desc: sj?.destinos?.items?.[2]?.desc || "Vida salvaje y paisajes únicos", img: sj?.destinos?.items?.[2]?.img || "4WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
              { name: sj?.destinos?.items?.[3]?.name || "Asia", desc: sj?.destinos?.items?.[3]?.desc || "Tradición, modernidad e inspiración", img: sj?.destinos?.items?.[3]?.img || "5WhatsApp_Image_2026-06-12_at_11.15.55_AM.jpeg" },
              { name: sj?.destinos?.items?.[4]?.name || "Oceanía", desc: sj?.destinos?.items?.[4]?.desc || "Playas, ciudades y naturaleza excepcional", img: sj?.destinos?.items?.[4]?.img || "11WhatsApp_Image_2026-06-12_at_11.15.57_AM.jpeg" }
            ].map((dest, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="aspect-[4/3] rounded-sm overflow-hidden mb-4">
                  <img src={dest.img?.startsWith('http') ? dest.img : (dest.img?.startsWith('/') ? dest.img : `/inicio/${dest.img}`)} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h4 className={`text-lg font-medium mb-1 ${playfair.className}`}>{dest.name}</h4>
                <p className="text-xs text-gray-500 mb-3">{dest.desc}</p>
                <div className="flex justify-end mt-auto">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTROS SERVICIOS */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-4 uppercase">{sj?.servicios?.title || "NUESTROS SERVICIOS"}</h3>
            <h2 className={`text-4xl md:text-5xl font-medium ${playfair.className}`}>{sj?.servicios?.heading || "Soluciones para cada necesidad"}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: sj?.servicios?.items?.[0]?.title || "Viajes Vacacionales", desc: sj?.servicios?.items?.[0]?.desc || "Experiencias diseñadas para disfrutar, descansar y crear recuerdos inolvidables.", img: sj?.servicios?.items?.[0]?.img || "6WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", icon: Star },
              { title: sj?.servicios?.items?.[1]?.title || "Grupos y Convenciones", desc: sj?.servicios?.items?.[1]?.desc || "Organizamos eventos y viajes que conectan, motivan y generan impacto.", img: sj?.servicios?.items?.[1]?.img || "7WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", icon: Users },
              { title: sj?.servicios?.items?.[2]?.title || "Operación para Agencias", desc: sj?.servicios?.items?.[2]?.desc || "Herramientas, tarifas competitivas y acompañamiento experto.", img: sj?.servicios?.items?.[2]?.img || "8WhatsApp_Image_2026-06-12_at_11.15.56_AM.jpeg", icon: HeartHandshake }
            ].map((serv, i) => (
              <div key={i} className="flex flex-col group">
                <div className="relative mb-6">
                  <div className="relative h-64 overflow-hidden rounded-sm mb-4">
                    <img src={serv.img?.startsWith('http') ? serv.img : (serv.img?.startsWith('/') ? serv.img : `/inicio/${serv.img}`)} alt={serv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <serv.icon className="w-5 h-5 text-black" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="px-2 pt-4">
                  <h4 className={`text-xl font-medium mb-3 ${playfair.className}`}>{serv.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{serv.desc}</p>
                  <button onClick={() => handleRegister('Viajero')} className="text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wide">
                    Conoce más <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS ROW */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: sj?.beneficios?.items?.[0]?.title || "Experiencias memorables", desc: sj?.beneficios?.items?.[0]?.desc || "Diseñamos viajes cuidadosamente para cada necesidad y presupuesto.", icon: Star },
              { title: sj?.beneficios?.items?.[1]?.title || "Atención personalizada", desc: sj?.beneficios?.items?.[1]?.desc || "Un asesor te acompañará antes, durante y después de tu viaje.", icon: HeartHandshake },
              { title: sj?.beneficios?.items?.[2]?.title || "Destinos selectos", desc: sj?.beneficios?.items?.[2]?.desc || "Opciones nacionales e internacionales para cada tipo de viajero y empresa.", icon: Globe },
              { title: sj?.beneficios?.items?.[3]?.title || "Protección de datos", desc: sj?.beneficios?.items?.[3]?.desc || "Tu información está segura con tecnología y procesos certificados.", icon: Shield }
            ].map((ben, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1">
                  <ben.icon className="w-8 h-8 text-black" strokeWidth={1} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">{ben.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{ben.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TU ALIADO DE NEGOCIOS (SECCIÓN OSCURA) */}
      <section className="bg-[#0f1115] text-white">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">{sj?.aliado?.badge || "PARA AGENCIAS DE VIAJES"}</h3>
            <h2 className={`text-4xl md:text-5xl font-medium mb-6 ${playfair.className}`}>{sj?.aliado?.title || "Tu aliado de negocios"}</h2>
            <p className="text-sm text-gray-300 mb-12 max-w-md leading-relaxed">
              {sj?.aliado?.desc || "Trabajamos juntos para que tu agencia crezca más, con la tranquilidad de tener un equipo que te respalda."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div>
                <Briefcase className="w-6 h-6 mb-3 text-gray-400" strokeWidth={1.5} />
                <h4 className="text-xs font-semibold mb-2">{sj?.aliado?.items?.[0]?.title || "Herramientas"}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">{sj?.aliado?.items?.[0]?.desc || "Plataforma fácil de usar para cotizar, reservar y administrar."}</p>
              </div>
              <div>
                <Star className="w-6 h-6 mb-3 text-gray-400" strokeWidth={1.5} />
                <h4 className="text-xs font-semibold mb-2">{sj?.aliado?.items?.[1]?.title || "Tarifas competitivas"}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">{sj?.aliado?.items?.[1]?.desc || "Acceso a tarifas preferenciales y promociones exclusivas para tu agencia."}</p>
              </div>
              <div>
                <Users className="w-6 h-6 mb-3 text-gray-400" strokeWidth={1.5} />
                <h4 className="text-xs font-semibold mb-2">{sj?.aliado?.items?.[2]?.title || "Acompañamiento experto"}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">{sj?.aliado?.items?.[2]?.desc || "Soporte y capacitación constante para impulsar tu crecimiento."}</p>
              </div>
            </div>

            <div>
              <button onClick={() => handleRegister('Agencia de Viajes')} className="bg-white text-black px-6 py-3 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
                Conocer más <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 min-h-[400px] relative">
            <img src={sj?.aliado?.img?.startsWith('http') ? sj.aliado.img : (sj?.aliado?.img?.startsWith('/') ? sj.aliado.img : `/inicio/${sj?.aliado?.img || "13WhatsApp_Image_2026-06-12_at_12.23.41_PM.jpeg"}`)} alt={sj?.aliado?.title || "Aliado de negocios"} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] to-transparent hidden lg:block"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] to-transparent lg:hidden"></div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="bg-[#1C1C1E] text-white py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <h2 className={`text-3xl md:text-4xl font-medium ${playfair.className}`}>Tu próximo viaje<br/>comienza aquí.</h2>
            
            <div className="flex flex-wrap justify-end gap-3 lg:gap-4">
              <button onClick={() => handleRegister('Viajero')} className="bg-transparent text-white border border-gray-600 px-4 py-2 rounded text-[10px] font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> 
                Registrarme<br/>como viajero
              </button>
              <button onClick={() => handleRegister('Agencia de Viajes')} className="bg-transparent text-white border border-gray-600 px-4 py-2 rounded text-[10px] font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <Plane className="w-3 h-3" /> 
                Registrar<br/>mi agencia<br/>de viajes
              </button>
              <button onClick={() => handleRegister('Agencia de Eventos')} className="bg-transparent text-white border border-gray-600 px-4 py-2 rounded text-[10px] font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
                Registrar<br/>mi agencia<br/>de eventos
              </button>
              <button onClick={() => handleRegister('Empresa')} className="bg-transparent text-white border border-gray-600 px-4 py-2 rounded text-[10px] font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> 
                Solicitar propuesta<br/>empresarial
              </button>
              <button onClick={() => handleRegister('Proveedor')} className="bg-transparent text-white border border-gray-600 px-4 py-2 rounded text-[10px] font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                <Globe className="w-3 h-3" /> 
                Registrarse<br/>como proveedor
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <PwaInstallButton />
          </div>
          <div className="mt-12 text-center border-t border-gray-800 pt-6">
            <span className="text-[10px] text-gray-500">v2.359 | 29 Jun 2026 00:00 CST | AS Operadora viajes y eventos</span>
          </div>
        </div>
      </section>

      {/* FOOTER OFICIAL (Oculto en landing por petición) */}
      {/* <BrandFooter /> */}
    </div>
  );
}
