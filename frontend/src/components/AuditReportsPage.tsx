import React from 'react';
import { Download, FileText } from 'lucide-react';

interface AuditReportsPageProps {
  victims: any[];
}

export const AuditReportsPage: React.FC<AuditReportsPageProps> = ({ victims }) => {
  const downloadCSV = () => {
    const headers = "Victim_ID,Priority_Score,Urgency,Severity,Age_Group,Submerged,Trapped\n";
    const rows = victims.map(v => 
      `${v.victim_id},${v.priority_score || 0},${v.urgency_level || 'N/A'},${v.injury_severity || 'N/A'},${v.age_group || 'N/A'},${v.submerged ? 'YES' : 'NO'},${v.trapped ? 'YES' : 'NO'}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RescueAI_Disaster_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Mission Audit Logs & Official Reports
          </h3>
          <p className="text-xs text-slate-400">Download compliant incident logs for NDRF and Disaster Response Agencies.</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center space-x-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          <Download className="w-4 h-4" /> <span>Export CSV Report</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">Victim ID</th>
              <th className="p-3">Urgency</th>
              <th className="p-3">Score</th>
              <th className="p-3">Age</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {victims.map((v) => (
              <tr key={v.victim_id} className="border-b border-slate-800/50 hover:bg-slate-950/50">
                <td className="p-3 font-bold text-cyan-400">{v.victim_id}</td>
                <td className="p-3">{v.urgency_level || 'MODERATE'}</td>
                <td className="p-3">{v.priority_score || 35}</td>
                <td className="p-3">{v.age_group || 'adult'}</td>
                <td className="p-3">{v.injury_severity || 'moderate'}</td>
                <td className="p-3 text-emerald-400 font-bold">Detected</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};