import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Video } from "lucide-react";

export function ExpoContentManager({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState({
    hero_video_url: '',
    hero_title: '',
    hero_subtitle: '',
    sections_json: [] as any[]
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await fetch('/api/expo/content');
      const data = await res.json();
      if (data.success && data.data) {
        setContent({
          hero_video_url: data.data.hero_video_url || '',
          hero_title: data.data.hero_title || '',
          hero_subtitle: data.data.hero_subtitle || '',
          sections_json: typeof data.data.sections_json === 'string' 
            ? JSON.parse(data.data.sections_json) 
            : (data.data.sections_json || [])
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Error cargando contenido Expo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/expo/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Contenido Expo guardado', 'success');
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

  const addSection = () => {
    setContent({
      ...content,
      sections_json: [...content.sections_json, { title: '', text: '', image_url: '' }]
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const newSections = [...content.sections_json];
    newSections[index][field] = value;
    setContent({ ...content, sections_json: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = [...content.sections_json];
    newSections.splice(index, 1);
    setContent({ ...content, sections_json: newSections });
  };

  if (loading) return <div>Cargando contenido Expo...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Video className="w-5 h-5" />
          Configuración Hero (Fondo de Video)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">URL del Video (mp4)</label>
            <Input 
              value={content.hero_video_url} 
              onChange={e => setContent({...content, hero_video_url: e.target.value})}
              placeholder="https://ejemplo.com/video.mp4"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Secciones de Contenido</h3>
          <Button onClick={addSection} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Sección
          </Button>
        </div>
        
        <div className="space-y-4">
          {content.sections_json.map((section, idx) => (
            <div key={idx} className="border p-4 rounded-md relative bg-gray-50">
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => removeSection(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-sm font-medium">Título de la sección</label>
                  <Input 
                    value={section.title} 
                    onChange={e => updateSection(idx, 'title', e.target.value)} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL de Imagen</label>
                  <Input 
                    value={section.image_url} 
                    onChange={e => updateSection(idx, 'image_url', e.target.value)} 
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Texto descriptivo</label>
                  <Textarea 
                    value={section.text} 
                    onChange={e => updateSection(idx, 'text', e.target.value)} 
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
          {content.sections_json.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No hay secciones configuradas. Añade una nueva sección.</p>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
