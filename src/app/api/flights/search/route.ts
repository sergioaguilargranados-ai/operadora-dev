// Build: 03 Jun 2026 - 16:30 CST - v2.342

import { NextResponse } from 'next/server';
import { FlightAggregator } from '@/services/aggregators/FlightAggregator';
import { ParametrosBusquedaVuelo } from '@/types/providers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validación básica de los parámetros de entrada
    if (!body.origenIata || !body.destinoIata || !body.fechaSalida || !body.pasajeros) {
      return NextResponse.json({
        exito: false,
        error: 'Faltan parámetros requeridos: origenIata, destinoIata, fechaSalida, pasajeros'
      }, { status: 400 });
    }

    const params: ParametrosBusquedaVuelo = {
      origenIata: body.origenIata,
      destinoIata: body.destinoIata,
      fechaSalida: body.fechaSalida,
      fechaRegreso: body.fechaRegreso, // Opcional
      pasajeros: body.pasajeros,
      clase: body.clase
    };

    const agregador = new FlightAggregator();
    const resultado = await agregador.buscarVuelos(params);

    if (!resultado.exito) {
      return NextResponse.json(resultado, { status: 500 });
    }

    return NextResponse.json(resultado);

  } catch (error: any) {
    console.error('Error en API flights/search:', error);
    return NextResponse.json({
      exito: false,
      error: 'Error interno del servidor al procesar la búsqueda'
    }, { status: 500 });
  }
}
