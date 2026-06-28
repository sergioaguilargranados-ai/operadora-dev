import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Layout, Phone, Mail, FileText, Smartphone, List } from "lucide-react";

export function MobileAppContentManager({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number>(1);
  
  const [content, setContent] = useState({
    welcome_phrase: '',
    logo_url: '',
    home_banner_url: '',
    store_banner_url: '',
    help_phone: '',
    help_email: '',
    sections_json: {} as any
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin) {
      loadTenants();
    } else if (user?.tenant_id) {
      setSelectedTenantId(user.tenant_id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedTenantId) {
      loadContent(selectedTenantId);
    }
  }, [selectedTenantId]);

  const loadTenants = async () => {
    try {
      const res = await fetch('/api/tenants?limit=100');
      const data = await res.json();
      if (data.success && data.data) {
        setTenantsList(data.data);
        if (data.data.length > 0) {
          // Determinar inquilino por defecto
          const defaultTenant = data.data.find((t: any) => t.id === 1) || data.data[0];
          setSelectedTenantId(defaultTenant.id);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error cargando lista de empresas', 'error');
    }
  };

  const loadContent = async (tenantId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/mobile/content?tenant_id=${tenantId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContent({
          welcome_phrase: data.data.welcome_phrase || '¿Listo para tu próxima experiencia?',
          logo_url: data.data.logo_url || '',
          home_banner_url: data.data.home_banner_url || '',
          store_banner_url: data.data.store_banner_url || '',
          help_phone: data.data.help_phone || '',
          help_email: data.data.help_email || '',
          sections_json: data.data.sections_json || {}
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Error cargando configuración móvil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/mobile/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: selectedTenantId,
          ...content
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configuración móvil guardada exitosamente', 'success');
      } else {
        showToast(data.error || 'Error al guardar', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (sectionKey: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      sections_json: {
        ...prev.sections_json,
        [sectionKey]: {
          ...(prev.sections_json[sectionKey] || {}),
          [field]: value
        }
      }
    }));
  };

  if (loading && tenantsList.length === 0) return <div className="p-6 text-center">Cargando datos...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
        <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-base">Personalización de App Móvil PWA</p>
          <p className="mt-1">Administra el diseño, imágenes del banner, logotipo y textos del Home y Tienda de la aplicación PWA móvil para cada empresa. Las subidas se almacenan en Vercel Blob.</p>
        </div>
      </div>

      {isSuperAdmin && tenantsList.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 border rounded-xl">
          <label className="font-semibold text-sm text-gray-700 min-w-[120px]">Seleccionar Empresa:</label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(Number(e.target.value))}
            className="flex-1 max-w-md p-2 border rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] outline-none"
          >
            {tenantsList.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.company_name} ({t.tenant_type === 'agency' ? 'Agencia' : 'Corporativo'})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-2">
        <Button onClick={handleSave} disabled={saving} className="bg-[#0066FF] text-white hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TEXTOS Y CONTACTO */}
        <Card className="p-6 border-gray-200 space-y-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Contenidos y Frase de Bienvenida
          </h3>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Frase de Bienvenida (Home)</label>
            <Input 
              value={content.welcome_phrase} 
              onChange={e => setContent({...content, welcome_phrase: e.target.value})}
              placeholder="¿Listo para tu próxima experiencia?"
            />
          </div>

          <h3 className="text-lg font-bold mt-6 mb-4 flex items-center gap-2 border-b pb-2 pt-2">
            <Phone className="w-5 h-5 text-gray-500" />
            Contactos de Soporte / Ayuda Móvil
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Teléfono de Soporte (Móvil)</label>
              <Input 
                value={content.help_phone} 
                onChange={e => setContent({...content, help_phone: e.target.value})}
                placeholder="+52 720 815 6804"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email de Soporte (Móvil)</label>
              <Input 
                type="email"
                value={content.help_email} 
                onChange={e => setContent({...content, help_email: e.target.value})}
                placeholder="support@asoperadora.com"
              />
            </div>
          </div>
        </Card>

        {/* IMÁGENES */}
        <Card className="p-6 border-gray-200 space-y-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <Layout className="w-5 h-5 text-gray-500" />
            Logotipo y Banners Móviles
          </h3>

          <div>
            <label className="text-sm font-medium mb-1 block">Logotipo Personalizado Móvil</label>
            <ImageUploadInput 
              value={content.logo_url} 
              onChange={val => setContent({...content, logo_url: val})}
              placeholder="Logo de empresa..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Banner Principal Móvil (Home)</label>
            <ImageUploadInput 
              value={content.home_banner_url} 
              onChange={val => setContent({...content, home_banner_url: val})}
              placeholder="Imagen ala de avión o banner inicial..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Banner de Login Móvil (Fondo Inferior)</label>
            <ImageUploadInput 
              value={content.sections_json?.login_banner_url || ''} 
              onChange={val => updateSection('login_banner_url', '', val)}
              placeholder="Fondo o imagen del login..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Banner de la Tienda Móvil</label>
            <ImageUploadInput 
              value={content.store_banner_url} 
              onChange={val => setContent({...content, store_banner_url: val})}
              placeholder="Imagen representativa de la tienda..."
            />
          </div>
        </Card>
      </div>

      {/* SECCIONES COMPLEMENTARIAS PWA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 border-gray-200 space-y-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <Layout className="w-5 h-5 text-gray-500" />
            Sección: Banner Promocional (Tienda)
          </h3>
          <div>
            <label className="text-sm font-medium mb-1 block">Título de la Promoción</label>
            <Input 
              value={content.sections_json?.promo_banner?.title || ''} 
              onChange={e => updateSection('promo_banner', 'title', e.target.value)}
              placeholder="¡Promociones del Mes!"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subtítulo / Descripción</label>
            <Input 
              value={content.sections_json?.promo_banner?.subtitle || ''} 
              onChange={e => updateSection('promo_banner', 'subtitle', e.target.value)}
              placeholder="Aprovecha nuestras ofertas exclusivas para miembros"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Imagen del Banner Promocional</label>
            <ImageUploadInput 
              value={content.sections_json?.promo_banner?.image_url || ''} 
              onChange={val => updateSection('promo_banner', 'image_url', val)}
              placeholder="Subir imagen de banner..."
            />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 space-y-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <List className="w-5 h-5 text-gray-500" />
            Sección: Imágenes de Catálogos (Tienda)
          </h3>
          <div>
            <label className="text-sm font-medium mb-1 block">Título de Catálogos</label>
            <Input 
              value={content.sections_json?.catalogs?.title || ''} 
              onChange={e => updateSection('catalogs', 'title', e.target.value)}
              placeholder="Nuestros Catálogos"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Subtítulo de Catálogos</label>
            <Input 
              value={content.sections_json?.catalogs?.subtitle || ''} 
              onChange={e => updateSection('catalogs', 'subtitle', e.target.value)}
              placeholder="Explora vuelos, hoteles y paquetes de viaje"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Imagen Catálogo Vuelos</label>
              <ImageUploadInput 
                value={content.sections_json?.catalogs?.vuelos_img || ''} 
                onChange={val => updateSection('catalogs', 'vuelos_img', val)}
                placeholder="Imagen de vuelos..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Imagen Catálogo Hoteles</label>
              <ImageUploadInput 
                value={content.sections_json?.catalogs?.hoteles_img || ''} 
                onChange={val => updateSection('catalogs', 'hoteles_img', val)}
                placeholder="Imagen de hoteles..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Imagen Catálogo Paquetes</label>
              <ImageUploadInput 
                value={content.sections_json?.catalogs?.paquetes_img || ''} 
                onChange={val => updateSection('catalogs', 'paquetes_img', val)}
                placeholder="Imagen de paquetes..."
              />
            </div>
          </div>
        </Card>
      </div>
      {/* NUEVAS SECCIONES: DOCS E INVITACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 border-gray-200 space-y-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Documentos Oficiales
          </h3>
          <p className="text-xs text-gray-500 mb-2">Sube los documentos en PDF. Serán visibles en el Login y el Menú de la App Móvil.</p>
          <div>
            <label className="text-sm font-medium mb-1 block">Términos y Condiciones</label>
            <Input 
              value={content.sections_json?.docs?.terms_url || ''} 
              onChange={e => updateSection('docs', 'terms_url', e.target.value)}
              placeholder="https://blob.../terminos.pdf"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Aviso de Privacidad</label>
            <Input 
              value={content.sections_json?.docs?.privacy_url || ''} 
              onChange={e => updateSection('docs', 'privacy_url', e.target.value)}
              placeholder="https://blob.../privacidad.pdf"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Programa de Lealtad (Términos)</label>
            <Input 
              value={content.sections_json?.docs?.loyalty_url || ''} 
              onChange={e => updateSection('docs', 'loyalty_url', e.target.value)}
              placeholder="https://blob.../lealtad.pdf"
            />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 space-y-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <Smartphone className="w-5 h-5 text-gray-500" />
            Textos de Invitación (Crea tu Grupo)
          </h3>
          <p className="text-xs text-gray-500 mb-2">Mensaje e imagen promocional por defecto que se adjunta al invitar a amigos a un grupo de viaje.</p>
          <div>
            <label className="text-sm font-medium mb-1 block">Mensaje Base de Invitación</label>
            <textarea 
              rows={3}
              value={content.sections_json?.invitation?.message || ''} 
              onChange={e => updateSection('invitation', 'message', e.target.value)}
              placeholder="¡Acompáñame a este increíble viaje! Únete a mi grupo..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Imagen Promocional del Viaje</label>
            <ImageUploadInput 
              value={content.sections_json?.invitation?.image_url || ''} 
              onChange={val => updateSection('invitation', 'image_url', val)}
              placeholder="Subir imagen de promoción..."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
