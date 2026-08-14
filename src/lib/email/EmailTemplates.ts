export interface EmailTemplateProps {
  title: string;
  bannerText: string;
  content: string; // HTML string for paragraphs
  detailsGrid?: Array<{ label: string; value: string }>;
  ctaText?: string;
  ctaUrl?: string;
}

export function generateInstitutionalEmailHtml(props: EmailTemplateProps): string {
  const { title, bannerText, content, detailsGrid, ctaText, ctaUrl } = props;
  
  const detailsHtml = detailsGrid && detailsGrid.length > 0
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-collapse: collapse;">
        <tr>
          <td style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailsGrid.reduce((acc, curr, index) => {
                if (index % 2 === 0) acc += '<tr>';
                acc += `
                  <td width="50%" style="padding: 10px 0; vertical-align: top;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${curr.label}</div>
                    <div style="font-size: 15px; color: #0f172a; font-weight: 600; margin-top: 4px;">${curr.value}</div>
                  </td>
                `;
                if (index % 2 !== 0 || index === detailsGrid.length - 1) {
                    if (index % 2 === 0) acc += '<td width="50%"></td>';
                    acc += '</tr>';
                }
                return acc;
              }, '')}
            </table>
          </td>
        </tr>
      </table>
    `
    : '';

  const ctaHtml = ctaText && ctaUrl
    ? `
      <div style="text-align: center; margin-top: 30px;">
        <a href="${ctaUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; width: 100%; box-sizing: border-box; text-align: center;">${ctaText}</a>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header (Logo) -->
          <tr>
            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; color: #0f172a; font-size: 20px; font-weight: 800; letter-spacing: 1px;">AS OPERADORA DE VIAJES Y EVENTOS</h1>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td align="center" style="background-color: #0f172a; padding: 30px 20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <div style="background-color: #ffffff; width: 48px; height: 48px; border-radius: 50%; display: inline-block; text-align: center; line-height: 48px;">
                      <span style="color: #0f172a; font-size: 24px;">✓</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">${bannerText}</h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="color: #334155; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
              
              ${detailsHtml}
              
              ${ctaHtml}
            </td>
          </tr>

          <!-- Contact Sidebar/Widget (Horizontal for email compatibility) -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" align="center" style="padding: 10px;">
                    <div style="font-size: 20px; margin-bottom: 8px;">📞</div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 600;">TELÉFONO</div>
                    <div style="font-size: 14px; color: #0f172a; margin-top: 4px;">55 1234 5678</div>
                  </td>
                  <td width="33%" align="center" style="padding: 10px;">
                    <div style="font-size: 20px; margin-bottom: 8px;">✉️</div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 600;">EMAIL</div>
                    <div style="font-size: 14px; color: #0f172a; margin-top: 4px;">reservas@asviajesyeventos.com</div>
                  </td>
                  <td width="33%" align="center" style="padding: 10px;">
                    <div style="font-size: 20px; margin-bottom: 8px;">🕒</div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 600;">HORARIOS</div>
                    <div style="font-size: 14px; color: #0f172a; margin-top: 4px;">Lun a Vie 9:00 a 18:00 h</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0f172a; padding: 30px 20px; color: #94a3b8;">
              <div style="margin-bottom: 15px;">
                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 10px;">LinkedIn</a> | 
                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Facebook</a> | 
                <a href="#" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Instagram</a>
              </div>
              <div style="font-size: 13px; line-height: 1.5; margin-bottom: 15px;">
                Av. Insurgentes Sur 1234, Piso 5<br>
                Col. Del Valle, Benito Juárez<br>
                C.P. 03100, CDMX
              </div>
              <div>
                <a href="https://www.asviajesyeventos.com" style="color: #38bdf8; text-decoration: none; font-size: 14px; font-weight: 600;">www.asviajesyeventos.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
