import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';

const data = [
  { time: '00:00', val1: 30, val2: 20, val3: 10 },
  { time: '01:00', val1: 45, val2: 25, val3: 12 },
  { time: '02:00', val1: 35, val2: 30, val3: 15 },
  { time: '03:00', val1: 50, val2: 22, val3: 20 },
  { time: '04:00', val1: 40, val2: 28, val3: 18 },
  { time: '05:00', val1: 60, val2: 35, val3: 25 },
  { time: '06:00', val1: 55, val2: 40, val3: 22 },
  { time: '07:00', val1: 48, val2: 38, val3: 20 },
  { time: '08:00', val1: 30, val2: 20, val3: 10 },
  { time: '09:00', val1: 45, val2: 25, val3: 12 },
  { time: '10:00', val1: 35, val2: 30, val3: 15 },
  { time: '11:00', val1: 50, val2: 22, val3: 20 },
];

const BottomTabs = () => {
  const [visible, setVisible] = useState({
    val1: true,
    val2: true,
    val3: true,
  });

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setVisible(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left Chart: Device Trends */}
      <div className="flex-1 bg-dark-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 flex flex-col shadow-lg">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-cyan-100 font-medium border-l-4 border-cyan-500 pl-2">Device Trends (24h)</h3>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVal1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVal2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} 
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                onClick={handleLegendClick}
                wrapperStyle={{ cursor: 'pointer' }}
                iconType="circle"
              />
              <Brush 
                dataKey="time" 
                height={30} 
                stroke="#475569" 
                fill="#1e293b"
                tickFormatter={() => ''}
              />
              <Area 
                type="monotone" 
                dataKey="val1" 
                name="Voltage A"
                stroke="#22d3ee" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVal1)" 
                hide={!visible.val1}
              />
              <Area 
                type="monotone" 
                dataKey="val2" 
                name="Current A"
                stroke="#c084fc" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVal2)" 
                hide={!visible.val2}
              />
              <Area 
                type="monotone" 
                dataKey="val3" 
                name="Temp"
                stroke="#fb923c" 
                strokeWidth={1} 
                fillOpacity={0} 
                fill="transparent" 
                hide={!visible.val3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right List: Detailed Alerts */}
      <div className="w-1/3 bg-dark-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 flex flex-col shadow-lg">
        <h3 className="text-cyan-100 font-medium border-l-4 border-red-500 pl-2 mb-3">Recent Alerts</h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
             {[1,2,3,4,5].map((i) => (
                 <div key={i} className="flex justify-between items-center bg-slate-700/30 p-2 rounded hover:bg-slate-700/50 transition-colors cursor-pointer">
                     <div className="flex flex-col">
                        <span className="text-xs text-red-300 font-semibold">SF6 Gas Pressure Low</span>
                        <span className="text-[10px] text-slate-400">Bay 201 - Circuit Breaker</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs text-cyan-200 font-mono">24.0.5</span>
                        <span className="text-[10px] text-slate-500">09:3{i}:00</span>
                     </div>
                 </div>
             ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTabs;