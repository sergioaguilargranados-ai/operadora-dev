// Build: 03 Jun 2026 - 17:00 CST - v2.342

'use client';

import { useState } from 'react';
import { VueloUnificado } from '@/types/unified-travel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FlightSearchForm() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [pasajerosAdultos, setPasajerosAdultos] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<VueloUnificado[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultados([]);

    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origenIata: origen.toUpperCase(),
          destinoIata: destino.toUpperCase(),
          fechaSalida: fechaSalida,
          pasajeros: {
            adultos: pasajerosAdultos,
            ninos: 0,
            bebes: 0
          }
        })
      });

      const data = await res.json();

      if (!res.ok || !data.exito) {
        throw new Error(data.error || data.errores?.[0] || 'Error al buscar vuelos');
      }

      setResultados(data.resultados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-[#142A4A] mb-4">Buscar Vuelos</h2>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origen">Origen (IATA)</Label>
            <Input id="origen" placeholder="Ej: MEX" value={origen} onChange={(e) => setOrigen(e.target.value)} required maxLength={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destino">Destino (IATA)</Label>
            <Input id="destino" placeholder="Ej: CUN" value={destino} onChange={(e) => setDestino(e.target.value)} required maxLength={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaSalida">Fecha Salida</Label>
            <Input id="fechaSalida" type="date" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pasajeros">Adultos</Label>
            <Input id="pasajeros" type="number" min="1" max="9" value={pasajerosAdultos} onChange={(e) => setPasajerosAdultos(parseInt(e.target.value))} required />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <Button type="submit" disabled={loading} className="bg-[#142A4A] text-white hover:bg-opacity-90">
              {loading ? 'Buscando...' : 'Buscar Vuelos'}
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {resultados.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Resultados encontrados: {resultados.length}</h3>
          <div className="grid gap-4">
            {resultados.map((vuelo) => (
              <div key={vuelo.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
                <div>
                  <p className="font-bold">{vuelo.itinerarios[0].segmentos[0].aerolinea.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {vuelo.itinerarios[0].segmentos[0].origen.iataCode} ✈️ {vuelo.itinerarios[0].segmentos[0].destino.iataCode}
                  </p>
                  <p className="text-xs text-gray-500">Proveedor: {vuelo.proveedor}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {vuelo.precioTotal.toLocaleString('es-MX', { style: 'currency', currency: vuelo.moneda })}
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 border-[#D4AF37] text-[#D4AF37]">
                    Seleccionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
