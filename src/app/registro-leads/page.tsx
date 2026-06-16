"use client"

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Playfair_Display, Inter } from 'next/font/google';
import { Building, Briefcase, Plane, Users, ArrowLeft, Loader2, CheckCircle2, Globe } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'] });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'Viajero';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    providerProduct: '',
    type: initialType
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const types = [
    { id: 'Viajero', icon: Plane },
    { id: 'Agencia de Viajes', icon: Briefcase },
    { id: 'Agencia de Eventos', icon: Users },
    { id: 'Empresa', icon: Building },
    { id: 'Proveedor', icon: Globe }
  ];

  const [emailStatus, setEmailStatus] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inicio/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setEmailStatus(data.emailSent);
        setSuccess(true);
      } else {
        setError(data.error || 'Ocurrió un error al procesar tu solicitud.');
      }
    } catch (err: any) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center p-4 ${inter.className}`}>
        <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl max-w-lg w-full text-center">
          <CheckCircle2 className="w-20 h-20 text-black mx-auto mb-6" />
          <h1 className={`text-3xl font-bold mb-4 ${playfair.className}`}>¡Solicitud Recibida!</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Hemos recibido tu información correctamente. Nuestro equipo validará tu perfil y en breve recibirás un correo electrónico con los siguientes pasos.
          </p>
          
          {emailStatus === false && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                <strong>Debug Info:</strong> El correo no pudo enviarse. El servidor API retornó emailSent: false.
             </div>
          )}

          <button 
            onClick={() => router.push('/')}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors w-full"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#F4F4F6] py-12 px-4 ${inter.className}`}>
      {/* Contenedor Central: Formulario */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl flex flex-col justify-center px-6 py-12 md:px-16 relative">
        <button 
          onClick={() => router.push('/')}
          className="absolute top-8 left-8 text-gray-500 hover:text-black flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>

        <div className="max-w-md w-full mx-auto mt-12">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${playfair.className}`}>Crea tu cuenta</h1>
          <p className="text-gray-500 mb-8">Únete a AS Operadora y accede a beneficios exclusivos.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de Tipo */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                    formData.type === t.id 
                      ? 'border-black bg-black text-white shadow-md' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-xs font-semibold text-center leading-tight">{t.id}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                placeholder="+52 55 1234 5678"
              />
            </div>

            {(formData.type === 'Agencia de Viajes' || formData.type === 'Agencia de Eventos' || formData.type === 'Empresa' || formData.type === 'Proveedor') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa/Agencia *</label>
                <input 
                  required
                  type="text" 
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  placeholder="Mi Empresa S.A."
                />
              </div>
            )}

            {formData.type === 'Proveedor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué producto o servicio provee? *</label>
                <input 
                  required
                  type="text" 
                  value={formData.providerProduct}
                  onChange={e => setFormData({...formData, providerProduct: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  placeholder="Ej. Transporte, Alimentos, Tours..."
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-black text-white py-4 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Procesando...' : 'Completar Registro'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default function RegistroLanding() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F4F4F6]">Cargando...</div>}>
      <RegistroForm />
    </Suspense>
  );
}
