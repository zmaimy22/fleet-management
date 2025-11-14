import React from 'react'
import { saveCalendar } from '../utils/api'

const CleaningStatus = ({ drivers, schedule, currentMonth, currentYear, onRefresh }) => {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dayLetters = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  const getLastWorkDay = (driverId) => {
    for (let day = daysInMonth; day >= 1; day--) {
      const c = schedule[driverId]?.[day]
      if (c && c.type === 'work') return day
    }
    return null
  }

  const simplifyRoute = (value) => {
    if (!value) return ''
    const mainPart = value.split('+')[0]
    return mainPart.includes('.') ? mainPart.split('.')[0] : mainPart
  }

  const all = drivers.filter(d => d.type === 'driver').map(d => {
    const lastDay = getLastWorkDay(d.id)
    const cell = lastDay ? schedule[d.id]?.[lastDay] : null
    const cleaned = !!(cell && cell.cleaningConfirmed === true)
    const cleanedAt = cell?.cleaningConfirmedAt || ''
    const dow = lastDay ? new Date(currentYear, currentMonth, lastDay).getDay() : null
    const routeMain = cell ? simplifyRoute(cell.value) : ''
    // compute planned/confirmed over month: work day immediately before WEEKEND (within month)
    let planned = 0, confirmed = 0
    for (let day = 1; day < daysInMonth; day++) {
      const c = schedule[d.id]?.[day]
      const next = schedule[d.id]?.[day + 1]
      if (c && c.type === 'work' && next && next.type === 'weekend') {
        planned++
        if (c.cleaningConfirmed) confirmed++
      }
    }
    return { id: d.id, name: d.name, lastDay, dow, routeMain, cleaned, cleanedAt, planned, confirmed }
  }).sort((a,b)=> (a.name||'').localeCompare(b.name||'', 'es', { sensitivity: 'base' }))

  const confirmed = all.filter(r => r.cleaned)
  const pending = all.filter(r => r.lastDay && !r.cleaned)
  const noWork = all.filter(r => !r.lastDay)

  const monthKey = `${currentYear}-${currentMonth}`

  const resetDriverCleaning = async (driverId) => {
    const next = { ...schedule }
    if (!next[driverId]) return
    for (let day = 1; day <= daysInMonth; day++) {
      const c = next[driverId][day]
      const nxt = next[driverId][day + 1]
      if (c && c.type === 'work' && (!nxt || nxt.type !== 'work')) {
        delete c.cleaningConfirmed
        delete c.cleaningConfirmedAt
      }
    }
    try { await saveCalendar(monthKey, next) } catch {}
    if (typeof onRefresh === 'function') onRefresh(currentMonth, currentYear)
  }

  const Section = ({ title, rows, showReset }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-600">{rows.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left border">Conductor</th>
              <th className="px-3 py-2 text-left border">Último día</th>
              <th className="px-3 py-2 text-left border">Ruta</th>
              <th className="px-3 py-2 text-left border">Estado</th>
              <th className="px-3 py-2 text-left border">Progreso</th>
              <th className="px-3 py-2 text-left border">Fecha confirmación</th>
              {showReset && <th className="px-3 py-2 text-left border">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="px-3 py-2 border">{r.name}</td>
                <td className="px-3 py-2 border">{r.lastDay ? `${r.lastDay} (${dayLetters[r.dow]})` : '-'}</td>
                <td className="px-3 py-2 border">{r.routeMain || '-'}</td>
                <td className="px-3 py-2 border">{r.cleaned ? 'Confirmado' : r.lastDay ? 'Pendiente' : 'N/A'}</td>
                <td className="px-3 py-2 border">{r.planned ? `${r.confirmed}/${r.planned}` : '-/-'}</td>
                <td className="px-3 py-2 border">{r.cleanedAt ? new Date(r.cleanedAt).toLocaleString('es-ES') : '-'}</td>
                {showReset && (
                  <td className="px-3 py-2 border">
                    <button onClick={() => resetDriverCleaning(r.id)} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Reset</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Limpieza de Camión</h2>
        <div className="text-sm text-gray-600">{new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-green-50 border rounded">
          <div className="text-xs text-gray-600">Confirmados</div>
          <div className="text-xl font-bold text-green-700">{confirmed.length}</div>
        </div>
        <div className="p-3 bg-yellow-50 border rounded">
          <div className="text-xs text-gray-600">Pendientes</div>
          <div className="text-xl font-bold text-yellow-700">{pending.length}</div>
        </div>
        <div className="p-3 bg-gray-50 border rounded">
          <div className="text-xs text-gray-600">Sin días de trabajo</div>
          <div className="text-xl font-bold text-gray-700">{noWork.length}</div>
        </div>
      </div>
      <Section title="Confirmados" rows={confirmed} showReset />
      <Section title="Pendientes" rows={pending} />
      <Section title="Sin días de trabajo" rows={noWork} />
    </div>
  )
}

export default CleaningStatus
