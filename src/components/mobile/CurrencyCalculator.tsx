"use client"

import { useState, useEffect } from 'react'
import { ArrowUpDown, Calculator, Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'

interface CurrencyCalculatorProps {
  targetCurrency: string
  isOpen: boolean
  onClose: () => void
}

export function CurrencyCalculator({ targetCurrency, isOpen, onClose }: CurrencyCalculatorProps) {
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [mxnValue, setMxnValue] = useState<string>('')
  const [targetValue, setTargetValue] = useState<string>('')
  
  // Last edited field ('mxn' or 'target') to keep math accurate
  const [lastEdited, setLastEdited] = useState<'mxn' | 'target'>('mxn')

  useEffect(() => {
    if (isOpen && targetCurrency && targetCurrency !== 'MXN') {
      fetchRate()
    }
  }, [isOpen, targetCurrency])

  const fetchRate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/currencies?action=rates&base=MXN&targets=${targetCurrency}`)
      const data = await res.json()
      if (data.success && data.data.rates && data.data.rates[targetCurrency]) {
        setRate(data.data.rates[targetCurrency])
      }
    } catch (err) {
      console.error("Error fetching rate:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMxnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setMxnValue(val)
    setLastEdited('mxn')
    
    if (val === '' || isNaN(Number(val))) {
      setTargetValue('')
      return
    }
    
    if (rate) {
      setTargetValue((Number(val) * rate).toFixed(2))
    }
  }

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTargetValue(val)
    setLastEdited('target')
    
    if (val === '' || isNaN(Number(val))) {
      setMxnValue('')
      return
    }
    
    if (rate) {
      setMxnValue((Number(val) / rate).toFixed(2))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[90%] max-w-[400px] rounded-3xl p-6 border border-gray-100 shadow-xl bg-[#FDFDFD]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gray-700" />
            Calculadora de Divisas
          </DialogTitle>
          <p className="text-xs text-gray-500">
            Calcula al instante cuánto vas a gastar.
          </p>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : !rate ? (
          <div className="text-center py-6 text-sm text-gray-500">
            No se encontró el tipo de cambio para {targetCurrency}.
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* MXN Input */}
            <div className={`p-4 rounded-2xl border transition-all ${lastEdited === 'mxn' ? 'bg-white border-blue-400 shadow-sm' : 'bg-gray-50 border-transparent'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tus Pesos</span>
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">MXN 🇲🇽</span>
              </div>
              <div className="flex items-center text-3xl font-serif">
                <span className="text-gray-400 mr-1">$</span>
                <input 
                  type="number"
                  inputMode="decimal"
                  value={mxnValue}
                  onChange={handleMxnChange}
                  placeholder="0.00"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-gray-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
              <div className="bg-white p-2 rounded-full border border-gray-100 shadow-sm">
                <ArrowUpDown className="w-4 h-4 text-blue-500" />
              </div>
            </div>

            {/* Target Input */}
            <div className={`p-4 rounded-2xl border transition-all ${lastEdited === 'target' ? 'bg-white border-blue-400 shadow-sm' : 'bg-gray-50 border-transparent'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">En el Destino</span>
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">{targetCurrency} 🌍</span>
              </div>
              <div className="flex items-center text-3xl font-serif">
                <span className="text-gray-400 mr-1">$</span>
                <input 
                  type="number"
                  inputMode="decimal"
                  value={targetValue}
                  onChange={handleTargetChange}
                  placeholder="0.00"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-gray-900 font-bold"
                />
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-[10px] text-gray-400">
                Tipo de cambio actual: 1 MXN = {rate.toFixed(4)} {targetCurrency}
              </p>
            </div>
            
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
