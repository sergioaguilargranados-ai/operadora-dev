/**
 * API ENDPOINT - CRON JOBS
 * Ejecuta los cron jobs de recordatorios de correo
 * 
 * Este endpoint debe ser llamado periódicamente por:
 * - Vercel Cron (vercel.json)
 * - Cron job del sistema
 * - Servicio externo como cron-job.org
 * 
 * Seguridad: Requiere un token secreto para evitar ejecuciones no autorizadas
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllEmailCronJobs } from '@/cron/email-reminders';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    try {
        // ========== AUTENTICACIÓN ==========
        // Permite ejecución si:
        // 1. Viene de un Cron con Header `Authorization: Bearer <CRON_SECRET>` o x-cron-secret
        // 2. Viene de un usuario Administrador autenticado (Cookie o Header JWT)
        const authHeader = request.headers.get('authorization');
        const xCronSecret = request.headers.get('x-cron-secret');
        const cronSecret = process.env.CRON_SECRET;

        let isAuthorized = false;
        if (cronSecret && (authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret)) {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            const adminAuth = await verifyAdminAuth(request);
            if (adminAuth.authorized) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized && process.env.NODE_ENV !== 'production' && !cronSecret) {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            return NextResponse.json({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        // Ejecutar cron jobs
        console.log('🚀 Ejecutando cron jobs desde API...');
        const results = await runAllEmailCronJobs();

        return NextResponse.json({
            success: true,
            message: 'Cron jobs ejecutados exitosamente',
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error ejecutando cron jobs:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

// También permitir POST para mayor flexibilidad
export async function POST(request: NextRequest) {
    return GET(request);
}
