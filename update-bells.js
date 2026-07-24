const fs = require('fs');
const path = require('path');

const files = [
  'src/app/mobile/itinerario/[id]/page.tsx',
  'src/app/mobile/pagos/page.tsx',
  'src/app/mobile/perfil/page.tsx',
  'src/app/mobile/rewards/page.tsx',
  'src/app/mobile/tienda/page.tsx',
  'src/app/mobile/viajes-grupales/page.tsx',
  'src/app/mobile/wishlist/page.tsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes('<Bell ') && !content.includes('NotificationBell')) {
    content = content.replace(/import {([^}]*?)Bell([^}]*?)} from ['"]lucide-react['"];?/, (match) => {
      return match + '\nimport NotificationBell from "@/components/mobile/NotificationBell"';
    });
    content = content.replace(/<Bell className=(['"][^'"]*['"]) \/>/g, '<NotificationBell className=$1 />');
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + f);
  }
});
