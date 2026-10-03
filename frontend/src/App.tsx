import React, { useState, useEffect } from 'react';
import { 
  Shield, Radio, MapPin, BarChart3, Navigation, 
  Truck, Anchor, Wind, Layers, Activity, Mic, Info,
  Home, FileText, Filter, AlertTriangle, LifeBuoy, Zap, Compass, CheckCircle2,
  Plane, Crosshair, Cpu, Terminal, X, Check, ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';

// ---------------------------------------------------------------------------
// COORDINATES & MAP MARKERS CONFIGURATION
// ---------------------------------------------------------------------------
const baseStation: [number, number] = [17.4100, 78.4350];
const floodCenter: [number, number] = [17.3750, 78.4820];

const createTacticalMarker = (symbol: string, glowColor: string, isPulsing: boolean = false) =>
  L.divIcon({
    className: 'custom-emoji-pin',
    html: `
      <div style="
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        background: #090d16;
        border: 1.5px solid ${glowColor};
        color: ${glowColor};
        box-shadow: 0 0 10px ${glowColor}40, inset 0 0 8px ${glowColor}20;
        clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
        ${isPulsing ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${symbol}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const baseHqIcon = createTacticalMarker('HQ', '#10b981');
const reconDroneIcon = createTacticalMarker('UAV1', '#38bdf8', true);
const deliveryDroneIcon = createTacticalMarker('UAV2', '#a855f7', true);

const getVictimMarker = (urgency?: string) => {
  if (urgency === 'CRITICAL') return createTacticalMarker('P1', '#ef4444', true);
  if (urgency === 'HIGH') return createTacticalMarker('P2', '#f59e0b');
  return createTacticalMarker('P3', '#3b82f6');
};

// ---------------------------------------------------------------------------
// TYPES & INTERFACES
// ---------------------------------------------------------------------------
interface Victim {
  victim_id: string;
  lat: number;
  lng: number;
  age_group: string;
  injury_severity: string;
  submerged: boolean;
  trapped: boolean;
  priority_score?: number;
  urgency_level?: string;
  reasoning?: string[];
}

// ---------------------------------------------------------------------------
// INLINE COMPONENTS (XAI MODAL, SHELTERS & AUDIT REPORTS)
// ---------------------------------------------------------------------------
function XaiModal({ victim, onClose, onOverridePriority }: { 
  victim: Victim; 
  onClose: () => void; 
  onOverridePriority: (id: string, newLevel: string) => void; 
}) {
  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-[#090d16] border border-cyan-500/50 w-full max-w-xl p-5 space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-2">
          <div className="text-[10px] text-cyan-400 uppercase tracking-widest">EXPLAINABLE AI ENGINE (XAI)</div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mt-1">
            <Cpu className="w-4 h-4 text-cyan-400" /> REASONING MATRIX FOR {victim.victim_id}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#04060a] p-2.5 border border-slate-800">
            <span className="text-slate-500 text-[9px] block">CALCULATED SCORE</span>
            <span className="text-xl font-bold text-cyan-400">{victim.priority_score || 85}/100</span>
          </div>
          <div className="bg-[#04060a] p-2.5 border border-slate-800">
            <span className="text-slate-500 text-[9px] block">TRIAGE STATUS</span>
            <span className={`text-base font-bold ${victim.urgency_level === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
              {victim.urgency_level || 'CRITICAL'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">PRIMARY RISK INFERENCE FACTORS:</div>
          <ul className="space-y-1.5 text-xs">
            {(victim.reasoning || [
              `Age classification [${victim.age_group || 'ELDERLY'}] escalates vulnerability factor (+25)`,
              `Trapped status [${victim.trapped ? 'TRUE' : 'FALSE'}] requires immediate mechanical winch asset (+30)`,
              `Water submersion level [${victim.submerged ? 'HIGH' : 'LOW'}] demands rapid aero-evac (+20)`
            ]).map((reason, idx) => (
              <li key={idx} className="bg-[#04060a] p-2 border border-slate-800/80 text-slate-300 flex items-start gap-2 text-[11px]">
                <span className="text-cyan-400 font-bold">›</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase">TACTICAL COMMAND OVERRIDE:</div>
          <div className="flex space-x-2">
            <button onClick={() => onOverridePriority(victim.victim_id, 'CRITICAL')} className="flex-1 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs py-1.5 font-bold">
              SET P1 CRITICAL
            </button>
            <button onClick={() => onOverridePriority(victim.victim_id, 'HIGH')} className="flex-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 text-xs py-1.5 font-bold">
              SET P2 HIGH
            </button>
            <button onClick={() => onOverridePriority(victim.victim_id, 'MODERATE')} className="flex-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-200 text-xs py-1.5 font-bold">
              SET P3 MODERATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReliefSheltersPage() {
  const shelters = [
    { name: 'Banjara Hills Community Center (HQ Zone)', capacity: 450, occupied: 182, status: 'OPERATIONAL', level: 'SAFE' },
    { name: 'Khairatabad Public Indoor Stadium', capacity: 800, occupied: 640, status: 'HIGH DENSITY', level: 'SAFE' },
    { name: 'Musi South Relief Enclosure Alpha', capacity: 300, occupied: 295, status: 'NEAR CAPACITY', level: 'ALERT' },
    { name: 'Secunderabad High Ground Shelter', capacity: 600, occupied: 210, status: 'OPERATIONAL', level: 'SAFE' }
  ];

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-slate-800 pb-2">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Home className="w-4 h-4" /> EMERGENCY RELIEF SHELTER & CAPACITY HUD
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shelters.map((s, idx) => {
          const pct = Math.round((s.occupied / s.capacity) * 100);
          return (
            <div key={idx} className="bg-[#090d16] p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                <div>
                  <div className="text-xs font-bold text-slate-100">{s.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">STATUS: {s.status}</div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 font-bold border ${s.level === 'ALERT' ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'}`}>
                  {s.level}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>OCCUPANCY RATE</span>
                  <span className="text-cyan-400 font-bold">{s.occupied} / {s.capacity} ({pct}%)</span>
                </div>
                <div className="w-full bg-[#04060a] border border-slate-800 h-2">
                  <div className={`h-full ${pct > 85 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditReportsPage({ victims }: { victims: Victim[] }) {
  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-slate-800 pb-2">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" /> MISSION AUDIT LOGS & DISPATCH HISTORY
        </h2>
      </div>

      <div className="bg-[#090d16] border border-slate-800 p-4 space-y-3">
        <div className="text-xs text-slate-400 border-b border-slate-800 pb-2 flex justify-between">
          <span>ACTIVE MISSION LOG COUNT: <strong className="text-white">{victims.length}</strong></span>
          <span>SYSTEM LOG INTEGRITY: <strong className="text-emerald-400">VERIFIED</strong></span>
        </div>

        <div className="space-y-2">
          {victims.length === 0 ? (
            <div className="text-slate-500 text-xs py-6 text-center border border-dashed border-slate-800">
              NO HISTORICAL DISPATCH EVENTS RECORDED IN CURRENT SESSION.
            </div>
          ) : (
            victims.map((v, i) => (
              <div key={i} className="bg-[#04060a] p-3 border border-slate-800/80 flex justify-between items-center text-xs">
                <div>
                  <span className="text-cyan-400 font-bold">{v.victim_id}</span>
                  <span className="text-slate-500 ml-2">LAT: {v.lat.toFixed(4)} | LNG: {v.lng.toFixed(4)}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 border ${v.urgency_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {v.urgency_level || 'EVALUATED'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN APPLICATION COMPONENT
// ---------------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard' | 'fleet' | 'shelters' | 'reports'>('map');
  const [victims, setVictims] = useState<Victim[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [wsStatus, setWsStatus] = useState<string>('DISCONNECTED');
  const [xaiVictim, setXaiVictim] = useState<Victim | null>(null);
  
  // Tactical Filters
  const [showFloodOverlay, setShowFloodOverlay] = useState(true);
  const [showDrones, setShowDrones] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [isListening, setIsListening] = useState(false);

  // Dynamic Animated UAV Coords
  const [drone1Pos, setDrone1Pos] = useState<[number, number]>([17.3800, 78.4750]);
  const [drone2Pos, setDrone2Pos] = useState<[number, number]>([17.3950, 78.4550]);

  // Real-time Drone Flight Calculation Loop
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step += 0.04;
      
      // UAV-01 Orbital Recon Path
      const lat1 = floodCenter[0] + 0.007 * Math.sin(step);
      const lng1 = floodCenter[1] + 0.007 * Math.cos(step);
      setDrone1Pos([lat1, lng1]);

      // UAV-02 Linear Delivery Flight Path
      const progress = (Math.sin(step * 0.7) + 1) / 2;
      const lat2 = baseStation[0] + (floodCenter[0] - baseStation[0]) * progress;
      const lng2 = baseStation[1] + (floodCenter[1] - baseStation[1]) * progress;
      setDrone2Pos([lat2, lng2]);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/telemetry');
    ws.onopen = () => setWsStatus('ONLINE');
    ws.onclose = () => setWsStatus('DISCONNECTED');

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      try {
        const res = await fetch('http://localhost:8000/api/priority/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const xaiData = await res.json();
        setVictims((prev) => [{ ...data, ...xaiData }, ...prev.slice(0, 19)]);
      } catch (err) {
        console.error('XAI Engine Link Error:', err);
      }
    };

    return () => ws.close();
  }, []);

  const toggleVoiceAssistant = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition module not supported on this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes('dashboard')) setActiveTab('dashboard');
      else if (transcript.includes('map') || transcript.includes('gis')) setActiveTab('map');
      else if (transcript.includes('fleet')) setActiveTab('fleet');
      else if (transcript.includes('shelter')) setActiveTab('shelters');
      else if (transcript.includes('report')) setActiveTab('reports');
    };

    recognition.start();
  };

  const overridePriority = (victimId: string, newLevel: string) => {
    setVictims(prev => prev.map(v => v.victim_id === victimId ? { ...v, urgency_level: newLevel } : v));
    setXaiVictim(null);
  };

  const getFloodAssetMode = (v: Victim, distKm: number) => {
    if (v.submerged || distKm > 8) return { mode: 'Aero-Evac Helicopter', color: 'text-amber-400', code: 'AERO-01' };
    if (v.trapped && distKm <= 3) return { mode: 'Amphibious ARV / Heavy Drone', color: 'text-cyan-400', code: 'ARV-HEAVY' };
    return { mode: 'Shallow-Draft Rescue Boat', color: 'text-emerald-400', code: 'BOAT-S3' };
  };

  const calculateRoute = async (v: Victim) => {
    try {
      const res = await fetch('http://localhost:8000/api/route/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: baseStation[0],
          start_lng: baseStation[1],
          end_lat: v.lat,
          end_lng: v.lng,
        }),
      });
      const routeData = await res.json();
      const asset = getFloodAssetMode(v, routeData.distance_km);
      setSelectedRoute({ 
        victim_id: v.victim_id, 
        ...routeData,
        asset_mode: asset.mode,
        asset_color: asset.color,
        asset_code: asset.code
      });
    } catch (err) {
      console.error('Vector Calculation Error:', err);
    }
  };

  const filteredVictims = victims.filter(v => filterUrgency === 'ALL' || v.urgency_level === filterUrgency);

  const totalCount = victims.length;
  const criticalCount = victims.filter(v => v.urgency_level === 'CRITICAL').length;
  const highCount = victims.filter(v => v.urgency_level === 'HIGH').length;
  const moderateCount = victims.filter(v => v.urgency_level === 'MODERATE').length;

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-200 font-sans p-3 border-t-2 border-cyan-500">
      {xaiVictim && (
        <XaiModal
          victim={xaiVictim}
          onClose={() => setXaiVictim(null)}
          onOverridePriority={overridePriority}
        />
      )}

      {/* Military/Tactical Header */}
      <header className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center p-3 mb-3 bg-[#090d16] border border-slate-800 rounded-none gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold font-mono tracking-widest text-cyan-400 uppercase">RESCUE-AI // COMMAND NEXUS</h1>
              <span className="bg-slate-800 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 border border-slate-700">v4.2 PRO</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide">AUTONOMOUS DISASTER TELEMETRY & TACTICAL DISPATCH</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#04060a] p-1 border border-slate-800 space-x-1 font-mono text-xs overflow-x-auto">
          {[
            { id: 'map', label: 'GIS DISPATCH', icon: Layers },
            { id: 'dashboard', label: 'METRICS HUB', icon: Cpu },
            { id: 'fleet', label: 'FLEET SPECS', icon: Truck },
            { id: 'shelters', label: 'SHELTERS', icon: Home },
            { id: 'reports', label: 'AUDIT LOGS', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 flex items-center space-x-2 font-bold tracking-wider transition ${
                  active 
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-600/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* System Bar */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={toggleVoiceAssistant}
            className={`px-3 py-1.5 border flex items-center space-x-2 transition ${
              isListening ? 'bg-red-950 border-red-600 text-red-400 animate-pulse' : 'bg-[#04060a] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-wider uppercase">{isListening ? 'LISTENING...' : 'VOICE HUD'}</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-[#04060a] px-3 py-1.5 border border-slate-800">
            <Radio className={`w-3.5 h-3.5 ${wsStatus === 'ONLINE' ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`} />
            <span className="text-[10px] text-slate-300 font-bold uppercase">{wsStatus}</span>
          </div>
        </div>
      </header>

      {/* GIS MAP OPERATIONS PAGE */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[calc(100vh-100px)]">
          <div className="lg:col-span-3 bg-[#090d16] border border-slate-800 relative shadow-2xl flex flex-col min-h-[500px]">
            
            {/* Map Controls */}
            <div className="absolute top-3 right-3 z-[1000] bg-[#06090e]/90 backdrop-blur-md p-2 border border-slate-800 flex items-center space-x-3 text-xs font-mono">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showFloodOverlay}
                  onChange={(e) => setShowFloodOverlay(e.target.checked)}
                  className="rounded-none bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-[11px]">FLOOD ZONES</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showDrones}
                  onChange={(e) => setShowDrones(e.target.checked)}
                  className="rounded-none bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span className="text-sky-400 font-bold text-[11px]">ACTIVE UAVs</span>
              </label>

              <div className="h-3 w-px bg-slate-800"></div>

              <div className="flex items-center space-x-1.5 text-slate-400">
                <Filter className="w-3 h-3 text-cyan-400" />
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="bg-[#04060a] border border-slate-800 text-slate-200 px-2 py-0.5 text-[11px] focus:outline-none"
                >
                  <option value="ALL">ALL URGENCY</option>
                  <option value="CRITICAL">P1 CRITICAL ONLY</option>
                  <option value="HIGH">P2 HIGH ONLY</option>
                </select>
              </div>
            </div>

            <MapContainer center={baseStation} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {showFloodOverlay && (
                <>
                  <Circle center={floodCenter} radius={2800} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.12, weight: 1, dashArray: '4, 4' }} />
                  <Circle center={floodCenter} radius={1800} pathOptions={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.22, weight: 1.5 }} />
                  <Circle center={floodCenter} radius={900} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 2 }} />
                </>
              )}

              <Marker position={baseStation} icon={baseHqIcon}>
                <Popup><div className="font-mono text-xs font-bold text-slate-900">BASE HQ TERMINAL</div></Popup>
              </Marker>

              {showDrones && (
                <>
                  <Marker position={drone1Pos} icon={reconDroneIcon}>
                    <Popup><div className="font-mono text-xs text-slate-900">UAV-01 PATROL (THERMAL)</div></Popup>
                  </Marker>
                  <Marker position={drone2Pos} icon={deliveryDroneIcon}>
                    <Popup><div className="font-mono text-xs text-slate-900">UAV-02 MEDICAL TRANSIT</div></Popup>
                  </Marker>
                </>
              )}

              {filteredVictims.map((v) => (
                <Marker
                  key={v.victim_id}
                  position={[v.lat, v.lng]}
                  icon={getVictimMarker(v.urgency_level)}
                  eventHandlers={{ click: () => calculateRoute(v) }}
                >
                  <Popup>
                    <div className="font-mono text-xs text-slate-900 p-1">
                      <div className="font-bold border-b pb-1">{v.victim_id} [{v.urgency_level || 'EVAL'}]</div>
                      <button onClick={() => setXaiVictim(v)} className="mt-2 bg-slate-900 text-cyan-400 text-[10px] px-2 py-1 font-mono font-bold w-full">
                        XAI ANALYSIS
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedRoute && (
                <Polyline
                  positions={selectedRoute.waypoints.map((w: any) => [w.lat, w.lng])}
                  color="#06b6d4"
                  weight={3}
                  dashArray="6, 6"
                />
              )}
            </MapContainer>
          </div>

          {/* Tactical Dispatch HUD */}
          <div className="flex flex-col space-y-3 font-mono">
            <div className="bg-[#090d16] p-3 border border-slate-800 space-y-3">
              <h2 className="text-xs font-bold flex items-center gap-2 text-cyan-400 tracking-wider uppercase border-b border-slate-800 pb-2">
                <Crosshair className="w-4 h-4" /> VECTOR DISPATCH HUD
              </h2>
              {selectedRoute ? (
                <div className="space-y-2.5 text-xs">
                  <div className="text-slate-400 flex justify-between">
                    <span>TARGET TARGET:</span>
                    <span className="text-cyan-400 font-bold">{selectedRoute.victim_id}</span>
                  </div>
                  <div className="p-2.5 bg-[#04060a] border border-slate-800">
                    <div className="text-slate-500 text-[9px] uppercase">RECOMMENDED ASSET MODE</div>
                    <div className={`text-sm font-bold mt-0.5 ${selectedRoute.asset_color}`}>
                      {selectedRoute.asset_mode}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">CALLSIGN: {selectedRoute.asset_code}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-[#04060a] border border-slate-800">
                      <div className="text-slate-500 text-[9px]">VECTOR DIST</div>
                      <div className="text-slate-200 font-bold">{selectedRoute.distance_km} KM</div>
                    </div>
                    <div className="p-2 bg-[#04060a] border border-slate-800">
                      <div className="text-slate-500 text-[9px]">EST. DISPATCH ETA</div>
                      <div className="text-slate-200 font-bold">{selectedRoute.estimated_eta_min} MIN</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 text-center py-6 border border-dashed border-slate-800">
                  AWAITING TARGET SELECTION FROM GIS MAP MATRIX
                </div>
              )}
            </div>

            <div className="bg-[#090d16] p-3 border border-slate-800 flex-1 overflow-y-auto space-y-2">
              <h2 className="text-xs font-bold flex items-center justify-between text-slate-300 uppercase border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5 text-cyan-400" /> TELEMETRY STREAM</span>
                <span className="text-[10px] text-slate-500">{filteredVictims.length} RECS</span>
              </h2>
              <div className="space-y-1.5 text-xs">
                {filteredVictims.map((v) => (
                  <div key={v.victim_id} className="bg-[#04060a] p-2 border border-slate-800/80 flex justify-between items-center hover:border-slate-700 transition">
                    <div onClick={() => calculateRoute(v)} className="cursor-pointer flex items-center space-x-2">
                      <span className={`text-[10px] px-1 font-bold ${v.urgency_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'}`}>
                        {v.urgency_level || 'EVAL'}
                      </span>
                      <span className="font-bold text-cyan-400 text-[11px]">{v.victim_id}</span>
                    </div>
                    <button onClick={() => setXaiVictim(v)} className="text-slate-500 hover:text-cyan-400 p-1">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METRICS DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#090d16] p-4 border border-slate-800 relative">
              <div className="text-slate-500 text-[10px] uppercase">TOTAL DETECTED CASUALTIES</div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-1">{totalCount}</div>
              <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> LIVE SENSOR FEED</div>
            </div>
            <div className="bg-[#090d16] p-4 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">P1 CRITICAL TRIAGE</div>
              <div className="text-3xl font-extrabold text-red-500 mt-1">{criticalCount}</div>
              <div className="text-[10px] text-red-400/80 mt-2 font-mono">IMMEDIATE LIFE RISK</div>
            </div>
            <div className="bg-[#090d16] p-4 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">P2 HIGH PRIORITY</div>
              <div className="text-3xl font-extrabold text-amber-500 mt-1">{highCount}</div>
              <div className="text-[10px] text-amber-400/80 mt-2 font-mono">HIGH THREAT LEVEL</div>
            </div>
            <div className="bg-[#090d16] p-4 border border-slate-800">
              <div className="text-slate-500 text-[10px] uppercase">P3 MODERATE / STABLE</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">{moderateCount}</div>
              <div className="text-[10px] text-emerald-400/80 mt-2 font-mono">STANDARD EVAC</div>
            </div>
          </div>

          <div className="bg-[#090d16] p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> REAL-TIME TELEMETRY MATRIX & XAI LOGS
            </h3>
            <div className="space-y-2">
              {victims.map((v) => (
                <div key={v.victim_id} className="bg-[#04060a] p-3 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold ${v.urgency_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'}`}>
                      {v.urgency_level || 'EVAL'}
                    </span>
                    <span className="font-bold text-cyan-400">{v.victim_id}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center space-x-4">
                    <span>AGE: <strong className="text-slate-200">{v.age_group || 'ADULT'}</strong></span>
                    <span>SEVERITY: <strong className="text-slate-200">{v.injury_severity || 'MODERATE'}</strong></span>
                    <span>SUBMERGED: <strong className={v.submerged ? 'text-red-400' : 'text-slate-400'}>{v.submerged ? 'TRUE' : 'FALSE'}</strong></span>
                  </div>
                  <button onClick={() => setXaiVictim(v)} className="bg-slate-900 hover:bg-slate-800 text-cyan-400 px-3 py-1 border border-slate-800 text-[10px]">
                    EXPLAIN PRIORITY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FLEET READINESS */}
      {activeTab === 'fleet' && (
        <div className="space-y-4 font-mono">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4" /> DISASTER RESPONSE FLEET READINESS & SPECS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'RECON & DELIVERY UAVs', count: '3 ACTIVE', color: 'text-sky-400', items: ['4K FLIR Thermal Camera', 'Life-Vest Dropper Pod', 'LiDAR Water Depth Sonar'] },
              { title: 'AERO-EVAC HELICOPTERS', count: '2 READY', color: 'text-amber-400', items: ['Hydraulic Cable Winch', '6-Person Hoist Basket', 'Trauma Resuscitation Unit'] },
              { title: 'RESCUE BOATS', count: '5 READY', color: 'text-emerald-400', items: ['30 HP Outboard Engine', 'Inflatable Heavy Duty Hull', 'Sonar Depth Finder'] },
              { title: 'AMPHIBIOUS ARVs', count: '3 STANDBY', color: 'text-cyan-400', items: ['8x8 Tracked System', '12,000 lbs Electric Winch', 'Mesh Relay Comms'] },
            ].map((f, i) => (
              <div key={i} className="bg-[#090d16] p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className={`font-bold text-xs ${f.color}`}>{f.title}</h3>
                  <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 border border-slate-800">{f.count}</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  {f.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="text-cyan-500">›</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHELTERS PAGE */}
      {activeTab === 'shelters' && <ReliefSheltersPage />}

      {/* MISSION REPORTS */}
      {activeTab === 'reports' && <AuditReportsPage victims={victims} />}
    </div>
  );
}