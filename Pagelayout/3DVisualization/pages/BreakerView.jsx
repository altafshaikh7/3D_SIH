
import React from 'react';

const BreakerView = () => {
     return (
        <div className="bg-white p-4 rounded-lg border border-black shadow-xl text-black w-64">
            <h2 className="text-xl font-bold text-black mb-2">Circuit Breaker</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Status:</span> <span className="text-red-600 font-bold">Closed</span></div>
                <div className="flex justify-between"><span>SF6 Pressure:</span> <span className="font-mono font-bold">0.6 MPa</span></div>
                <div className="flex justify-between"><span>Op Count:</span> <span className="font-mono">1240</span></div>
            </div>
        </div>
    );
};

export default BreakerView;
