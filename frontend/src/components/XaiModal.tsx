import React from 'react';
import { ShieldAlert, X, CheckCircle, AlertCircle } from 'lucide-react';

interface XaiModalProps {
  victim: any;
  onClose: () => void;
  onOverridePriority: (victimId: string, newLevel: string) => void;
}

export const XaiModal: React.FC<XaiModalProps> = ({ victim, onClose, onOverridePriority }) => {
  if (!victim) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="text-lg font-bold text-white">XAI Triage Reasoning: {victim.victim_id}</h3>
            <p className="text-xs text-slate-400 font-mono">EXPLAINABLE AI PRIORITY BREAKDOWN</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Total Priority Score</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">{victim.priority_score || 75} / 100</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Factor Evaluation Matrix:</div>
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Demographic Risk ({victim.age_group || 'Adult'}):</span>
                <span className="text-emerald-400">+15 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Injury Severity ({victim.injury_severity || 'Moderate'}):</span>
                <span className="text-amber-400">+25 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submersion Threat:</span>
                <span className={victim.submerged ? 'text-red-400' : 'text-slate-500'}>
                  {victim.submerged ? '+25 pts (Submerged)' : '0 pts'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Structural Trapped Hazard:</span>
                <span className={victim.trapped ? 'text-red-400' : 'text-slate-500'}>
                  {victim.trapped ? '+15 pts (Trapped)' : '0 pts'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Override */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-300">Human-in-the-Loop Triage Override:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOverridePriority(victim.victim_id, 'CRITICAL')}
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-bold"
            >
              Set CRITICAL
            </button>
            <button
              onClick={() => onOverridePriority(victim.victim_id, 'HIGH')}
              className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-lg text-xs font-bold"
            >
              Set HIGH
            </button>
            <button
              onClick={() => onOverridePriority(victim.victim_id, 'MODERATE')}
              className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 rounded-lg text-xs font-bold"
            >
              Set MODERATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};