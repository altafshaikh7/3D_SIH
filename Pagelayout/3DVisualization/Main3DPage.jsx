import React, { useState } from "react";
// Note: `Scene` already renders a Canvas internally, so we must not wrap it with another Canvas
import Scene from "./components/Scene";
import TransformerView from "./pages/TransformerView";
import LeftMenu from "./ui/LeftMenu";
import { ViewMode } from "../../types.js";
import { useScadaSystem } from "./hooks/useScadaSystem";

const Main3DPage = () => {
  const [is3DMode, setIs3DMode] = useState(true);
  const [currentView, setCurrentView] = useState(ViewMode.OVERVIEW);
  const [selectedObject, setSelectedObject] = useState(null);

  const { data: scadaData, isConnected, acknowledgeAlarm } =
    useScadaSystem() || {};

  const handleObjectSelect = (obj) => setSelectedObject(obj);

  return (
    <div className="absolute inset-0 z-0">
      {is3DMode ? (
        <div className="w-full h-full">
          <Scene
              viewMode={currentView}
              selectedObject={selectedObject}
              onSelectObject={handleObjectSelect}
              scadaData={scadaData}
              onAcknowledgeAlarm={acknowledgeAlarm}
            />
        </div>
      ) : (
        <div className="w-full h-full pl-64 pt-16 overflow-auto bg-white animate-in fade-in duration-300">
          {currentView === ViewMode.TRANSFORMER && <TransformerView />}
        </div>
      )}
    </div>
  );
};

export default Main3DPage;
