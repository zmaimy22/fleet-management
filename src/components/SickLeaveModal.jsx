import React, { useState, useEffect } from 'react'

const SickLeaveModal = ({ isOpen, onClose, drivers, daysInMonth, onSubmit }) => {
  const [driverId, setDriverId] = useState('')
  const [startDay, setStartDay] = useState('1')
  const [endDay, setEndDay] = useState('1')

  useEffect(() => {
    if (isOpen) {
      setDriverId('')
      setStartDay('1')
      setEndDay('1')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!driverId) return
    const s = parseInt(startDay, 10)
    const e = parseInt(endDay, 10)
    const a = Math.min(s, e)
    const b = Math.max(s, e)
    onSubmit(parseInt(driverId, 10), a, b)
    onClose()
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 bg-black/40 z-[10000]" onClick={onClose}>
      <div className="min-h-screen flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h3 className="text-xl font-bold mb-4">Añadir Baja</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Conductor</label>
              <select className="w-full px-3 py-2 border rounded" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                <option value="">Selecciona</option>
                {[...drivers].sort((a,b)=> (a.name||'').localeCompare(b.name||'', 'es', {sensitivity:'base'})).map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Desde día</label>
                <select className="w-full px-3 py-2 border rounded" value={startDay} onChange={(e) => setStartDay(e.target.value)}>
                  {days.map(d => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hasta día</label>
                <select className="w-full px-3 py-2 border rounded" value={endDay} onChange={(e) => setEndDay(e.target.value)}>
                  {days.map(d => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleConfirm}>Confirmar</button>
              <button className="flex-1 px-4 py-2 border rounded" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SickLeaveModal
