import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ProgressChart({ data, dataKey = 'value', label, unit = 'kg', color = '#3ECF8E' }) {
  const { t } = useLanguage()

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-secondary">
        {t('progress.noData')}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#8A8A8A', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8A8A8A', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#111111', border: '1px solid #262626', borderRadius: 12, fontSize: 13 }}
          labelStyle={{ color: '#F5F5F5' }}
          formatter={(value) => [`${value} ${unit}`, label]}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
