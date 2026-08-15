'use client'

import { useState } from 'react'
import {
  Settings, User, Bot, Palette, CreditCard, ShieldCheck, MapPin, Plus, Upload, Save
} from 'lucide-react'

export default function AgencyConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'detalles' | 'ai' | 'apariencia' | 'suscripcion' | 'pagos' | 'legal'>('detalles')
  
  const tabs = [
    { id: 'detalles', label: 'Detalles de cuenta', icon: User },
    { id: 'ai', label: 'AS AI', icon: Bot },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
    { id: 'suscripcion', label: 'Suscripción', icon: CreditCard },
    { id: 'pagos', label: 'Pagos', icon: Settings },
    { id: 'legal', label: 'Legal', icon: ShieldCheck },
  ] as const

  return (
    <div className="space-y-6">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuración de Agencia</h1>
          <p className="text-sm text-slate-500">Gestiona la información, apariencia y ajustes de tu agencia</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-700' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            
            {activeTab === 'detalles' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Detalles de la Agencia</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nombre Comercial</label>
                    <input type="text" defaultValue="Viajes El Mundo" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Representante Legal</label>
                    <input type="text" defaultValue="Juan Pérez" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Correo Electrónico de Contacto</label>
                    <input type="email" defaultValue="contacto@viajeselmundo.com" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Teléfono</label>
                    <input type="tel" defaultValue="+52 55 1234 5678" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Dirección Fiscal</label>
                    <input type="text" defaultValue="Av. Reforma 222, CDMX, México" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-slate-900">Sucursales</h3>
                    <button className="flex items-center gap-1.5 text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-200 font-medium">
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-2 font-medium">Nombre</th>
                          <th className="px-4 py-2 font-medium">Dirección</th>
                          <th className="px-4 py-2 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        <tr>
                          <td className="px-4 py-2">Matriz Sur</td>
                          <td className="px-4 py-2">Av. Insurgentes Sur 100</td>
                          <td className="px-4 py-2 text-blue-600 cursor-pointer hover:underline">Editar</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Sucursal Norte</td>
                          <td className="px-4 py-2">Vallejo 200</td>
                          <td className="px-4 py-2 text-blue-600 cursor-pointer hover:underline">Editar</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Configuración AS AI</h2>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-slate-700">Instrucciones de la Agencia (System Prompt)</label>
                      <span className="text-xs text-slate-400">124 / 2000 chars</span>
                    </div>
                    <textarea 
                      rows={5} 
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="Eres un asistente de ventas para Viajes El Mundo. Siempre sé cortés, usa un tono profesional pero entusiasta."
                    ></textarea>
                    <p className="text-xs text-slate-500">Estas instrucciones guiarán el comportamiento de la IA al responder a tus clientes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Modelo de IA Preferido</label>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>GPT-4o (Recomendado)</option>
                        <option>Claude 3.5 Sonnet</option>
                        <option>Gemini 1.5 Pro</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Idioma Principal</label>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>Español (México)</option>
                        <option>Inglés (US)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Zona Horaria</label>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>America/Mexico_City</option>
                        <option>America/Cancun</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 mt-6">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" /> Guardar Ajustes de IA
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'apariencia' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Apariencia y Marca Blanca</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logos */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Logo Principal</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 cursor-pointer transition-colors">
                        <Upload className="w-6 h-6 mb-2 text-slate-400" />
                        <span className="text-sm font-medium">Subir imagen</span>
                        <span className="text-xs">PNG, JPG hasta 2MB</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Favicon</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 cursor-pointer transition-colors">
                        <span className="text-sm font-medium">Subir icono</span>
                        <span className="text-xs">32x32px .ico o .png</span>
                      </div>
                    </div>
                  </div>

                  {/* Colors & Domain */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">Colores de Marca</label>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="w-8 h-8 rounded-md bg-blue-600 border border-slate-200 cursor-pointer"></div>
                          <span className="text-xs text-slate-500 mt-1 block text-center">Primario</span>
                        </div>
                        <div>
                          <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-200 cursor-pointer"></div>
                          <span className="text-xs text-slate-500 mt-1 block text-center">Secundario</span>
                        </div>
                        <div>
                          <div className="w-8 h-8 rounded-md bg-amber-500 border border-slate-200 cursor-pointer"></div>
                          <span className="text-xs text-slate-500 mt-1 block text-center">Acento</span>
                        </div>
                        <div>
                          <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 cursor-pointer"></div>
                          <span className="text-xs text-slate-500 mt-1 block text-center">Fondo</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 mt-4">
                      <label className="text-sm font-medium text-slate-700">Tipografía</label>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>Inter (Moderno)</option>
                        <option>Roboto (Clásico)</option>
                        <option>Playfair (Elegante)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Dominio Personalizado</label>
                      <input type="text" placeholder="ej. reservas.mia-agencia.com" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Remitente Email (Sender Custom)</label>
                      <input type="text" placeholder="noreply@mia-agencia.com" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 mt-6">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" /> Guardar Apariencia
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'suscripcion' && (
              <div className="space-y-6 text-center py-10">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Planes y Suscripción</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Actualmente estás en el plan <strong>Pro</strong>. Gestiona tu facturación y límites aquí.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                  <div className="border border-slate-200 p-4 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-1">Básico</h4>
                    <p className="text-xl font-bold mb-3">$499 <span className="text-xs font-normal text-slate-500">/mes</span></p>
                    <button className="w-full border border-blue-600 text-blue-600 rounded-md py-1.5 text-sm font-medium">Downgrade</button>
                  </div>
                  <div className="border-2 border-blue-500 p-4 rounded-xl relative shadow-md">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Actual</span>
                    <h4 className="font-bold text-slate-900 mb-1">Pro</h4>
                    <p className="text-xl font-bold mb-3">$999 <span className="text-xs font-normal text-slate-500">/mes</span></p>
                    <button className="w-full bg-slate-100 text-slate-400 rounded-md py-1.5 text-sm font-medium cursor-not-allowed">Plan Actual</button>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-1">Enterprise</h4>
                    <p className="text-xl font-bold mb-3">$2,499 <span className="text-xs font-normal text-slate-500">/mes</span></p>
                    <button className="w-full bg-blue-600 text-white rounded-md py-1.5 text-sm font-medium">Upgrade</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pagos' && (
              <div className="space-y-6 text-center py-10">
                <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Configuración de Pagos</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">Conecta tu cuenta de Stripe para procesar pagos de clientes directamente.</p>
                <button className="bg-[#635BFF] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#5851df] transition-colors shadow-sm inline-flex items-center gap-2">
                  Conectar con Stripe
                </button>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Información Legal</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block">Régimen Fiscal</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="regimen" className="text-blue-600 focus:ring-blue-500" defaultChecked />
                        <span className="text-sm text-slate-700">Persona Moral</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="regimen" className="text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-slate-700">Persona Física con Actividad Empresarial</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">RFC</label>
                    <input type="text" defaultValue="VEM123456789" className="w-full md:w-1/2 border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-start pt-4">
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" /> Guardar Información Legal
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
