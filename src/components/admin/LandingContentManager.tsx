import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { Save, Video, Layout, List, Map, Briefcase, Star, Users } from "lucide-react";

export function LandingContentManager({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState({
    hero_video_url: '',
    hero_title: '',
    hero_subtitle: '',
    sections_json: {} as any
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await fetch('/api/inicio/content');
      const data = await res.json();
      if (data.success && data.data) {
        setContent({
          hero_video_url: data.data.hero_video_url || '',
          hero_title: data.data.hero_title || '',
          hero_subtitle: data.data.hero_subtitle || '',
          sections_json: typeof data.data.sections_json === 'string' 
            ? JSON.parse(data.data.sections_json) 
            : (data.data.sections_json || {})
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Error cargando contenido de la Landing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/inicio/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Contenido de la Landing guardado', 'success');
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

  // Helper to update deeply nested sections
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

  const updateItem = (sectionKey: string, itemIndex: number, field: string, value: any) => {
    setContent(prev => {
      const sec = prev.sections_json[sectionKey] || { items: [] };
      const items = [...(sec.items || [])];
      if (!items[itemIndex]) items[itemIndex] = {};
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      return {
        ...prev,
        sections_json: {
          ...prev.sections_json,
          [sectionKey]: { ...sec, items }
        }
      };
    });
  };

  if (loading) return <div>Cargando contenido de Landing...</div>;

  const sj = content.sections_json || {};

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
        <Layout className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Landing Principal (/inicio)</p>
          <p>Administra las imágenes y textos de todas las secciones de la página principal. Los íconos vectoriales del diseño se mantienen fijos para asegurar la calidad visual de la interfaz.</p>
        </div>
      </div>

      <div className="flex justify-end sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-2">
        <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* HERO */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Video className="w-5 h-5" />
          Configuración Hero
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">URL de Imagen/Video de Fondo</label>
            <ImageUploadInput 
              value={content.hero_video_url} 
              onChange={val => setContent({...content, hero_video_url: val})}
              placeholder="/inicio/WhatsApp Image... o URL externa"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título Principal</label>
              <Input 
                value={content.hero_title} 
                onChange={e => setContent({...content, hero_title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subtítulo</label>
              <Input 
                value={content.hero_subtitle} 
                onChange={e => setContent({...content, hero_subtitle: e.target.value})}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* AYUDAS */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <List className="w-5 h-5" />
          Sección: ¿Cómo podemos ayudarte?
        </h3>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Título de Sección</label>
            <Input value={sj?.ayudas?.title || ''} onChange={e => updateSection('ayudas', 'title', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(sj?.ayudas?.items || []).map((item: any, i: number) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-semibold text-sm">Tarjeta {i + 1}</h4>
                <div>
                  <label className="text-xs font-medium block">Título</label>
                  <Input className="text-xs" value={item.title || ''} onChange={e => updateItem('ayudas', i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Imagen (ruta)</label>
                  <ImageUploadInput className="text-xs h-9" value={item.img || ''} onChange={val => updateItem('ayudas', i, 'img', val)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Viñetas (separar por coma)</label>
                  <Input className="text-xs" value={(item.bullets || []).join(', ')} onChange={e => updateItem('ayudas', i, 'bullets', e.target.value.split(',').map((s:string)=>s.trim()))} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Texto Botón</label>
                  <Input className="text-xs" value={item.action || ''} onChange={e => updateItem('ayudas', i, 'action', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* DESTINOS */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Map className="w-5 h-5" />
          Sección: Destinos que te esperan
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block">Etiqueta</label>
              <Input value={sj?.destinos?.title || ''} onChange={e => updateSection('destinos', 'title', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block">Título Principal</label>
              <Input value={sj?.destinos?.heading || ''} onChange={e => updateSection('destinos', 'heading', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block">Descripción Corta</label>
              <Input value={sj?.destinos?.desc || ''} onChange={e => updateSection('destinos', 'desc', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(sj?.destinos?.items || []).map((item: any, i: number) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-semibold text-sm">Destino {i + 1}</h4>
                <div>
                  <label className="text-xs font-medium block">Nombre</label>
                  <Input className="text-xs" value={item.name || ''} onChange={e => updateItem('destinos', i, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Descripción</label>
                  <Input className="text-xs" value={item.desc || ''} onChange={e => updateItem('destinos', i, 'desc', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Imagen (ruta)</label>
                  <ImageUploadInput className="text-xs h-9" value={item.img || ''} onChange={val => updateItem('destinos', i, 'img', val)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* SERVICIOS */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Sección: Nuestros Servicios
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block">Etiqueta</label>
              <Input value={sj?.servicios?.title || ''} onChange={e => updateSection('servicios', 'title', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block">Título Principal</label>
              <Input value={sj?.servicios?.heading || ''} onChange={e => updateSection('servicios', 'heading', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(sj?.servicios?.items || []).map((item: any, i: number) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-semibold text-sm">Servicio {i + 1}</h4>
                <div>
                  <label className="text-xs font-medium block">Título</label>
                  <Input className="text-xs" value={item.title || ''} onChange={e => updateItem('servicios', i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Descripción</label>
                  <Input className="text-xs" value={item.desc || ''} onChange={e => updateItem('servicios', i, 'desc', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Imagen (ruta)</label>
                  <ImageUploadInput className="text-xs h-9" value={item.img || ''} onChange={val => updateItem('servicios', i, 'img', val)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* BENEFICIOS */}
      <Card className="p-6 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Sección: Beneficios
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(sj?.beneficios?.items || []).map((item: any, i: number) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-semibold text-sm">Beneficio {i + 1}</h4>
                <div>
                  <label className="text-xs font-medium block">Título</label>
                  <Input className="text-xs" value={item.title || ''} onChange={e => updateItem('beneficios', i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Descripción</label>
                  <Input className="text-xs" value={item.desc || ''} onChange={e => updateItem('beneficios', i, 'desc', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ALIADO */}
      <Card className="p-6 border-gray-200 mb-12">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Sección: Aliado de Negocios
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block">Etiqueta (Badge)</label>
              <Input value={sj?.aliado?.badge || ''} onChange={e => updateSection('aliado', 'badge', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block">Título Principal</label>
              <Input value={sj?.aliado?.title || ''} onChange={e => updateSection('aliado', 'title', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block">Descripción general</label>
              <Input value={sj?.aliado?.desc || ''} onChange={e => updateSection('aliado', 'desc', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block">Imagen Lateral (ruta)</label>
              <ImageUploadInput className="h-10" value={sj?.aliado?.img || ''} onChange={val => updateSection('aliado', 'img', val)} />
            </div>
          </div>
          <h4 className="font-semibold text-sm mt-4">Puntos Clave</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(sj?.aliado?.items || []).map((item: any, i: number) => (
              <div key={i} className="border p-4 rounded-lg bg-gray-50 space-y-3">
                <h4 className="font-semibold text-sm">Punto {i + 1}</h4>
                <div>
                  <label className="text-xs font-medium block">Título</label>
                  <Input className="text-xs" value={item.title || ''} onChange={e => updateItem('aliado', i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium block">Descripción</label>
                  <Input className="text-xs" value={item.desc || ''} onChange={e => updateItem('aliado', i, 'desc', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
    </div>
  );
}
