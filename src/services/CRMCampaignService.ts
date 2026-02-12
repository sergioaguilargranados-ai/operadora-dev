/**
 * CRM Email Campaign Service
 * 
 * Templates de email personalizados para el CRM:
 * - Seguimiento de leads
 * - Envío de cotizaciones
 * - Nurturing campañas
 * - Post-viaje / feedback
 * - Ofertas especiales
 * - Re-engagement
 * 
 * Integrado con EmailService existente (nodemailer)
 */

import { query } from '@/lib/db'
import { emailService } from './EmailService'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

interface CampaignContact {
    id: number
    full_name: string
    email: string
    interested_destination?: string
    travel_dates_start?: string
    num_travelers?: number
    budget_max?: number
    pipeline_stage: string
    lead_score: number
    travel_type?: string
    source?: string
}

interface EmailTemplate {
    id: string
    name: string
    subject: string
    category: 'followup' | 'nurturing' | 'offer' | 'reengagement' | 'post_trip' | 'welcome'
    html: string
    variables: string[]
}

interface CampaignResult {
    template_id: string
    total_contacts: number
    sent: number
    failed: number
    errors: { contact_id: number; error: string }[]
}

// ═══════════════════════════════════════════
// TEMPLATES DE EMAIL
// ═══════════════════════════════════════════

const CRM_EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'welcome_lead',
        name: 'Bienvenida a nuevo lead',
        subject: '¡Bienvenido a AS Operadora, {{nombre}}! ✈️',
        category: 'welcome',
        variables: ['nombre', 'destino', 'agente'],
        html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#0066FF,#4F46E5);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">✈️ AS Operadora</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Tu viaje comienza aquí</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a1a;margin:0 0 16px;">¡Hola {{nombre}}! 👋</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Gracias por tu interés en viajar con nosotros. Sabemos que planear un viaje puede ser abrumador,
            pero estamos aquí para hacerlo fácil y emocionante.
          </p>
          {{#if destino}}
          <div style="background:#F0F7FF;border-left:4px solid #0066FF;padding:16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#0066FF;font-weight:600;">🌎 Tu destino de interés: {{destino}}</p>
            <p style="margin:8px 0 0;color:#666;font-size:13px;">Nuestro equipo ya está buscando las mejores opciones para ti.</p>
          </div>
          {{/if}}
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Un asesor de viajes se pondrá en contacto contigo muy pronto para ayudarte a diseñar
            la experiencia perfecta.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://asoperadora.com" style="background:#0066FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Explorar destinos
            </a>
          </div>
        </div>
        <div style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;text-align:center;">
            AS Operadora | +52 720 815 6804 | info@asoperadora.com
          </p>
        </div>
      </div>
    `,
    },
    {
        id: 'followup_quote',
        name: 'Seguimiento de cotización',
        subject: '{{nombre}}, tu cotización para {{destino}} te espera 📋',
        category: 'followup',
        variables: ['nombre', 'destino', 'precio', 'viajeros', 'fechas', 'agente'],
        html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#059669,#10B981);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">📋 Tu cotización está lista</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a1a;margin:0 0 16px;">Hola {{nombre}},</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Te preparamos una cotización especial para tu viaje a <strong>{{destino}}</strong>.
            Queríamos asegurarnos de que la hayas recibido.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:20px;margin:20px 0;border-radius:12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#666;font-size:13px;">🌎 Destino</td><td style="text-align:right;font-weight:600;color:#1a1a1a;">{{destino}}</td></tr>
              {{#if viajeros}}<tr><td style="padding:6px 0;color:#666;font-size:13px;">👥 Viajeros</td><td style="text-align:right;font-weight:600;color:#1a1a1a;">{{viajeros}}</td></tr>{{/if}}
              {{#if fechas}}<tr><td style="padding:6px 0;color:#666;font-size:13px;">📅 Fechas</td><td style="text-align:right;font-weight:600;color:#1a1a1a;">{{fechas}}</td></tr>{{/if}}
              {{#if precio}}<tr style="border-top:1px solid #ddd;"><td style="padding:10px 0 6px;color:#666;font-size:13px;">💰 Precio total</td><td style="text-align:right;font-weight:700;color:#059669;font-size:18px;">{{precio}}</td></tr>{{/if}}
            </table>
          </div>
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Los precios pueden variar según disponibilidad. Te recomendamos confirmar pronto
            para asegurar las mejores tarifas.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://asoperadora.com" style="background:#059669;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Ver mi cotización
            </a>
          </div>
          <p style="color:#888;font-size:13px;text-align:center;">
            ¿Tienes dudas? Responde a este correo o llámanos al +52 720 815 6804
          </p>
        </div>
        <div style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;text-align:center;">AS Operadora | Tu agencia de confianza</p>
        </div>
      </div>
    `,
    },
    {
        id: 'special_offer',
        name: 'Oferta especial',
        subject: '🔥 {{nombre}}, tenemos una oferta especial para {{destino}}',
        category: 'offer',
        variables: ['nombre', 'destino', 'descuento', 'fecha_limite', 'precio_original', 'precio_oferta'],
        html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#DC2626,#EF4444);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;">🔥 OFERTA ESPECIAL</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;">Solo por tiempo limitado</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a1a;margin:0 0 16px;">¡{{nombre}}!</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Tenemos una oferta exclusiva para tu viaje a <strong>{{destino}}</strong>
            que no querrás perderte.
          </p>
          <div style="background:#FEF2F2;border:2px solid #FECACA;padding:24px;margin:20px 0;border-radius:12px;text-align:center;">
            {{#if descuento}}<div style="font-size:40px;font-weight:800;color:#DC2626;">{{descuento}}% OFF</div>{{/if}}
            {{#if precio_original}}<div style="color:#999;font-size:14px;text-decoration:line-through;margin-top:8px;">Antes: {{precio_original}}</div>{{/if}}
            {{#if precio_oferta}}<div style="color:#DC2626;font-size:24px;font-weight:700;">Ahora: {{precio_oferta}}</div>{{/if}}
            {{#if fecha_limite}}<div style="background:#DC2626;color:#fff;padding:8px 16px;border-radius:20px;display:inline-block;margin-top:12px;font-size:12px;font-weight:600;">⏰ Válido hasta: {{fecha_limite}}</div>{{/if}}
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://asoperadora.com" style="background:#DC2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;font-size:16px;">
              ¡Quiero esta oferta!
            </a>
          </div>
        </div>
        <div style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;text-align:center;">AS Operadora | +52 720 815 6804</p>
        </div>
      </div>
    `,
    },
    {
        id: 'reengagement',
        name: 'Re-engagement (hace tiempo sin contacto)',
        subject: '{{nombre}}, te extrañamos ✈️ ¡Tenemos novedades!',
        category: 'reengagement',
        variables: ['nombre', 'destino', 'agente'],
        html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#7C3AED,#8B5CF6);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Te extrañamos, {{nombre}} 💜</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Ha pasado un tiempo desde la última vez que platicamos sobre tu viaje.
            Queremos que sepas que seguimos aquí para ayudarte.
          </p>
          {{#if destino}}
          <p style="color:#555;line-height:1.6;font-size:15px;">
            ¿Sigues interesado en <strong>{{destino}}</strong>? Tenemos nuevas opciones
            y precios actualizados que podrían interesarte.
          </p>
          {{/if}}
          <div style="background:#F5F3FF;border:1px solid #DDD6FE;padding:20px;margin:20px 0;border-radius:12px;">
            <p style="margin:0;color:#7C3AED;font-weight:600;font-size:15px;">✨ ¿Qué hay de nuevo?</p>
            <ul style="color:#666;font-size:14px;line-height:1.8;padding-left:20px;">
              <li>Destinos exclusivos de temporada</li>
              <li>Paquetes todo incluido desde $8,999</li>
              <li>Meses sin intereses en pagos</li>
              <li>Seguro de viaje incluido</li>
            </ul>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://asoperadora.com" style="background:#7C3AED;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Ver novedades
            </a>
          </div>
          <p style="color:#888;font-size:13px;text-align:center;">
            Simplemente responde este correo y te atenderemos encantados.
          </p>
        </div>
        <div style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;text-align:center;">AS Operadora | Tu agencia de confianza</p>
        </div>
      </div>
    `,
    },
    {
        id: 'post_trip_feedback',
        name: 'Feedback post-viaje',
        subject: '{{nombre}}, ¿cómo estuvo tu viaje a {{destino}}? ⭐',
        category: 'post_trip',
        variables: ['nombre', 'destino'],
        html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#F59E0B,#EAB308);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">⭐ ¿Cómo estuvo tu viaje?</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a1a;margin:0 0 16px;">Hola {{nombre}},</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Esperamos que hayas disfrutado tu viaje a <strong>{{destino}}</strong>.
            Tu opinión es muy importante para nosotros.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <p style="color:#666;font-size:14px;margin-bottom:12px;">¿Cómo calificarías tu experiencia?</p>
            <div style="font-size:32px;">
              <a href="#" style="text-decoration:none;">⭐</a>
              <a href="#" style="text-decoration:none;">⭐</a>
              <a href="#" style="text-decoration:none;">⭐</a>
              <a href="#" style="text-decoration:none;">⭐</a>
              <a href="#" style="text-decoration:none;">⭐</a>
            </div>
          </div>
          <div style="background:#FFFBEB;border:1px solid #FDE68A;padding:20px;margin:20px 0;border-radius:12px;text-align:center;">
            <p style="margin:0;color:#B45309;font-weight:600;">🎁 ¿Conoces a alguien que quiera viajar?</p>
            <p style="margin:8px 0 0;color:#666;font-size:13px;">
              Recomiéndanos y obtén <strong>5% de descuento</strong> en tu próximo viaje por cada referido.
            </p>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://asoperadora.com" style="background:#F59E0B;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Dejar mi opinión
            </a>
          </div>
        </div>
        <div style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;text-align:center;">AS Operadora | +52 720 815 6804</p>
        </div>
      </div>
    `,
    },
    {
        id: 'nurturing_tips',
        name: 'Tips de viaje (nurturing)',
        subject: '{{nombre}}, 5 tips para tu viaje a {{destino}} 🌴',
        category: 'nurturing',
        variables: ['nombre', 'destino'],
        html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#0891B2,#06B6D4);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">🌴 Tips para tu viaje</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a1a1a;margin:0 0 16px;">Hola {{nombre}},</h2>
          <p style="color:#555;line-height:1.6;font-size:15px;">
            Mientras planeas tu viaje a <strong>{{destino}}</strong>, te compartimos
            algunos tips que te serán muy útiles:
          </p>
          <div style="margin:20px 0;">
            <div style="padding:12px 16px;border-left:3px solid #0891B2;margin-bottom:12px;background:#F0FDFA;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-weight:600;color:#0891B2;font-size:14px;">1. 📱 Documentos digitales</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">Lleva copias digitales de tu pasaporte, reservas y seguro de viaje.</p>
            </div>
            <div style="padding:12px 16px;border-left:3px solid #0891B2;margin-bottom:12px;background:#F0FDFA;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-weight:600;color:#0891B2;font-size:14px;">2. 💳 Pagos</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">Avisa a tu banco que viajarás para evitar bloqueos en tu tarjeta.</p>
            </div>
            <div style="padding:12px 16px;border-left:3px solid #0891B2;margin-bottom:12px;background:#F0FDFA;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-weight:600;color:#0891B2;font-size:14px;">3. 🏨 Check-in anticipado</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">Haz tu check-in online 24h antes para elegir el mejor asiento.</p>
            </div>
            <div style="padding:12px 16px;border-left:3px solid #0891B2;margin-bottom:12px;background:#F0FDFA;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-weight:600;color:#0891B2;font-size:14px;">4. 🧳 Equipaje</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">Revisa restricciones de equipaje y empaca lo esencial primero.</p>
            </div>
            <div style="padding:12px 16px;border-left:3px solid #0891B2;background:#F0FDFA;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-weight:600;color:#0891B2;font-size:14px;">5. 📞 Contacto de emergencia</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">Guarda nuestro número: +52 720 815 6804. Estamos 24/7 para ti.</p>
            </div>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="https://asoperadora.com" style="background:#0891B2;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
              Ver más tips
            </a>
          </div>
        </div>
        <div style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;text-align:center;">AS Operadora | Tu agencia de confianza</p>
        </div>
      </div>
    `,
    },
]

// ═══════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════

class CRMCampaignService {

    /**
     * Obtener todos los templates disponibles
     */
    getTemplates(): Omit<EmailTemplate, 'html'>[] {
        return CRM_EMAIL_TEMPLATES.map(t => ({
            id: t.id,
            name: t.name,
            subject: t.subject,
            category: t.category,
            variables: t.variables,
        }))
    }

    /**
     * Obtener template con preview renderizado
     */
    getTemplatePreview(templateId: string, variables: Record<string, string>): { subject: string; html: string } | null {
        const template = CRM_EMAIL_TEMPLATES.find(t => t.id === templateId)
        if (!template) return null

        return {
            subject: this.interpolate(template.subject, variables),
            html: this.interpolate(template.html, variables),
        }
    }

    /**
     * Enviar campaña a un grupo de contactos
     */
    async sendCampaign(
        templateId: string,
        contactIds: number[],
        customVariables?: Record<string, string>
    ): Promise<CampaignResult> {
        const template = CRM_EMAIL_TEMPLATES.find(t => t.id === templateId)
        if (!template) throw new Error(`Template ${templateId} no encontrado`)

        const result: CampaignResult = {
            template_id: templateId,
            total_contacts: contactIds.length,
            sent: 0,
            failed: 0,
            errors: [],
        }

        // Obtener datos de contactos
        const contacts = await query(`
      SELECT id, full_name, email, interested_destination,
             travel_dates_start, num_travelers, budget_max,
             pipeline_stage, lead_score, travel_type
      FROM crm_contacts
      WHERE id = ANY($1) AND email IS NOT NULL AND status = 'active'
    `, [contactIds])

        for (const contact of contacts.rows as CampaignContact[]) {
            try {
                const variables: Record<string, string> = {
                    nombre: contact.full_name.split(' ')[0],
                    nombre_completo: contact.full_name,
                    email: contact.email,
                    destino: contact.interested_destination || 'tu próximo destino',
                    viajeros: contact.num_travelers ? String(contact.num_travelers) : '',
                    fechas: contact.travel_dates_start
                        ? new Date(contact.travel_dates_start).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '',
                    precio: contact.budget_max ? `$${Math.round(contact.budget_max).toLocaleString('es-MX')} MXN` : '',
                    ...customVariables,
                }

                const renderedSubject = this.interpolate(template.subject, variables)
                const renderedHtml = this.interpolate(template.html, variables)

                const sent = await emailService.sendEmail({
                    to: contact.email,
                    subject: renderedSubject,
                    html: renderedHtml,
                })

                if (sent) {
                    result.sent++

                    // Registrar interacción en CRM
                    await query(`
            INSERT INTO crm_interactions (contact_id, interaction_type, subject, notes, channel, is_automated, created_at)
            VALUES ($1, 'email', $2, $3, 'email', true, NOW())
          `, [contact.id, renderedSubject, `Campaña: ${template.name}`])
                } else {
                    result.failed++
                    result.errors.push({ contact_id: contact.id, error: 'Error enviando email' })
                }
            } catch (err) {
                result.failed++
                result.errors.push({ contact_id: contact.id, error: (err as Error).message })
            }
        }

        return result
    }

    /**
     * Enviar email individual a un contacto
     */
    async sendToContact(
        templateId: string,
        contactId: number,
        customVariables?: Record<string, string>
    ): Promise<boolean> {
        const result = await this.sendCampaign(templateId, [contactId], customVariables)
        return result.sent > 0
    }

    /**
     * Obtener candidatos para re-engagement (sin contacto > 14 días)
     */
    async getReengagementCandidates(limit = 50): Promise<CampaignContact[]> {
        const result = await query(`
      SELECT c.id, c.full_name, c.email, c.interested_destination,
             c.travel_dates_start, c.num_travelers, c.budget_max,
             c.pipeline_stage, c.lead_score, c.travel_type
      FROM crm_contacts c
      WHERE c.status = 'active'
        AND c.email IS NOT NULL
        AND c.pipeline_stage NOT IN ('won', 'lost')
        AND NOT EXISTS (
          SELECT 1 FROM crm_interactions i
          WHERE i.contact_id = c.id AND i.created_at >= NOW() - INTERVAL '14 days'
        )
      ORDER BY c.lead_score DESC
      LIMIT $1
    `, [limit])
        return result.rows as CampaignContact[]
    }

    /**
     * Obtener candidatos post-viaje
     */
    async getPostTripCandidates(limit = 50): Promise<CampaignContact[]> {
        const result = await query(`
      SELECT id, full_name, email, interested_destination,
             travel_dates_start, num_travelers, budget_max,
             pipeline_stage, lead_score, travel_type
      FROM crm_contacts
      WHERE status = 'active'
        AND email IS NOT NULL
        AND pipeline_stage IN ('post_trip', 'won', 'traveling')
        AND travel_dates_end IS NOT NULL
        AND travel_dates_end < NOW()
      ORDER BY travel_dates_end DESC
      LIMIT $1
    `, [limit])
        return result.rows as CampaignContact[]
    }

    // ═══════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════

    private interpolate(template: string, variables: Record<string, string>): string {
        let result = template

        // Reemplazar {{variable}}
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '')
        }

        // Procesar condicionales {{#if variable}}...{{/if}}
        result = result.replace(
            /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
            (_, varName, content) => {
                return variables[varName] && variables[varName].trim() ? content : ''
            }
        )

        // Limpiar variables no resueltas
        result = result.replace(/\{\{[\w]+\}\}/g, '')

        return result
    }
}

export const crmCampaignService = new CRMCampaignService()
