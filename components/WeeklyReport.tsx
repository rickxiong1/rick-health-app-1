
import React from 'react';
import { GlassCard } from './GlassCard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_WEEKLY_DATA } from '../constants';

export const WeeklyReport: React.FC = () => {
  return (
    <GlassCard className="p-8 border-white/80 bg-white/20">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Session Rhythm</h3>
        <div className="w-2 h-2 rounded-full bg-indigo-400/40" />
      </div>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_WEEKLY_DATA}>
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 9, fill: '#9ca3af', fontWeight: 600}} 
              dy={15}
            />
            <Tooltip 
              cursor={{ stroke: '#818cf8', strokeWidth: 1, strokeDasharray: '2 4' }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.9)', 
                background: 'rgba(255,255,255,0.8)', 
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.02)',
                padding: '8px 12px'
              }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#4f46e5' }}
            />
            <Area 
              type="monotone" 
              dataKey="stress" 
              stroke="#818cf8" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#chartGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
