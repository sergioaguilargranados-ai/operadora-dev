"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/PageHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PackageSearch, CheckCircle, Clock, Truck, XCircle, Eye } from "lucide-react"

export default function StoreOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/store-orders?tenant_id=1")
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Error cargando pedidos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      setUpdating(id)
      const res = await fetch("/api/admin/store-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Actualizado", description: "Estado actualizado exitosamente" })
        fetchOrders()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Error al actualizar", variant: "destructive" })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />
      case 'paid': return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <PageHeader showBackButton={true} backButtonHref="/dashboard">
        <div>
          <h1 className="text-xl font-bold">Gestión de Pedidos (Tienda Online)</h1>
          <p className="text-sm text-muted-foreground">
            Administra las órdenes de compra realizadas en la App Móvil
          </p>
        </div>
      </PageHeader>

      <Card className="mt-6 border-none shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center flex-col text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0066FF] mb-4" />
            <p>Cargando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 flex justify-center items-center flex-col text-gray-400">
            <PackageSearch className="w-12 h-12 mb-4 opacity-50" />
            <p>No se han registrado pedidos en la tienda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Pedido ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Artículos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">#{order.id.toString().padStart(5, '0')}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{order.user_name}</div>
                      <div className="text-xs text-gray-500">{order.user_email}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      ${Number(order.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <select 
                          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pendiente de Pago</option>
                          <option value="paid">Pagado</option>
                          <option value="shipped">Enviado</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {order.items?.length || 0} artículos
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye className="w-4 h-4 mr-1" /> Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
