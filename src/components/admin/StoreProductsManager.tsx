"use client"

import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUploadInput } from "@/components/admin/ImageUploadInput"
import { Plus, Edit2, ShoppingBag, Package, Trash2, CheckCircle, XCircle } from "lucide-react"

export function StoreProductsManager({ showToast }: { showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    offer_price: '',
    category: '',
    stock: '999',
    image_url: '',
    status: 'active'
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/store-products?tenant_id=1')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error(err)
      showToast('Error cargando productos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.price) {
        showToast('Nombre y Precio son obligatorios', 'error')
        return
      }

      const method = formData.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/store-products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenant_id: 1, // Por ahora asumimos la agencia principal
          price: parseFloat(formData.price),
          offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
          stock: parseInt(formData.stock)
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showToast('Producto guardado exitosamente', 'success')
        setIsEditing(false)
        setFormData({ id: null, name: '', description: '', price: '', offer_price: '', category: '', stock: '999', image_url: '', status: 'active' })
        loadProducts()
      } else {
        showToast(data.error || 'Error al guardar', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error de conexión', 'error')
    }
  }

  const handleEdit = (prod: any) => {
    setFormData({
      id: prod.id,
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price?.toString() || '',
      offer_price: prod.offer_price?.toString() || '',
      category: prod.category || '',
      stock: prod.stock?.toString() || '0',
      image_url: prod.image_url || '',
      status: prod.status || 'active'
    })
    setIsEditing(true)
  }

  if (loading) return <div className="p-6 text-center">Cargando productos...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-blue-600"/> Catálogo de Productos</h3>
          <p className="text-sm text-gray-500">Administra los productos de la Tienda Online de la App Móvil</p>
        </div>
        <Button onClick={() => {
          setFormData({ id: null, name: '', description: '', price: '', offer_price: '', category: '', stock: '999', image_url: '', status: 'active' })
          setIsEditing(true)
        }} className="bg-blue-600 text-white">
          <Plus className="w-4 h-4 mr-2"/>
          Nuevo Producto
        </Button>
      </div>

      {isEditing && (
        <Card className="p-6 border-blue-200 bg-blue-50/30">
          <h4 className="font-semibold mb-4 text-blue-900">{formData.id ? 'Editar Producto' : 'Crear Producto'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre del Producto *</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Maleta de Viaje" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ej: Accesorios" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Precio (MXN) *</label>
              <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="999.00" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Precio de Oferta (Opcional)</label>
              <Input type="number" value={formData.offer_price} onChange={e => setFormData({...formData, offer_price: e.target.value})} placeholder="799.00" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stock Disponible</label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="999" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <select 
                className="w-full border rounded-md p-2 text-sm"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Descripción Corta</label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descripción breve..." />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Imagen del Producto</label>
              <ImageUploadInput 
                value={formData.image_url} 
                onChange={val => setFormData({...formData, image_url: val})}
                placeholder="Sube la imagen del producto..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button className="bg-blue-600 text-white" onClick={handleSave}>Guardar Producto</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(prod => (
          <Card key={prod.id} className="overflow-hidden flex flex-col">
            <div className="h-40 bg-gray-100 flex items-center justify-center relative">
              {prod.image_url ? (
                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-10 h-10 text-gray-400" />
              )}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-bold text-gray-800">
                ${prod.price}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 leading-tight">{prod.name}</h4>
                {prod.status === 'active' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{prod.description}</p>
              
              <div className="mt-auto flex justify-between items-center pt-3 border-t">
                <span className="text-xs font-medium text-gray-600">Stock: {prod.stock}</span>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(prod)} className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                  <Edit2 className="w-4 h-4 mr-1" /> Editar
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {products.length === 0 && !isEditing && (
          <div className="col-span-3 text-center py-10 text-gray-500 border rounded-xl border-dashed">
            No hay productos registrados en la tienda.
          </div>
        )}
      </div>
    </div>
  )
}
