import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Layout, Phone, Mail, FileText, Smartphone, List, Gift, HelpCircle, Plus, Trash2, Video, Image as ImageIcon } from "lucide-react";

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

  const [rewardsSteps, setRewardsSteps] = useState<any[]>([]);
  const [helpTopics, setHelpTopics] = useState<any[]>([]);

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
      const [resContent, resRewards, resHelp] = await Promise.all([
        fetch(`/api/mobile/content?tenant_id=${tenantId}`),
        fetch(`/api/mobile/rewards?tenant_id=${tenantId}`),
        fetch(`/api/mobile/help?tenant_id=${tenantId}`)
      ]);
      
      const [dataContent, dataRewards, dataHelp] = await Promise.all([
        resContent.json(), resRewards.json(), resHelp.json()
      ]);

      if (dataContent.success && dataContent.data) {
        setContent({
          welcome_phrase: dataContent.data.welcome_phrase || '¿Listo para tu próxima experiencia?',
          logo_url: dataContent.data.logo_url || '',
          home_banner_url: dataContent.data.home_banner_url || '',
          store_banner_url: dataContent.data.store_banner_url || '',
          help_phone: dataContent.data.help_phone || '',
          help_email: dataContent.data.help_email || '',
          sections_json: dataContent.data.sections_json || {}
        });
      }

      if (dataRewards.success) {
        setRewardsSteps(dataRewards.data || []);
      }
      
      if (dataHelp.success) {
        setHelpTopics(dataHelp.data || []);
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
      
      // Guardar Rewards Steps
      await Promise.all(rewardsSteps.map((step, index) => 
        fetch('/api/mobile/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...step, tenant_id: selectedTenantId, step_order: index })
        })
      ));

      // Guardar Help Topics
      await Promise.all(helpTopics.map((topic, index) => 
        fetch('/api/mobile/help', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...topic, tenant_id: selectedTenantId, order_index: index })
        })
      ));

      const data = await res.json();
      if (data.success) {
        showToast('Configuración móvil guardada exitosamente', 'success');
        loadContent(selectedTenantId); // Recargar para obtener IDs
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
    if (sectionKey === 'baggage_text') {
      setContent(prev => ({
        ...prev,
        sections_json: {
          ...prev.sections_json,
          baggage_text: value
        }
      }));
      return;
    }
    
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

  const deleteRewardStep = async (index: number) => {
    const step = rewardsSteps[index];
    if (step.id) {
      await fetch(`/api/mobile/rewards?id=${step.id}`, { method: 'DELETE' });
    }
    const newList = [...rewardsSteps];
    newList.splice(index, 1);
    setRewardsSteps(newList);
  };

  const deleteHelpTopic = async (index: number) => {
    const topic = helpTopics[index];
    if (topic.id) {
      await fetch(`/api/mobile/help?id=${topic.id}`, { method: 'DELETE' });
    }
    const newList = [...helpTopics];
    newList.splice(index, 1);
    setHelpTopics(newList);
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
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Teléfono de Soporte (Help Center)</label>
                  <Input value={content.help_phone || ''} onChange={e => setContent({...content, help_phone: e.target.value})} placeholder="Ej: +521234567890" className="bg-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email de Soporte</label>
                  <Input value={content.help_email || ''} onChange={e => setContent({...content, help_email: e.target.value})} placeholder="Ej: soporte@agencia.com" className="bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Texto para "Problemas con Equipaje"</label>
                  <textarea 
                    value={content.sections_json?.baggage_text || ''} 
                    onChange={e => updateSection('baggage_text', 'baggage_text', e.target.value)} 
                    placeholder="Ej: Si tienes problemas con tu equipaje, por favor acude al mostrador de la aerolínea..." 
                    className="w-full bg-white border border-gray-300 rounded-md p-3 text-sm min-h-[100px]" 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Este texto se mostrará en la app móvil cuando el cliente seleccione la opción de problemas de equipaje.</p>
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

      {/* NUEVAS SECCIONES DE BD: REWARDS AS Y AYUDA */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* REWARDS AS */}
        <Card className="p-6 border-gray-200">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-gray-500" />
              Programa de Lealtad (Rewards AS)
            </h3>
            <Button variant="outline" size="sm" onClick={() => setRewardsSteps([...rewardsSteps, { title: '', description: '', image_url: '', video_url: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> Añadir Paso
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Configura los pasos y beneficios del programa de lealtad. Puedes subir una imagen ilustrativa y un video explicativo (en formato URL o MP4 subido al blob) para cada componente.</p>
          
          <div className="space-y-6">
            {rewardsSteps.map((step, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 relative">
                <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteRewardStep(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Título del Paso</label>
                    <Input value={step.title || ''} onChange={e => {
                      const list = [...rewardsSteps]; list[idx].title = e.target.value; setRewardsSteps(list);
                    }} placeholder="Ej: Regístrate en la App" className="bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Descripción</label>
                    <textarea value={step.description || ''} onChange={e => {
                      const list = [...rewardsSteps]; list[idx].description = e.target.value; setRewardsSteps(list);
                    }} placeholder="Gana 50 puntos al registrarte..." className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm" rows={2} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Imagen del Paso</label>
                    <ImageUploadInput value={step.image_url || ''} onChange={val => {
                      const list = [...rewardsSteps]; list[idx].image_url = val; setRewardsSteps(list);
                    }} placeholder="Subir imagen a Vercel Blob..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Video className="w-3 h-3"/> Video Explicativo</label>
                    <ImageUploadInput value={step.video_url || ''} onChange={val => {
                      const list = [...rewardsSteps]; list[idx].video_url = val; setRewardsSteps(list);
                    }} placeholder="Subir video MP4 a Vercel Blob..." />
                  </div>
                </div>
              </div>
            ))}
            {rewardsSteps.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed">
                Aún no hay pasos configurados. Haz clic en "Añadir Paso".
              </div>
            )}
          </div>
        </Card>

        {/* CENTRO DE AYUDA */}
        <Card className="p-6 border-gray-200">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-500" />
              Sección: ¿Necesitas Ayuda?
            </h3>
            <Button variant="outline" size="sm" onClick={() => setHelpTopics([...helpTopics, { title: '', description: '', image_url: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> Añadir Tema
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-4">Configura las preguntas frecuentes y apartados de ayuda. Sube una imagen miniatura y datos de cada apartado para la app móvil PWA.</p>
          
          <div className="space-y-4">
            {helpTopics.map((topic, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 relative">
                <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteHelpTopic(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Título del Apartado</label>
                    <Input value={topic.title || ''} onChange={e => {
                      const list = [...helpTopics]; list[idx].title = e.target.value; setHelpTopics(list);
                    }} placeholder="Ej: Perdí mi tour o traslado" className="bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Descripción / Subtítulo</label>
                    <Input value={topic.description || ''} onChange={e => {
                      const list = [...helpTopics]; list[idx].description = e.target.value; setHelpTopics(list);
                    }} placeholder="Consulta tu itinerario completo..." className="bg-white text-sm" />
                  </div>
                </div>
                
                <div className="w-full md:w-1/3">
                  <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> Imagen del Apartado</label>
                  <ImageUploadInput value={topic.image_url || ''} onChange={val => {
                    const list = [...helpTopics]; list[idx].image_url = val; setHelpTopics(list);
                  }} placeholder="Subir imagen miniatura..." />
                </div>
              </div>
            ))}
            {helpTopics.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed">
                Aún no hay temas de ayuda configurados. Haz clic en "Añadir Tema".
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
