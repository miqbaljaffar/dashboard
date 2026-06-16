import React, { useState } from 'react';
import { Student, DormRoom } from '../types';
import {
  Home,
  CheckCircle,
  AlertTriangle,
  Award,
  Sparkles,
  HelpCircle,
  Clock,
  Shield,
  Activity,
  User,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface DormitoryViewProps {
  students: Student[];
  rooms: DormRoom[];
  onUpdateRoomCleanliness: (building: string, roomNumber: string, score: number, bedArr: any, hygi: any, laund: any) => void;
  role: string;
}

export default function DormitoryView({
  students,
  rooms,
  onUpdateRoomCleanliness,
  role
}: DormitoryViewProps) {
  
  const [selectedRoomId, setSelectedRoomId] = useState('Room 103');
  const [selectedBuilding, setSelectedBuilding] = useState('Fuji Hall');

  const activeRoom = rooms.find(r => r.roomNumber === selectedRoomId && r.building === selectedBuilding) || rooms[0];

  // Room Inspector fields
  const [tempScore, setTempScore] = useState(activeRoom?.cleanlinessScore || 80);
  const [tempBed, setTempBed] = useState<'Excellent' | 'Fair' | 'Disorderly'>(activeRoom?.bedArrangement || 'Excellent');
  const [tempHygiene, setTempHygiene] = useState<'Excellent' | 'Good' | 'Needs Improvement'>(activeRoom?.hygieneStatus || 'Good');
  const [tempLaundry, setTempLaundry] = useState<'Clean' | 'Piled Up'>(activeRoom?.laundryStatus || 'Clean');

  // Track if we changed search selection to reset inspectors sliders
  const handleRoomSelect = (building: string, roomNum: string) => {
    setSelectedBuilding(building);
    setSelectedRoomId(roomNum);
    const targetRoom = rooms.find(r => r.roomNumber === roomNum && r.building === building);
    if (targetRoom) {
      setTempScore(targetRoom.cleanlinessScore);
      setTempBed(targetRoom.bedArrangement);
      setTempHygiene(targetRoom.hygieneStatus);
      setTempLaundry(targetRoom.laundryStatus);
    }
  };

  const handleInspectSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRoomCleanliness(selectedBuilding, selectedRoomId, tempScore, tempBed, tempHygiene, tempLaundry);
    alert(`Dorm inspection data saved: ${selectedBuilding} ${selectedRoomId} cleanliness score now at ${tempScore}%!`);
  };

  // Get occupants list in selected room
  const occupants = students.filter(s => s.status === 'Active' && s.dormBuilding === selectedBuilding && s.dormRoom === selectedRoomId);

  // Sorting helper for CLEANEST ROOMS
  const sortedRooms = [...rooms].sort((a,b) => b.cleanlinessScore - a.cleanlinessScore);

  // Core housing inspections checklists
  const [mornChecklist, setMornChecklist] = useState({
    wakeUpAlarms: true,
    futonFolded: true,
    toiletScrubbed: false,
    lockersTidy: true,
  });

  const [eveChecklist, setEveChecklist] = useState({
    pajamaRule: true,
    lightsOff: false,
    noPhoneCurfew: false,
    trashEmptied: true
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Home className="h-5 w-5 text-blue-600" />
          Dormitory (Asrama) Operations Management
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Japanese school standard requires absolute cleanliness, structured bed arrangement, and hygiene discipline. Track cleanliness surveys and log curfew inspections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ROOM LIST & HOUSEKEEPING RANKINGS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Room Cards Matrix */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2 mb-4">
              Housing Rooms & Occupancy Grid
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="dorm-rooms-layout">
              {rooms.map((room, idx) => {
                const isSelected = room.roomNumber === selectedRoomId && room.building === selectedBuilding;
                const isLowCleanliness = room.cleanlinessScore < 70;
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleRoomSelect(room.building, room.roomNumber)}
                    className={`p-4 border rounded-lg transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/10 ring-2 ring-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isLowCleanliness && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    )}
                    <p className="text-[10px] font-bold text-slate-400 font-mono">{room.building}</p>
                    <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{room.roomNumber}</h4>
                    
                    <div className="text-xs text-slate-600 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Cleanliness:</span>
                        <strong className={`font-mono font-bold ${isLowCleanliness ? 'text-red-600' : 'text-slate-800'}`}>
                          {room.cleanlinessScore}%
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Occupants:</span>
                        <span className="font-semibold">{room.occupied} / {room.capacity} Beds</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${
                        isLowCleanliness ? 'bg-red-500' : 'bg-blue-600'
                      }`} style={{ width: `${room.cleanlinessScore}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cleanliness Inspector Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-3xs">
            <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Room Inspector Tool - {selectedBuilding} {selectedRoomId}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Evaluate lockers sanitation, bed linens and individual storage logs.</p>
              </div>
              <span className="text-[11px] bg-slate-50 font-bold px-2 py-0.5 rounded text-slate-500 font-mono">
                Active selected: {occupants.length} occupants
              </span>
            </div>

            {/* Room Occupants */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Room Occupants Directory</label>
              <div className="flex gap-2 flex-wrap">
                {occupants.length === 0 ? (
                  <span className="text-xs text-slate-400">None mapped to this room currently.</span>
                ) : (
                  occupants.map(occ => (
                    <span key={occ.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-xs text-slate-700 font-medium font-mono">
                      <User className="h-3 w-3 text-slate-400" />
                      {occ.name} ({occ.id})
                    </span>
                  ))
                )}
              </div>
            </div>

            {role === 'TEACHER' || role === 'STUDENT' ? (
              <p className="text-xs text-slate-400 py-3 block text-slate-500 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                ⚠️ Read-Only Mode: You are logged in as {role}. Cleanliness and physical room inspection ratings are exclusively modifiable by the <strong>Dormitory Supervisor</strong> or <strong>Administrator</strong>.
              </p>
            ) : (
              <form onSubmit={handleInspectSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daily cleanliness score: <strong className="text-blue-600 font-mono">{tempScore}%</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      value={tempScore}
                      onChange={(e) => setTempScore(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium mt-1">
                      <span className="text-red-500">0% Critical</span>
                      <span>50% Fair</span>
                      <span className="text-green-600">100% Perfect</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Futon fold status</label>
                    <div className="flex gap-2 text-xs">
                      {['Excellent', 'Fair', 'Disorderly'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTempBed(option as any)}
                          className={`flex-1 p-2 border rounded-sm font-semibold transition ${
                            tempBed === option 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lockers Hygiene status</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-medium"
                      value={tempHygiene}
                      onChange={(e) => setTempHygiene(e.target.value as any)}
                    >
                      <option value="Excellent">Excellent Cleanliness</option>
                      <option value="Good">Satisfactory / Good</option>
                      <option value="Needs Improvement">Needs Improvement / Bawahi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Laundry Baskets status</label>
                    <div className="flex gap-2">
                      {['Clean', 'Piled Up'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTempLaundry(option as any)}
                          className={`flex-1 p-2 border rounded-sm text-xs font-semibold transition ${
                            tempLaundry === option 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-2 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="h-4 w-4" />
                    Save Room Inspection
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

        {/* SPECIAL INSPECTION CHECKLISTS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Checklist 1: Morning 05:30 Check */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-3">
            <h3 className="text-xs font-bold text-slate-950 uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>05:30 Morning Inspection</span>
              <Clock className="h-4 w-4 text-emerald-600" />
            </h3>

            <p className="text-[10px] text-slate-400">Verifying daily physical training and morning study conditions:</p>

            <div className="space-y-2 mt-2">
              <label id="lbl-wake-up" className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-wake"
                  className="mt-0.5 shrink-0 accent-blue-600 rounded"
                  checked={mornChecklist.wakeUpAlarms}
                  onChange={(e) => setMornChecklist({ ...mornChecklist, wakeUpAlarms: e.target.checked })}
                />
                <div>
                  <strong className="block font-semibold">Alarms Wake-Up (05:00)</strong>
                  <span className="text-[10px] text-slate-400">All students out of beds with no exceptions.</span>
                </div>
              </label>

              <label id="lbl-futon" className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-futon"
                  className="mt-0.5 shrink-0 accent-blue-600 rounded"
                  checked={mornChecklist.futonFolded}
                  onChange={(e) => setMornChecklist({ ...mornChecklist, futonFolded: e.target.checked })}
                />
                <div>
                  <strong className="block font-semibold">Futons Folded (Tatami style)</strong>
                  <span className="text-[10px] text-slate-400">Linens properly tucked and lockers closed.</span>
                </div>
              </label>

              <label id="lbl-toilet" className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-toilet"
                  className="mt-0.5 shrink-0 accent-blue-600 rounded"
                  checked={mornChecklist.toiletScrubbed}
                  onChange={(e) => setMornChecklist({ ...mornChecklist, toiletScrubbed: e.target.checked })}
                />
                <div>
                  <strong className="block font-semibold">Toilet Scrubbed</strong>
                  <span className="text-[10px] text-slate-400">Bathroom area meets standards.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Checklist 2: Evening 21:00 Curfew Check */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-3">
            <h3 className="text-xs font-bold text-slate-950 uppercase border-b border-slate-100 pb-2 flex items-center justify-between animate-pulse">
              <span>21:00 Curfew Roll-Call</span>
              <Clock className="h-4 w-4 text-orange-600" />
            </h3>

            <p className="text-[10px] text-slate-400">Checking final physical locks and bedroom curfews:</p>

            <div className="space-y-2 mt-2">
              <label id="lbl-pyjama" className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-pyj"
                  className="mt-0.5 shrink-0 accent-blue-600 rounded"
                  checked={eveChecklist.pajamaRule}
                  onChange={(e) => setEveChecklist({ ...eveChecklist, pajamaRule: e.target.checked })}
                />
                <div>
                  <strong className="block font-semibold">Pajama Dress-code rule</strong>
                  <span className="text-[10px] text-slate-400">Uniform neatness must be met in social areas.</span>
                </div>
              </label>

              <label id="lbl-lightsoff" className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-lights"
                  className="mt-0.5 shrink-0 accent-blue-600 rounded"
                  checked={eveChecklist.lightsOff}
                  onChange={(e) => setEveChecklist({ ...eveChecklist, lightsOff: e.target.checked })}
                />
                <div>
                  <strong className="block font-semibold">Lights Off (22:00)</strong>
                  <span className="text-[10px] text-slate-400">Bedroom core lights disabled for deep sleep.</span>
                </div>
              </label>

              <label id="lbl-no-phone" className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="chk-phone"
                  className="mt-0.5 shrink-0 accent-blue-600 rounded"
                  checked={eveChecklist.noPhoneCurfew}
                  onChange={(e) => setEveChecklist({ ...eveChecklist, noPhoneCurfew: e.target.checked })}
                />
                <div>
                  <strong className="block font-semibold">Phone Locker Curfew</strong>
                  <span className="text-[10px] text-slate-400">Cell phones locked inside corridors safes.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Cleanest vs Dirtiest Room Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase">
              Housing Cleanliness Ranks
            </h3>

            <div className="space-y-2 mt-2">
              {sortedRooms.map((r, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-1.5 px-2.5 bg-slate-50 border border-slate-100 rounded">
                  <div className="flex gap-2">
                    <span className="font-bold text-indigo-700">#{i+1}</span>
                    <span className="text-slate-700 font-semibold">{r.building} {r.roomNumber}</span>
                  </div>
                  <span className={`font-mono font-bold ${
                    r.cleanlinessScore >= 90 ? 'text-green-600' : r.cleanlinessScore >= 75 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {r.cleanlinessScore}% pts
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
