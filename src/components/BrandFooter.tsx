// BrandFooter.tsx - Footer dinámico con branding del tenant actual
// Build: 25 Jun 2026 - v2.356 - Marca Blanca Completa y Secciones Parametrizadas PWA

'use client';

import Link from 'next/link';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';
import { Logo } from './Logo';
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton';

/**
 * Footer con branding dinámico.
 * En modo white-label muestra el nombre, contacto y links del tenant.
 * En modo default muestra AS Operadora.
 */
export function BrandFooter() {
    const {
        companyName,
        footerText,
        supportEmail,
        supportPhone,
        termsUrl,
        privacyUrl,
        facebookUrl,
        instagramUrl,
        isWhiteLabel,
    } = useWhiteLabel();

    return (
        <footer className="bg-[#F7F7F7] mt-16 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="font-semibold mb-4">Empresa</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/empresa/acerca-de" className="hover:text-foreground">Acerca de</Link></li>
                            <li><Link href="/empresa/empleos" className="hover:text-foreground">Empleos</Link></li>
                            <li><Link href="/empresa/prensa" className="hover:text-foreground">Prensa</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Ayuda</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/ayuda" className="hover:text-foreground">Centro de ayuda</Link></li>
                            <li><Link href="/contacto" className="hover:text-foreground">Contáctanos</Link></li>
                            {privacyUrl ? (
                                <li><a href={privacyUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Privacidad</a></li>
                            ) : (
                                <li><Link href="/legal/privacidad" className="hover:text-foreground">Privacidad</Link></li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Términos</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {termsUrl ? (
                                <li><a href={termsUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Términos de uso</a></li>
                            ) : (
                                <li><Link href="/legal/terminos" className="hover:text-foreground">Términos de uso</Link></li>
                            )}
                            <li><Link href="/legal/cookies" className="hover:text-foreground">Política de cookies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {supportEmail && (
                                <li><a href={`mailto:${supportEmail}`} className="hover:text-foreground">{supportEmail}</a></li>
                            )}
                            {supportPhone && (
                                <li><a href={`tel:${supportPhone.replace(/\s/g, '')}`} className="hover:text-foreground">{supportPhone}</a></li>
                            )}
                            {facebookUrl && (
                                <li><a href={facebookUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                            )}
                            {instagramUrl && (
                                <li><a href={instagramUrl} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            )}
                            {!facebookUrl && !instagramUrl && (
                                <>
                                    <li><a href="#" className="hover:text-foreground">Facebook</a></li>
                                    <li><a href="#" className="hover:text-foreground">Instagram</a></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="border-t pt-8 text-sm text-muted-foreground text-center flex flex-col items-center">
                    <p>{footerText}</p>
                    {isWhiteLabel && (
                        <p className="text-xs mt-2 opacity-60">
                            Powered by <Logo forceDefault size="sm" className="inline-flex ml-1" />
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-4 mt-2">
                        <Link href="/creditos-fotograficos" className="text-xs opacity-70 hover:opacity-100 hover:underline">
                            Créditos fotográficos
                        </Link>
                        <p className="text-xs opacity-50">|</p>
                        <p className="text-xs opacity-50">
                            v2.396 | 14 Jul 2026 23:45 CST
                        </p>
                        <PwaInstallButton />
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default BrandFooter;
