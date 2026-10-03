import React from 'react';
import { Home, HeartPulse, PackageCheck, ShieldCheck } from 'lucide-react';

export const ReliefSheltersPage: React.FC = () => {
  const shelters = [
    { name: 'Central Stadium Relief Camp', location: 'Sector 4', capacity: '450 / 600', medical: 'High', food: '85%' },
    { name: 'North Academy Shelter', location: 'Sector 1', capacity: '120 / 200', medical: 'Moderate', food: '60%' },
    { name: 'East Community Hall', location: 'Sector 7', capacity: '290 / 300', medical: 'Critical Supply', food: '20%' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shelters.map((s, idx) => (
          <div key={idx} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 text-cyan-400">
              <Home className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm text-white">{s.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono">{s.location}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Occupancy Capacity:</span>
                <span className="text-white font-bold">{s.capacity}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Medical Readiness:</span>
                <span className="text-emerald-400 font-bold">{s.medical}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rations & Food Stock:</span>
                <span className="text-cyan-400 font-bold">{s.food}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};