import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, RefreshCw, Trash2, Plus, Star, Info, ChevronDown, ChevronUp } from "lucide-react";

export function DestinationContentManager({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/destinations/content');
      const data = await res.json();
      if (data.success && data.data) {
        setDestinations(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error cargando contenidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (city: string, country: string, force: boolean = false) => {
    if (!city || !country) {
      showToast('Ingresa ciudad y país', 'error');
      return;
    }
    
    try {
      setGenerating(true);
      const res = await fetch('/api/destinations/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, country, force })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('El servidor tardó demasiado en responder (Timeout) o hubo un error interno. Intenta de nuevo.');
      }
      
      if (data.success) {
        showToast(force ? 'Contenido regenerado exitosamente' : 'Contenido generado exitosamente', 'success');
        setNewCity('');
        setNewCountry('');
        loadDestinations();
      } else {
        showToast(data.error || 'Error al generar contenido', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error de conexión', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Motor de Contenido por Destino (IA)</h2>
          <p className="text-sm text-gray-500">
            Contenido turístico generado automáticamente con Gemini para su uso en los itinerarios de la PWA.
          </p>
        </div>
      </div>

      {/* Formulario para nuevo destino */}
      <Card className="p-5 border-blue-100 bg-blue-50/30">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-blue-600" />
          Generar nuevo destino
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Ciudad (ej. París)" 
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            className="bg-white"
          />
          <Input 
            placeholder="País (ej. Francia)" 
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            className="bg-white"
          />
          <Button 
            onClick={() => handleGenerate(newCity, newCountry, false)}
            disabled={generating || !newCity || !newCountry}
            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Generar con IA
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Esto buscará información de gastronomía, lugares, souvenirs, clima, moneda e idioma. Las imágenes se descargarán de Unsplash.
        </p>
      </Card>

      {/* Lista de destinos */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando destinos...</div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay contenido de destinos generado aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {destinations.map((dest) => (
            <Card key={dest.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {dest.hero_image_url ? (
                      <img src={dest.hero_image_url} alt={dest.city} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-6 h-6 text-gray-400 mx-auto mt-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{dest.city}</h3>
                    <p className="text-sm text-gray-500">{dest.country}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{dest.places?.length || 0} lugares</span>
                      <span>{dest.foods?.length || 0} comidas</span>
                      <span>{dest.souvenirs?.length || 0} souvenirs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerate(dest.city, dest.country, true)}
                    disabled={generating}
                    title="Regenerar contenido con IA"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setExpandedId(expandedId === dest.id ? null : dest.id)}
                  >
                    {expandedId === dest.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Contenido expandido */}
              {expandedId === dest.id && (
                <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Info Práctica */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      Información Práctica
                    </h4>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2 text-xs">
                      {dest.practical_info?.currency && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Moneda:</span>
                          <span className="font-medium text-gray-900">{dest.practical_info.currency.name} ({dest.practical_info.currency.symbol})</span>
                        </div>
                      )}
                      {dest.practical_info?.language && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Idioma:</span>
                          <span className="font-medium text-gray-900">{dest.practical_info.language.name}</span>
                        </div>
                      )}
                      {dest.practical_info?.climate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Clima:</span>
                          <span className="font-medium text-gray-900">{dest.practical_info.climate.type}</span>
                        </div>
                      )}
                      {dest.practical_info?.voltage && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Enchufes:</span>
                          <span className="font-medium text-gray-900">Tipo {dest.practical_info.voltage.plug_type}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lugares */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Lugares ({dest.places?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {dest.places?.map((place: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-100">
                          {place.img && <img src={place.img} className="w-8 h-8 rounded object-cover" alt={place.name} />}
                          <div className="text-xs">
                            <p className="font-medium text-gray-900">{place.name}</p>
                            <p className="text-gray-500 truncate w-32">{place.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comidas y Souvenirs */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-500" />
                      Gastronomía y Souvenirs
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {dest.foods?.map((food: any, idx: number) => (
                        <div key={`f-${idx}`} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-100">
                          {food.img && <img src={food.img} className="w-8 h-8 rounded object-cover" alt={food.name} />}
                          <div className="text-xs">
                            <p className="font-medium text-gray-900">{food.name}</p>
                            <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Comida</span>
                          </div>
                        </div>
                      ))}
                      {dest.souvenirs?.map((souv: any, idx: number) => (
                        <div key={`s-${idx}`} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-100">
                          {souv.img && <img src={souv.img} className="w-8 h-8 rounded object-cover" alt={souv.name} />}
                          <div className="text-xs">
                            <p className="font-medium text-gray-900">{souv.name}</p>
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Souvenir</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
