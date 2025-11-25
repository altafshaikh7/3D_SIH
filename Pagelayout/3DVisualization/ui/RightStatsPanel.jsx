
import React from 'react';
import { Info, Activity, Zap, Thermometer, Gauge, Layers, RotateCw, CloudLightning, Radio, ToggleRight, Building2, Battery, Server, MapPin } from 'lucide-react';






const RightStatsPanel = ({ selectedObject, scadaData = {} }) => {
  
  if (!selectedObject) {
    return null;
  }

  const getObjectStats = (obj) => {
    if (!obj) return [];

    // Try to find live data for this object
    const liveData = scadaData[obj.id];

    if (obj.type === 'transformer') {
      // Use live data if available, otherwise fallback to simulation/static
      const load = liveData?.values?.loadPct || 82;
      const temp = liveData?.values?.oilTemp || 45;
      const hv = liveData?.values?.hvVoltage || 400.2;

      return [
        { label: 'Oil Temperature', value: temp, unit: '°C', icon: Thermometer },
        { label: 'Winding Temp', value: (Number(temp) + 5).toFixed(1), unit: '°C', icon: Thermometer },
        { label: 'Oil Pressure', value: '0.52', unit: 'bar', icon: Gauge },
        { label: 'Load Factor', value: load, unit: '%', icon: Activity },
        { label: 'Primary Volt', value: hv, unit: 'kV', icon: Zap },
        { label: 'Secondary Volt', value: '220.5', unit: 'kV', icon: Zap },
        { label: 'Tap Position', value: liveData?.values?.tapPos || '07', unit: '', icon: Layers },
      ];
    } else if (obj.type === 'breaker') {
      const pressure = liveData?.values?.pressure || obj.data?.pressure || '0.62';
      const current = liveData?.values?.current || '1,243';
      
      return [
        { label: 'State', value: 'CLOSED', unit: '', icon: Activity },
        { label: 'Line Current', value: current, unit: 'A', icon: Zap },
        { label: 'SF6 Pressure', value: pressure, unit: 'MPa', icon: Gauge },
        { label: 'Op Count', value: '1,243', unit: '', icon: Layers },
        { label: 'Control Volt', value: '110', unit: 'V DC', icon: Zap },
      ];
    } else if (obj.type === 'isolator') {
      return [
        { label: 'Status', value: 'CLOSED', unit: '', icon: ToggleRight },
        { label: 'Motor Current', value: '0.0', unit: 'A', icon: Activity },
        { label: 'Interlock', value: 'LOCKED', unit: '', icon: Info },
      ];
    } else if (obj.type === 'instrumentTransformer') {
        if (obj.name.includes('Current')) {
             return [
                { label: 'Primary', value: '2000', unit: 'A', icon: Activity },
                { label: 'Secondary', value: '1', unit: 'A', icon: Activity },
                { label: 'Ratio', value: '2000:1', unit: '', icon: Info },
                { label: 'Burden', value: '15', unit: 'VA', icon: Zap },
             ];
        } else {
            return [
                { label: 'Primary', value: '400', unit: 'kV', icon: Zap },
                { label: 'Secondary', value: '110', unit: 'V', icon: Zap },
                { label: 'Ratio', value: '400kV/√3 : 110V/√3', unit: '', icon: Info },
             ];
        }
    } else if (obj.type === 'waveTrap') {
      return [
        { label: 'Function', value: 'Blocks high-frequency PLCC signals while allowing 50/60Hz power flow.', unit: '', icon: Radio, isLongText: true },
        { label: 'Location', value: 'Between Lightning Arrester and CVT/PT in the line bay.', unit: '', icon: MapPin, isLongText: true },
        { label: 'Mounted On', value: 'Two post insulators on steel structure.', unit: '', icon: Layers, isLongText: true },
      ];
    } else if (obj.type === 'earthing') {
        return [
            { label: 'Function', value: 'Provides safe path for fault currents and grounds equipment bodies.', unit: '', icon: Activity, isLongText: true },
            { label: 'Scope', value: 'Grid mesh under entire switchyard connected to every equipment structure.', unit: '', icon: Layers, isLongText: true },
            { label: 'Visible Parts', value: 'Galvanized Iron (GI) strips, equipment risers, and maintenance earth pits.', unit: '', icon: Info, isLongText: true },
        ];
    } else if (obj.type === 'lightningArrester') {
      return [
          { label: 'Discharge Counter', value: '42', unit: 'events', icon: Layers },
          { label: 'Leakage Current', value: '0.45', unit: 'mA', icon: Activity },
          { label: 'MCOV', value: '318', unit: 'kV', icon: Zap },
          { label: 'Health Status', value: 'GOOD', unit: '', icon: Info },
      ];
    } else if (obj.type === 'generator') {
      const mw = liveData?.values?.mw || '485';
      const mvar = liveData?.values?.mvar || '120';
      const freq = liveData?.values?.frequency || '50.02';
      const rpm = liveData?.values?.rpm || '3000';

      return [
        { label: 'Output Voltage', value: '15.2', unit: 'kV', icon: Zap },
        { label: 'Frequency', value: freq, unit: 'Hz', icon: Radio },
        { label: 'RPM', value: rpm, unit: 'rpm', icon: RotateCw },
        { label: 'Active Power', value: mw, unit: 'MW', icon: Activity },
        { label: 'Reactive Power', value: mvar, unit: 'MVAR', icon: CloudLightning },
      ];
    } else if (obj.id === 'BAT-110V-DC' || obj.id === 'BAT-BLDG') {
       // Battery System Data
       return [
          { label: 'DC Voltage', value: '112.5', unit: 'V DC', icon: Zap },
          { label: 'Load Current', value: '12.4', unit: 'A', icon: Activity },
          { label: 'Charger Mode', value: 'FLOAT', unit: '', icon: RotateCw },
          { label: 'Battery Temp', value: '22.5', unit: '°C', icon: Thermometer },
          { label: 'Autonomy EST', value: '8.0', unit: 'Hrs', icon: Battery },
       ];
    } else if (obj.id === 'CR-MAIN' || obj.id === 'CR-GEN') {
       // Control Room Data
       return [
          { label: 'Room Temp', value: '21.5', unit: '°C', icon: Thermometer },
          { label: 'Humidity', value: '45', unit: '%', icon: DropletsIcon },
          { label: 'Access Status', value: 'SECURE', unit: '', icon: Server },
          { label: 'Fire Panel', value: 'NORMAL', unit: '', icon: Info },
          { label: 'SCADA Servers', value: 'ONLINE', unit: '', icon: Server },
       ];
    }

    return [];
  };
  
  // Helper icon for humidity
  const DropletsIcon = ({size, className}) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
  );

  // Safety check to ensure getObjectStats returns a valid array
  const specificStats = selectedObject ? getObjectStats(selectedObject) || [] : [];
  // Check if we have live data for the indicator
  const hasLiveData = scadaData[selectedObject.id] !== undefined;

  // Determine Header Icon
  const getHeaderIcon = () => {
      if (selectedObject.id.includes('BAT')) return <Battery className="text-slate-700" size={20}/>;
      if (selectedObject.id.includes('CR')) return <Building2 className="text-slate-700" size={20}/>;
      return <Activity className="text-slate-700" size={20}/>;
  };

  return (
    <div className="w-80 bg-white border border-slate-200 p-6 rounded-xl flex flex-col gap-6 shadow-xl h-auto max-h-full overflow-y-auto transition-all duration-300 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="overflow-hidden">
            <h3 className="text-black text-lg font-bold truncate pr-2">{selectedObject.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                 <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                    ID: {selectedObject.id}
                </p>
                {hasLiveData && (
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                )}
            </div>
        </div>
        <div className="w-10 h-10 flex-shrink-0 rounded bg-slate-50 border border-slate-200 flex items-center justify-center">
             {getHeaderIcon()}
        </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase border-l-2 border-black pl-2 flex justify-between">
                <span>{selectedObject.type === 'earthing' || selectedObject.type === 'waveTrap' ? 'Component Details' : 'Real-time Parameters'}</span>
                {hasLiveData && <span className="text-[10px] text-green-700 font-mono self-center">LIVE</span>}
            </h4>
            <div className="grid grid-cols-1 gap-3">
            {specificStats.map((s, i) => (
                s && s.value !== undefined ? (
                    s.isLongText ? (
                         // Description Text Layout (for Earthing, WaveTrap)
                         <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                {s.icon && <s.icon size={14} className="text-slate-500"/>}
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</span>
                            </div>
                            <div className="text-slate-700 text-sm leading-relaxed">
                                {s.value}
                            </div>
                        </div>
                    ) : (
                        // Standard Stat Row Layout
                        <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between group hover:border-slate-400 transition-colors shadow-sm">
                            <div className="flex items-center gap-3">
                                {s.icon && <s.icon size={16} className="text-slate-400 group-hover:text-black transition-colors"/>}
                                <span className="text-slate-600 text-sm font-medium">{s.label}</span>
                            </div>
                            <div className="font-mono text-black font-bold text-sm">
                                {s.value} <span className="text-xs text-slate-500 font-normal">{s.unit}</span>
                            </div>
                        </div>
                    )
                ) : null
            ))}
            {specificStats.length === 0 && (
                <div className="text-center text-slate-400 text-xs italic py-4">No telemetry data available</div>
            )}
            </div>
        </div>
    </div>
  );
};

export default RightStatsPanel;
