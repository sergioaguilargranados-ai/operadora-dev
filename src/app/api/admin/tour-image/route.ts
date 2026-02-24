// API para gestionar imágenes de tours manualmente
// Build: 24 Feb 2026 - v2.329
// Permite:
//   GET  ?code=MT-XXXXX        → Ver estado actual de imagen del tour
//   POST ?code=MT-XXXXX        → Establecer imagen manualmente (body: { imageUrl: "..." })
//   POST ?code=MT-XXXXX&clear  → Limpiar imagen (dejar en null para re-scrape)

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * GET /api/admin/tour-image?code=MT-60968
 * Muestra estado actual de imagen del tour
 * 
 * GET /api/admin/tour-image?missing=true
 * Lista todos los tours SIN imagen principal
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const showMissing = searchParams.get('missing') === 'true';

        // Modo: listar tours sin imagen
        if (showMissing) {
            const result = await pool.query(`
                SELECT mt_code, name, destination_region, main_country, 
                       main_image, gallery_images, mt_url, days, nights
                FROM megatravel_packages 
                WHERE is_active = true AND (main_image IS NULL OR main_image = '')
                ORDER BY name
            `);

            return NextResponse.json({
                success: true,
                count: result.rows.length,
                tours: result.rows.map(t => ({
                    code: t.mt_code,
                    name: t.name,
                    region: t.destination_region,
                    country: t.main_country,
                    hasGallery: (t.gallery_images || []).length > 0,
                    galleryCount: (t.gallery_images || []).length,
                    galleryImages: (t.gallery_images || []).slice(0, 3), // Primeras 3 para preview
                    mtUrl: t.mt_url,
                    days: t.days,
                    nights: t.nights
                }))
            });
        }

        // Modo: ver tour específico
        if (!code) {
            return NextResponse.json({
                success: false,
                error: 'Parámetro ?code= requerido, o usa ?missing=true para ver tours sin imagen',
                examples: [
                    'GET /api/admin/tour-image?code=MT-60968',
                    'GET /api/admin/tour-image?missing=true',
                    'POST /api/admin/tour-image?code=MT-60968 con body { "imageUrl": "https://..." }',
                    'POST /api/admin/tour-image?code=MT-60968&clear=true'
                ]
            }, { status: 400 });
        }

        const result = await pool.query(`
            SELECT mt_code, name, main_image, gallery_images, map_image, 
                   destination_region, mt_url
            FROM megatravel_packages WHERE mt_code = $1
        `, [code]);

        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: `Tour ${code} no encontrado`
            }, { status: 404 });
        }

        const tour = result.rows[0];
        const gallery: string[] = tour.gallery_images || [];

        // Detectar si la imagen actual es genérica
        const genericPatterns = [
            'europa', 'asia', 'turquia', 'japon', 'corea', 'medio-oriente',
            'dubai', 'egipto', 'sudamerica', 'usa-', 'canada', 'cruceros',
            'africa', 'mexico', 'balcanes', 'centroamerica', 'caribe',
            'bellezasde', 'banner-mega'
        ];
        const isGeneric = tour.main_image
            ? genericPatterns.some(p => tour.main_image.toLowerCase().includes(p))
            : false;

        return NextResponse.json({
            success: true,
            tour: {
                code: tour.mt_code,
                name: tour.name,
                region: tour.destination_region,
                mainImage: tour.main_image,
                isGenericImage: isGeneric,
                hasImage: !!tour.main_image,
                gallery: gallery.slice(0, 5),
                galleryCount: gallery.length,
                mapImage: tour.map_image,
                mtUrl: tour.mt_url
            },
            actions: {
                setImage: `POST /api/admin/tour-image?code=${code} con body { "imageUrl": "https://..." }`,
                clearImage: `POST /api/admin/tour-image?code=${code}&clear=true`,
                useGallery: gallery.length > 0
                    ? `POST /api/admin/tour-image?code=${code} con body { "imageUrl": "${gallery[0]}" }`
                    : 'No hay imágenes en galería'
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/tour-image?code=MT-60968
 * Body: { "imageUrl": "https://example.com/image.jpg" }
 * 
 * POST /api/admin/tour-image?code=MT-60968&clear=true
 * Limpia la imagen (establece null)
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const clear = searchParams.get('clear') === 'true';

        if (!code) {
            return NextResponse.json({
                success: false,
                error: 'Parámetro ?code= requerido'
            }, { status: 400 });
        }

        // Verificar que el tour existe
        const checkResult = await pool.query(
            'SELECT mt_code, name, main_image FROM megatravel_packages WHERE mt_code = $1',
            [code]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: `Tour ${code} no encontrado`
            }, { status: 404 });
        }

        const previousImage = checkResult.rows[0].main_image;

        if (clear) {
            // Limpiar imagen → null
            await pool.query(
                'UPDATE megatravel_packages SET main_image = NULL, updated_at = NOW() WHERE mt_code = $1',
                [code]
            );

            console.log(`🖼️ Imagen limpiada para ${code}: ${previousImage} → NULL`);

            return NextResponse.json({
                success: true,
                message: `Imagen de ${code} limpiada (establecida a null)`,
                previousImage,
                currentImage: null
            });
        }

        // Establecer imagen manualmente
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({
                success: false,
                error: 'Body JSON requerido: { "imageUrl": "https://..." }'
            }, { status: 400 });
        }

        const { imageUrl } = body;

        if (!imageUrl || typeof imageUrl !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'Campo "imageUrl" requerido en el body'
            }, { status: 400 });
        }

        // Validar que sea una URL válida
        try {
            new URL(imageUrl);
        } catch {
            return NextResponse.json({
                success: false,
                error: 'URL de imagen no válida'
            }, { status: 400 });
        }

        // Actualizar la imagen
        await pool.query(
            'UPDATE megatravel_packages SET main_image = $1, updated_at = NOW() WHERE mt_code = $2',
            [imageUrl, code]
        );

        console.log(`🖼️ Imagen actualizada para ${code}: ${previousImage} → ${imageUrl}`);

        return NextResponse.json({
            success: true,
            message: `Imagen de ${code} actualizada exitosamente`,
            previousImage,
            currentImage: imageUrl,
            tourName: checkResult.rows[0].name
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
