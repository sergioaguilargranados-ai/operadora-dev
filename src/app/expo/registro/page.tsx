"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';
import { BrandFooter } from '@/components/BrandFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ExpoRegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    email: '',
    job_title: '',
    agency_name: '',
    website: '',
    social_media: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/expo/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Ocurrió un error al enviar el formulario.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col expo-bg-gray">
      <style dangerouslySetInnerHTML={{__html: `
        .font-bodoni { font-family: 'Bodoni FLF', 'Bodoni MT', 'Didot', serif; }
        .font-avenir { font-family: 'Avenir Next Arabic', 'Avenir Next', 'Avenir', sans-serif; }
        .expo-bg-white { background-color: #FFFFFF; }
        .expo-text-black { color: #000000; }
        .expo-text-gray { color: #1C1C1E; }
        .expo-bg-gray { background-color: #F4F4F6; }
        .expo-bg-translucent { background-color: rgba(255, 255, 255, 0.65); backdrop-filter: blur(8px); }
      `}} />

      <div className="sticky top-0 w-full z-50 bg-white shadow-sm border-b">
        <header className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo className="py-2" />
          <UserMenu />
        </header>
      </div>

      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-2xl expo-bg-white shadow-2xl rounded-2xl overflow-hidden border-0">
          <div className="p-8 md:p-12">
            <Link href="/expo" className="flex items-center text-gray-500 hover:text-black transition-colors mb-8 font-avenir text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la página principal
            </Link>

            {success ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-4xl font-bodoni expo-text-black mb-4">¡Registro Exitoso!</h2>
                <p className="text-lg font-avenir expo-text-gray mb-8">
                  Gracias por registrarte. Nuestro equipo se pondrá en contacto contigo pronto.
                </p>
                <Button 
                  onClick={() => router.push('/expo')}
                  className="bg-black text-white hover:bg-gray-800 font-avenir text-lg px-8 py-6 rounded-full"
                >
                  Regresar al Inicio
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h1 className="text-4xl md:text-5xl font-bodoni expo-text-black mb-4">Registro Expo</h1>
                  <p className="text-lg font-avenir expo-text-gray">
                    Completa el siguiente formulario para conectar con nosotros.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-avenir text-center border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 font-avenir">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 expo-text-black">Nombre Completo *</label>
                      <Input 
                        name="contact_name" 
                        value={formData.contact_name} 
                        onChange={handleChange} 
                        required 
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 expo-text-black">Celular *</label>
                      <Input 
                        name="contact_phone" 
                        value={formData.contact_phone} 
                        onChange={handleChange} 
                        required 
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="Ej. 55 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 expo-text-black">Correo Electrónico *</label>
                      <Input 
                        type="email"
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 expo-text-black">Cargo / Puesto</label>
                      <Input 
                        name="job_title" 
                        value={formData.job_title} 
                        onChange={handleChange} 
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="Ej. Director General"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 expo-text-black">Nombre de la Agencia / Empresa *</label>
                      <Input 
                        name="agency_name" 
                        value={formData.agency_name} 
                        onChange={handleChange} 
                        required
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="Ej. Viajes Mágicos SA de CV"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 expo-text-black">Sitio Web</label>
                      <Input 
                        name="website" 
                        value={formData.website} 
                        onChange={handleChange} 
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="www.tuagencia.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 expo-text-black">Redes Sociales</label>
                      <Input 
                        name="social_media" 
                        value={formData.social_media} 
                        onChange={handleChange} 
                        className="bg-gray-50 border-gray-200 focus-visible:ring-black h-12"
                        placeholder="@tuagencia"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-black text-white hover:bg-gray-800 font-avenir text-lg h-14 rounded-full transition-all"
                    >
                      {loading ? 'Enviando...' : 'Enviar Registro'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
}
