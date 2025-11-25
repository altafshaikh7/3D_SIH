
import { useState, useEffect, useRef, useCallback } from 'react';


export const useScadaSystem = () => {
  const [data, setData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  
  // Store active alarms in a ref to persist them across simulation ticks
  const activeAlarms = useRef(new Map());

  const acknowledgeAlarm = useCallback((id) => {
    const alarm = activeAlarms.current.get(id);
    if (alarm) {
      activeAlarms.current.set(id, { ...alarm, acknowledged: true });
      setData(prev => {
         const newData = { ...prev };
         if (newData[id]) {
             newData[id].alarm = activeAlarms.current.get(id);
         }
         return newData;
      });
    }
  }, []);

  // Simulation logic
  useEffect(() => {
    setIsConnected(true);
    
    // Initialize a random alarm for demonstration
    if (activeAlarms.current.size === 0) {
        activeAlarms.current.set('T-L-2', {
            active: true,
            severity: 'CRITICAL',
            message: 'OIL TEMP HIGH',
            acknowledged: false,
            timestamp: Date.now()
        });
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const t = now / 1000; 

      // Random trigger
      if (Math.random() > 0.98 && activeAlarms.current.size < 4) {
          const sides = ['L', 'R'];
          const side = sides[Math.floor(Math.random() * 2)];
          const idx = Math.floor(Math.random() * 8) + 1;
          const target = `T-${side}-${idx}`;
          
          if (!activeAlarms.current.has(target)) {
              activeAlarms.current.set(target, {
                  active: true,
                  severity: Math.random() > 0.5 ? 'CRITICAL' : 'WARNING',
                  message: 'WINDING OVERHEAT',
                  acknowledged: false,
                  timestamp: now
              });
          }
      }

      const newData = {};

      // Generate data for Left (L) and Right (R) sides, 8 bays each
      ['L', 'R'].forEach((side, sideIdx) => {
          for (let i = 1; i <= 8; i++) {
            const id = `T-${side}-${i}`;
            const phaseOffset = i * 0.5 + (sideIdx * 2);
            
            // Simulation Logic:
            // Load fluctuates between ~60% and ~85%
            const loadPct = 72 + Math.sin(t * 0.1 + phaseOffset) * 12;
            
            // Temperature Calculation optimized to cross 50 degrees C
            // Base 30C + Load Heating + Sine fluctuation to force fan cycling
            // This results in a range approx 40C to 58C
            const oilTemp = 30 + (loadPct * 0.25) + (Math.sin(t * 0.2 + phaseOffset) * 8);

            newData[id] = {
              id,
              timestamp: now,
              status: 'ONLINE',
              alarm: activeAlarms.current.get(id),
              values: {
                loadPct: loadPct.toFixed(1),
                hvVoltage: (400 + Math.sin(t * 0.1) * 2).toFixed(1),
                lvVoltage: (220 + Math.sin(t * 0.1) * 1.5).toFixed(1),
                oilTemp: oilTemp.toFixed(1),
                tapPos: 7
              }
            };
            
            // Generate Breaker Data for this bay
            [0, 1, 2].forEach(phase => {
                const bid = `CB-${side}-${i}-${phase}`;
                newData[bid] = {
                     id: bid,
                     timestamp: now,
                     status: 'ONLINE', 
                     alarm: activeAlarms.current.get(bid),
                     values: {
                         pressure: (0.6 + Math.random() * 0.02).toFixed(3),
                         current: (1200 + Math.random() * 50).toFixed(0)
                     }
                };
            });
          }
      });

      setData(newData);
    }, 1000); 

    return () => clearInterval(interval);
  }, [acknowledgeAlarm]);

  return { data, isConnected, acknowledgeAlarm };
};
