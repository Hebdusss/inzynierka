'use client'
import React, { useMemo } from 'react'

export interface WeightEntry {
  date: string   // YYYY-MM-DD
  weight: number // kg
}

interface Props {
  entries: WeightEntry[]
  goalWeight?: number
  height?: number           // px
  labelColor?: string
  accentColor?: string
  goalColor?: string
  showGoalLine?: boolean
  tLabel?: (key: string) => string
}

const PADDING = { top: 30, right: 20, bottom: 40, left: 50 }

export default function WeightChart({
  entries,
  goalWeight,
  height: chartHeight = 260,
  labelColor = '#64748b',
  accentColor = '#6366f1',
  goalColor = '#f59e0b',
  showGoalLine = true,
  tLabel,
}: Props) {
  const WIDTH = 600
  const HEIGHT = chartHeight
  const innerW = WIDTH - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom

  const data = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.slice(-90) // last 90 entries max
  }, [entries])

  const stats = useMemo(() => {
    if (data.length === 0) return null
    const weights = data.map(d => d.weight)
    let min = Math.min(...weights)
    let max = Math.max(...weights)
    if (goalWeight !== undefined) {
      min = Math.min(min, goalWeight)
      max = Math.max(max, goalWeight)
    }
    const margin = (max - min) * 0.15 || 2
    return { min: min - margin, max: max + margin }
  }, [data, goalWeight])

  if (data.length < 2 || !stats) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        {tLabel ? tLabel('bmi.chart.needMore') : 'Add at least 2 weight entries to see the chart'}
      </div>
    )
  }

  const xScale = (i: number) => PADDING.left + (i / (data.length - 1)) * innerW
  const yScale = (v: number) => PADDING.top + innerH - ((v - stats.min) / (stats.max - stats.min)) * innerH

  // build polyline
  const points = data.map((d, i) => `${xScale(i)},${yScale(d.weight)}`).join(' ')

  // gradient area
  const areaPath = `M${xScale(0)},${yScale(data[0].weight)} ${data.map((d, i) => `L${xScale(i)},${yScale(d.weight)}`).join(' ')} L${xScale(data.length - 1)},${PADDING.top + innerH} L${xScale(0)},${PADDING.top + innerH} Z`

  // Y axis ticks
  const yTicks = 5
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => stats.min + (i / yTicks) * (stats.max - stats.min))

  // X axis labels (show ~6 labels)
  const xLabelCount = Math.min(6, data.length)
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) => Math.round((i / (xLabelCount - 1)) * (data.length - 1)))

  // Linear regression trend line (straight line best-fit)
  const trendLine = useMemo(() => {
    if (data.length < 2) return null
    const n = data.length
    // x = index (0,1,2,...), y = weight
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += data[i].weight
      sumXY += i * data[i].weight
      sumXX += i * i
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    const yStart = intercept           // value at index 0
    const yEnd = intercept + slope * (n - 1)  // value at last index
    return {
      x1: xScale(0),
      y1: yScale(yStart),
      x2: xScale(n - 1),
      y2: yScale(yEnd),
    }
  }, [data, stats])

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full"
      style={{ maxHeight: `${HEIGHT}px` }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.20" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTickVals.map((v, i) => (
        <g key={i}>
          <line
            x1={PADDING.left}
            y1={yScale(v)}
            x2={WIDTH - PADDING.right}
            y2={yScale(v)}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray={i === 0 || i === yTicks ? '0' : '4,4'}
          />
          <text x={PADDING.left - 8} y={yScale(v) + 4} textAnchor="end" fill={labelColor} fontSize="11" fontWeight="500">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Goal line */}
      {showGoalLine && goalWeight !== undefined && (
        <g>
          <line
            x1={PADDING.left}
            y1={yScale(goalWeight)}
            x2={WIDTH - PADDING.right}
            y2={yScale(goalWeight)}
            stroke={goalColor}
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <text x={WIDTH - PADDING.right + 4} y={yScale(goalWeight) + 4} fill={goalColor} fontSize="10" fontWeight="600">
            {tLabel ? tLabel('bmi.chart.goal') : 'Goal'}
          </text>
        </g>
      )}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Main line */}
      <polyline points={points} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Linear regression trend line */}
      {trendLine && (
        <line x1={trendLine.x1} y1={trendLine.y1} x2={trendLine.x2} y2={trendLine.y2}
          stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeDasharray="6,3" opacity="0.8" />
      )}

      {/* Data points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xScale(i)} cy={yScale(d.weight)} r="4" fill="white" stroke={accentColor} strokeWidth="2" />
          {/* Tooltip on hover area */}
          <title>{`${d.date}: ${d.weight} kg`}</title>
          <circle cx={xScale(i)} cy={yScale(d.weight)} r="10" fill="transparent" />
        </g>
      ))}

      {/* X labels */}
      {xLabelIndices.map(i => (
        <text key={i} x={xScale(i)} y={HEIGHT - 8} textAnchor="middle" fill={labelColor} fontSize="10" fontWeight="500">
          {data[i].date.slice(5)} {/* MM-DD */}
        </text>
      ))}

      {/* Legend */}
      <g transform={`translate(${PADDING.left}, 12)`}>
        <line x1="0" y1="0" x2="16" y2="0" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
        <text x="20" y="4" fill={labelColor} fontSize="10">{tLabel ? tLabel('bmi.chart.weight') : 'Weight'}</text>
        {trendLine && (
          <>
            <line x1="80" y1="0" x2="96" y2="0" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeDasharray="4,3" />
            <text x="100" y="4" fill={labelColor} fontSize="10">{tLabel ? tLabel('bmi.chart.trend') : 'Trend'}</text>
          </>
        )}
        {showGoalLine && goalWeight !== undefined && (
          <>
            <line x1="180" y1="0" x2="196" y2="0" stroke={goalColor} strokeWidth="2" strokeDasharray="4,3" />
            <text x="200" y="4" fill={labelColor} fontSize="10">{tLabel ? tLabel('bmi.chart.goalLine') : 'Goal'}</text>
          </>
        )}
      </g>
    </svg>
  )
}
