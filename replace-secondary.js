const fs = require('fs');
const path = require('path');

const clientLayout = path.join(__dirname, 'src', 'app', 'mobile', 'ClientLayout.tsx');
let cl = fs.readFileSync(clientLayout, 'utf8');
cl = cl.replace(/text-yellow-500/g, 'text-brand-primary');
fs.writeFileSync(clientLayout, cl, 'utf8');

const mobilePage = path.join(__dirname, 'src', 'app', 'mobile', 'page.tsx');
let mp = fs.readFileSync(mobilePage, 'utf8');
mp = mp.replace(/className="w-12 h-12 bg-black text-white rounded-xl/g, 'className="w-12 h-12 bg-brand-primary text-white rounded-xl');
mp = mp.replace(/className="bg-black text-white px-5 pt-12 pb-6/g, 'className="bg-brand-primary text-white px-5 pt-12 pb-6');
mp = mp.replace(/className="w-full bg-black text-white/g, 'className="w-full bg-brand-primary text-white');
mp = mp.replace(/hover:bg-gray-800 active:scale-\[0.98\] transition-all font-bold text-sm"/g, 'hover:bg-brand-primary-hover active:scale-[0.98] transition-all font-bold text-sm"');
fs.writeFileSync(mobilePage, mp, 'utf8');

const viajesGrupales = path.join(__dirname, 'src', 'app', 'mobile', 'viajes-grupales', 'page.tsx');
let vg = fs.readFileSync(viajesGrupales, 'utf8');
vg = vg.replace(/bg-black text-white hover:bg-gray-800/g, 'bg-brand-primary text-white hover:bg-brand-primary-hover');
fs.writeFileSync(viajesGrupales, vg, 'utf8');

console.log("Secondary replacements complete");
