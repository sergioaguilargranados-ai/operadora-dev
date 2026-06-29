"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/PageHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExcelUploader } from "@/components/ui/ExcelUploader"
import { useToast } from "@/hooks/use-toast"
import { Download, Plus, Edit, Trash2, Loader2 } from "lucide-react"

export default function StoreAdminPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    category: "",
    price: "",
    offer_price: "",
    image_url: "",
    status: "active",
    stock: 999
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/store-products?tenant_id=1")
      const data = await res.json()
      if (data.success) {
        setProducts(data.data || [])
      } else {
        toast({ title: "Error", description: data.error || "Error al cargar", variant: "destructive" })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (data: any[]) => {
    try {
      // Implementación futura: iterar y llamar a POST
      toast({ title: "Atención", description: `Funcionalidad de Excel en construcción. Data: ${data.length} filas.` })
      setShowUploader(false)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleEdit = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price || "",
      offer_price: product.offer_price || "",
      image_url: product.image_url || "",
      status: product.status || "active",
      stock: product.stock || 999
    })
    setShowProductModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Desactivar este producto?")) return
    try {
      const res = await fetch("/api/admin/store-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "inactive" })
      })
      if (res.ok) {
        toast({ title: "Producto desactivado" })
        fetchProducts()
      }
    } catch (e) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Error", description: "Nombre y precio obligatorios", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const isEdit = !!formData.id
      const url = "/api/admin/store-products"
      const method = isEdit ? "PUT" : "POST"
      
      const payload = {
        ...formData,
        tenant_id: 1,
        price: parseFloat(formData.price as string) || 0,
        offer_price: formData.offer_price ? parseFloat(formData.offer_price as string) : null,
        stock: parseInt(formData.stock as string) || 0
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: isEdit ? "Producto Actualizado" : "Producto Creado" })
        setShowProductModal(false)
        fetchProducts()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Error al guardar el producto", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const openNewModal = () => {
    setFormData({
      id: null, name: "", description: "", category: "", 
      price: "", offer_price: "", image_url: "", status: "active", stock: 999
    })
    setShowProductModal(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <PageHeader showBackButton={true} backButtonHref="/dashboard">
        <div>
          <h1 className="text-xl font-bold">Administración de Tienda Online</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el catálogo de productos de la PWA
          </p>
        </div>
      </PageHeader>

      <div className="flex justify-between items-center mb-6 mt-6">
        <h2 className="text-2xl font-bold">Catálogo de Productos</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" onClick={() => setShowUploader(true)}>
            <Download className="w-4 h-4 mr-2" />
            Importar Excel
          </Button>
          <Button className="bg-[#0066FF] hover:bg-blue-700 text-white" onClick={openNewModal}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>Importar Catálogo de Tienda</DialogTitle>
          </DialogHeader>
          <ExcelUploader 
            onUpload={handleImport} 
            expectedColumns={['name', 'description', 'price', 'offer_price', 'image_url', 'category', 'status']} 
            templateName="Plantilla_Tienda" 
            buttonText="Importar Productos"
          />
        </DialogContent>
      </Dialog>

      {/* MODAL DE PRODUCTO */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre del Producto *</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Maleta Viajera" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Categoría</label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ej. Equipaje" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} placeholder="Detalles del producto..." />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Precio Base *</label>
                <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Precio Oferta</label>
                <Input type="number" step="0.01" value={formData.offer_price} onChange={e => setFormData({...formData, offer_price: e.target.value})} placeholder="Opcional" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stock</label>
                <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} placeholder="999" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">URL de Imagen</label>
              <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#0066FF] text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No hay productos en el catálogo
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden border">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                      <TableCell>{p.offer_price ? <span className="text-green-600 font-bold">${Number(p.offer_price).toFixed(2)}</span> : "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800" onClick={() => handleEdit(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-800" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
