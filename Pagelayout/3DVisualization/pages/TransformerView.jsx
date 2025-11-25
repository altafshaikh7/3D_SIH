import React from "react";
import {
  Activity,
  Droplets,
  Zap,
  Gauge,
  Thermometer,
  FlaskConical,
  ClipboardCheck,
  Calendar,
  FileText,
} from "lucide-react";

const TransformerView = () => {
  const realTimeStats = [
    { label: "Active Load", value: "85", unit: "%", status: "normal", icon: Activity },
    { label: "Oil Temp (Top)", value: "65.2", unit: "°C", status: "warning", icon: Thermometer },
    { label: "Oil Temp (Bottom)", value: "58.4", unit: "°C", status: "normal", icon: Thermometer },
    { label: "Oil Level", value: "9.0", unit: "m", status: "normal", icon: Droplets },
    { label: "HV Voltage L1", value: "225.4", unit: "kV", status: "normal", icon: Zap },
    { label: "HV Voltage L2", value: "224.8", unit: "kV", status: "normal", icon: Zap },
    { label: "HV Voltage L3", value: "225.1", unit: "kV", status: "normal", icon: Zap },
    { label: "Gas Pressure", value: "0.5", unit: "MPa", status: "normal", icon: Gauge },
  ];

  const oilAnalysisStats = [
    { label: "Dissolved H2", value: "15", unit: "ppm", status: "normal", icon: FlaskConical },
    { label: "Moisture Content", value: "12", unit: "ppm", status: "normal", icon: Droplets },
    { label: "Acidity", value: "0.04", unit: "mgKOH/g", status: "normal", icon: FlaskConical },
    { label: "Breakdown Voltage", value: "65", unit: "kV", status: "normal", icon: Zap },
    { label: "Interfacial Tension", value: "42", unit: "mN/m", status: "normal", icon: Activity },
    { label: "Furan Content", value: "0.01", unit: "mg/kg", status: "normal", icon: FlaskConical },
  ];

  const electricalTestsStats = [
    { label: "Tan Delta (Cap)", value: "0.35", unit: "%", status: "normal", icon: ClipboardCheck },
    { label: "Insulation Res (HV)", value: "2500", unit: "MΩ", status: "normal", icon: Activity },
    { label: "Core Ground Current", value: "25", unit: "mA", status: "warning", icon: Zap },
    { label: "Winding Res (HV)", value: "0.412", unit: "Ω", status: "normal", icon: Zap },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "text-red-600";
      case "warning":
        return "text-orange-600";
      case "normal":
        return "text-black";
      default:
        return "text-slate-800";
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-orange-200 bg-orange-50";
      case "normal":
        return "border-slate-300 bg-white";
      default:
        return "border-slate-200 bg-white";
    }
  };

  const renderStatGroup = (title, stats, icon, colorClass = "border-slate-200") => (
    <div className={`bg-white rounded-xl border ${colorClass} p-6 h-full flex flex-col shadow-sm`}>
      <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="p-2 rounded bg-slate-100">{icon}</div>
        {title}
      </h3>
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBorder(
              stat.status
            )} transition-all hover:shadow-md`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-md bg-white ${getStatusColor(
                  stat.status
                )} shadow-sm border border-slate-100`}
              >
                <stat.icon size={16} />
              </div>
              <div>
                <span className="text-sm text-slate-600 block">{stat.label}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-mono text-base font-bold ${getStatusColor(stat.status)}`}>
                {stat.value}
                <span className="text-xs opacity-60 font-sans font-normal text-slate-500 ml-0.5">
                  {stat.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 bg-white">
      {/* Header */}
      <div className="w-full bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">
              Main Transformer No.1
            </h1>
            <div className="flex items-center gap-4 mt-1 text-slate-500 text-sm font-mono">
              <span>ID: TF-220-MAIN-01</span>
              <span className="w-1 h-1 bg-slate-400 rounded-full" />
              <span>Manufactured: 2018</span>
              <span className="w-1 h-1 bg-slate-400 rounded-full" />
              <span>Loc: Bay 01</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Run Time</div>
            <div className="font-mono text-xl text-black">
              12,403 <span className="text-xs text-slate-500">hrs</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200 hidden md:block" />
          <div className="px-5 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute opacity-75" />
              <div className="w-3 h-3 bg-green-500 rounded-full relative" />
            </div>
            <span className="text-green-700 font-bold text-lg tracking-wide">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          {renderStatGroup(
            "Real-time Monitoring",
            realTimeStats,
            <Activity className="text-black" size={20} />,
            "border-slate-200"
          )}
        </div>

        <div className="col-span-1">
          {renderStatGroup(
            "Oil Analysis (DGA)",
            oilAnalysisStats,
            <FlaskConical className="text-black" size={20} />,
            "border-slate-200"
          )}
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex-1">
            {renderStatGroup(
              "Electrical Tests",
              electricalTestsStats,
              <ClipboardCheck className="text-black" size={20} />,
              "border-slate-200"
            )}
          </div>

          {/* Maintenance Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-3">
              <div className="p-2 rounded bg-slate-100">
                <Calendar className="text-black" size={20} />
              </div>
              Maintenance Log
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <FileText className="text-slate-400 mt-1" size={16} />
                <div>
                  <p className="text-sm text-black font-medium">Routine Oil Sampling</p>
                  <p className="text-xs text-slate-500">
                    2024-03-15 • Technician: J. Doe
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <FileText className="text-slate-400 mt-1" size={16} />
                <div>
                  <p className="text-sm text-black font-medium">Cooling Fan Inspection</p>
                  <p className="text-xs text-slate-500">
                    2024-02-28 • Technician: M. Smith
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-xs text-black hover:text-slate-700 border border-dashed border-slate-300 rounded hover:bg-slate-50 transition-colors">
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransformerView;
