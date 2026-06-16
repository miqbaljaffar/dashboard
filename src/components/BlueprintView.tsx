import React, { useState } from 'react';
import {
  FileCode2,
  Database,
  Network,
  GitBranch,
  BookOpen,
  MousePointerClick,
  Smartphone,
  Compass,
  Milestone,
  Terminal,
  Printer
} from 'lucide-react';

export default function BlueprintView() {
  const [activeSpecTab, setActiveSpecTab] = useState<'architecture' | 'database' | 'apis' | 'ux' | 'roadmap'>('architecture');

  const printDocs = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-indigo-600 animate-pulse" />
            System Architecture & Engineering Specification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Production blueprints for database schemas, REST APIs, layout wireframes, UX rationales, and the future development roadmap.
          </p>
        </div>
        
        <button
          onClick={printDocs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Export Blueprint spec
        </button>
      </div>

      {/* SUB-MENU SPEC SELECTOR */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-4 scrollbar-hidden">
        {[
          { id: 'architecture', label: '1. Information & Page Layout', icon: Network },
          { id: 'database', label: '2. Relational Schema & ERD', icon: Database },
          { id: 'apis', label: '3. Web APIs Specification', icon: Terminal },
          { id: 'ux', label: '4. UX Rationale & Mobile UX', icon: Smartphone },
          { id: 'roadmap', label: '5. Future Feature Roadmap', icon: Milestone }
        ].map(tb => {
          const Icon = tb.icon;
          const isActive = tb.id === activeSpecTab;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveSpecTab(tb.id as any)}
              className={`flex items-center gap-1.5 pb-2.5 text-xs font-bold shrink-0 transition-all border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-indigo-600 text-indigo-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* RENDER SPEC SECTIONS */}
      {activeSpecTab === 'architecture' && (
        <div className="space-y-6">
          
          {/* Information Architecture */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 pb-2">
              <Network className="h-4.5 w-4.5 text-indigo-600" />
              1. Information Architecture Map
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Centralized platform architecture is structured around three primary clusters: **Academic Operations**, **Dormitory Operations (Asrama)**, and **Administrative/Executive Insights**.
            </p>

            <div className="border border-slate-200 rounded p-4 bg-slate-50 font-mono text-[11px] text-slate-700 leading-relaxed overflow-x-auto">
              {`UTB Banjar Platform Root (UTB System Node)
 ├── 📊 Dashboard Overview Node
 │    ├── KPI Matrix (Total Students, Dorm Bed Count, Attendance Ratio, Grades Average)
 │    ├── Visual Analytics charts (Attendance trend, Homework Completion, Behavioral Score Spread)
 │    └── Timely Timelines (Today's classes, Prometric Exams roster)
 ├── 🎓 Student Management Node
 │    ├── Candidate Personal Profile Metadata (ID, cohort, classroom, age, target date)
 │    ├── Japan SSW specialties indexes (Kaigo caregiver, Inshokuten preparation)
 │    ├── JLPT target simulation scoring tracker (Mock evaluations N5 to N3)
 │    └── Housing Mapping registers (Dormitory hall, room codes, curfew checks)
 ├── 📝 Daily Reports Node (Nippou)
 │    ├── Study Durations logged
 │    ├── Blockers / Difficult materials metrics
 │    └── Review & feedback Comment boxes
 ├── 🏠 Dormitory Management Node
 │    ├── Room housekeeping checklists
 │    ├── Morning cleanliness score (Morning inspection 05:30)
 │    └── Evening lights and smartphone lock up checklist
 └── 🛡️ Discipline & Merit Nodes
      ├── Violation points deduction register
      └── Restorative merit points system`}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1">
              <Compass className="h-4 w-4 text-indigo-600" />
              Navigation & Role Permissions Matrix
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamic system navigation switches menu visibility to minimize staff human errors and enforce secure data segmentation.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 text-xs rounded">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9px]">
                    <th className="p-2 border-r border-slate-200">Module Router</th>
                    <th className="p-2 border-r border-slate-100 text-center">Administrator</th>
                    <th className="p-2 border-r border-slate-100 text-center">Management</th>
                    <th className="p-2 border-r border-slate-100 text-center">Language Teacher</th>
                    <th className="p-2 border-r border-slate-100 text-center">Dorm Supervisor</th>
                    <th className="p-2 text-center">Student Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-semibold bg-slate-50/50 border-r border-slate-200">Dashboard Metrics</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Full</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Full (Agg)</td>
                    <td className="p-2 text-center text-indigo-700 bg-indigo-50 font-medium border-r border-slate-100">Academic focus</td>
                    <td className="p-2 text-center text-indigo-700 bg-indigo-50 font-medium border-r border-slate-100">Dorm focus</td>
                    <td className="p-2 text-center text-emerald-700 bg-emerald-50 font-medium">Self-Only</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-slate-50/50 border-r border-slate-200">Student Directory</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Full</td>
                    <td className="p-2 text-center text-indigo-700 bg-indigo-50 font-medium border-r border-slate-100">Read-Only</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Edit Permissions</td>
                    <td className="p-2 text-center text-slate-400 bg-slate-50 border-r border-slate-100">None</td>
                    <td className="p-2 text-center text-slate-400 bg-slate-50">None</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-slate-50/50 border-r border-slate-200">Attendance sheets</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Full</td>
                    <td className="p-2 text-center text-indigo-700 bg-indigo-50 font-medium border-r border-slate-100">Read-Only</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Sign Classroom</td>
                    <td className="p-2 text-center text-indigo-700 bg-indigo-50 font-medium border-r border-slate-100">Sign Night</td>
                    <td className="p-2 text-center text-slate-400 bg-slate-50">None</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-slate-50/50 border-r border-slate-200">Housekeeping checklists</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Full</td>
                    <td className="p-2 text-center text-indigo-700 bg-indigo-50 font-medium border-r border-slate-100">Read-Only</td>
                    <td className="p-2 text-center text-slate-400 bg-slate-50 border-r border-slate-100">None</td>
                    <td className="p-2 text-center text-green-700 bg-green-50 font-bold border-r border-slate-100">Inspect/Rate</td>
                    <td className="p-2 text-center text-slate-400 bg-slate-50">None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeSpecTab === 'database' && (
        <div className="space-y-6">
          
          {/* Relational DDL */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-indigo-600" />
              Copyable relational schema schema (PostgreSQL DDL)
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              The recommended relational layout for a high-performance database setup (PostgreSQL/Cloud SQL):
            </p>

            <div className="relative group">
              <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-[10.5px] rounded-lg overflow-x-auto leading-relaxed max-h-96">
{`-- 1. STUDENTS TABLE
CREATE TABLE lpk_students (
    student_id VARCHAR(30) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    gender VARCHAR(10) CHECK(gender IN ('Male', 'Female')),
    age INT,
    cohort VARCHAR(30) NOT NULL,
    classroom VARCHAR(50) NOT NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    graduation_target DATE,
    jlpt_target VARCHAR(10) CHECK(jlpt_target IN ('N5','N4','N3','N2','N1')),
    current_jlpt VARCHAR(10),
    jft_target VARCHAR(20),
    ssw_field VARCHAR(50),
    interview_readiness VARCHAR(30),
    emergency_name VARCHAR(120),
    emergency_phone VARCHAR(35),
    dorm_building VARCHAR(50),
    dorm_room VARCHAR(20),
    dorm_bed INT,
    status VARCHAR(20) DEFAULT 'Active'
);

-- 2. DAILY ATTENDANCE RECORD
CREATE TABLE lpk_attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id VARCHAR(30) REFERENCES lpk_students(student_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    shift_morning VARCHAR(20) CHECK(shift_morning IN ('Present','Late','Sick','Permission','Absent')),
    shift_class VARCHAR(20) CHECK(shift_class IN ('Present','Late','Sick','Permission','Absent')),
    shift_evening VARCHAR(20) CHECK(shift_evening IN ('Present','Late','Sick','Permission','Absent')),
    verifier_id VARCHAR(50),
    UNIQUE(student_id, attendance_date)
);

-- 3. INTERACTIVE DAILY REPORTS (NIPPOU)
CREATE TABLE lpk_daily_reports (
    report_id SERIAL PRIMARY KEY,
    student_id VARCHAR(30) REFERENCES lpk_students(student_id),
    report_date DATE NOT NULL,
    learned_today TEXT NOT NULL,
    difficult_material TEXT,
    study_hours NUMERIC(4,2),
    self_evaluation INT,
    mood_marker VARCHAR(20),
    tomorrow_target TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    feedback_comment TEXT
);

-- 4. DORMITORY ROOM INSPECTION STATUS
CREATE TABLE lpk_dorm_cleanliness (
    inspection_id SERIAL PRIMARY KEY,
    building VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    inspection_date DATE NOT NULL,
    sanitation_score INT CHECK(sanitation_score BETWEEN 0 AND 100),
    bed_linen VARCHAR(30),
    laundry VARCHAR(30)
);`}
              </pre>
            </div>
          </div>

          {/* ERD Connections */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <GitBranch className="h-4.5 w-4.5 text-indigo-600" />
              ERD Structural Mapping Relationships
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              - **lpk_students 1:N lpk_attendance**: Tracking multiple shifts, enforcing cascading rules so a pupil deletion cleans historic daily logs.
              - **lpk_students 1:N lpk_daily_reports**: Accumulating daily Nippou logs representing performance and vocabulary struggles.
              - **lpk_students 1:N lpk_discipline_logs**: Documenting behavioral score variances.
              - **lpk_dorm_cleanliness 1:N lpk_cleanliness_checklists**: Storing morning and sleep audits linked by building/room codes.
            </p>
          </div>

        </div>
      )}

      {activeSpecTab === 'apis' && (
        <div className="space-y-6">
          
          {/* Web APIs table and structures */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Terminal className="h-4.5 w-4.5 text-indigo-600" />
              SaaS REST API Specs (Endpoint matrix)
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Standard REST end points required by web client requests to push or synchronize data tables:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9px]">
                    <th className="p-3">HTTP Verbs</th>
                    <th className="p-3">URI Template Mapping</th>
                    <th className="p-3">Query Params & Body Payload keys</th>
                    <th className="p-3">Expected HTTP Code Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-mono font-bold text-blue-600">GET</td>
                    <td className="p-3 font-mono font-medium">/api/students</td>
                    <td className="p-3 text-[11px] font-mono">?cohort=Cohort24&status=Active</td>
                    <td className="p-3 text-green-700 font-bold font-mono">200 [JSON Array]</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-green-600">POST</td>
                    <td className="p-3 font-mono font-medium">/api/students</td>
                    <td className="p-3 text-[11px] font-mono">{`{ name, ssw_field, emergency }`}</td>
                    <td className="p-3 text-green-700 font-bold font-mono">201 created</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-indigo-600">PATCH</td>
                    <td className="p-3 font-mono font-medium">/api/students/:id/attendance</td>
                    <td className="p-3 text-[11px] font-mono">{`{ date, morning_shift_status }`}</td>
                    <td className="p-3 text-green-700 font-bold font-mono">200 synced</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-green-600">POST</td>
                    <td className="p-3 font-mono font-medium">/api/reports/nippou</td>
                    <td className="p-3 text-[11px] font-mono">{`{ learned_today, tomorrow_target }`}</td>
                    <td className="p-3 text-green-700 font-bold font-mono">201 created</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-indigo-600">PATCH</td>
                    <td className="p-3 font-mono font-medium">/api/reports/nippou/:id/review</td>
                    <td className="p-3 text-[11px] font-mono">{`{ status: 'Approved', comment }`}</td>
                    <td className="p-3 text-green-700 font-bold font-mono">200 synced</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeSpecTab === 'ux' && (
        <div className="space-y-6">
          
          {/* UX Design Decisions inside UTB Banjar training environment */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">
              Student-first and instructor-first UX rationale
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Japanese Training Context (Culture first)</h4>
                <p>
                  Training centers preparing candidate students for Tokutei Ginou do not just teach Hiragana; they build the <strong>Japanese Discipline (Shitsuke)</strong> required for physical manufacturing and caregiver industries, where high obedience is essential.
                </p>
                <p>
                  Our UX implements instant status visualizers for morning wake-up hours and cleaning checklist ratings, shifting the focus from paper files into immediate visual rankings that stimulate competition and self-governance.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">The Digital Nippou reflection pattern</h4>
                <p>
                  The Daily Report is modeled directly after vertical Japanese handwriting grids (Genko Yoshi frameworks). Providing immediate feedback boxes for teachers directly replicates the mentor-protege bond (Kohai & Senpai relationships).
                </p>
              </div>
            </div>
          </div>

          {/* Mobile responsiveness strategy */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Smartphone className="h-4.5 w-4.5 text-indigo-600" />
              Mobile responsiveness strategy
            </h3>

            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-2 leading-relaxed">
              <li>
                <strong>One-Handed Roll Call Registers</strong>: Attendance drop down selectors and radio grids fold on small screen monitors into horizontal touch lists of 45 pixels minimum height, accommodating instructors conducting physical wake up checks.
              </li>
              <li>
                <strong>Pinch-free statistical charts</strong>: Analytics graphs dynamically wrap via `ResponsiveContainer` and hide grid axes on mobile devices to preserve readability.
              </li>
              <li>
                <strong>Fast student logins</strong>: A clean vertical form interface optimized for standard budget mobile devices used by Indonesian students.
              </li>
            </ul>
          </div>

        </div>
      )}

      {activeSpecTab === 'roadmap' && (
        <div className="space-y-6">
          
          {/* Future features roadmap */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Milestone className="h-4.5 w-4.5 text-indigo-600" />
              UTB Banjar Future Feature Roadmap
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              The product roadmap is designed across three subsequent phases to shift the UTB Banjar platform into a regional AI education hub:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              
              <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-md">
                <span className="font-extrabold text-blue-600 font-mono text-[10px] block">PHASE 1 - NEAR TERM</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">AI Voice & Pronunciation checker (Mock interview)</h4>
                <p className="mt-2 leading-relaxed">
                  Integrating Gemini Audio API patterns to let students conduct simulated Japanese interviews, grading pronunciation accent levels and speed responses dynamically in real-time.
                </p>
              </div>

              <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-md">
                <span className="font-extrabold text-indigo-600 font-mono text-[10px] block">PHASE 2 - MID TERM</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">Automatic Prometric Passport/VISA flow Tracker</h4>
                <p className="mt-2 leading-relaxed">
                  A centralized document collection registry to map COE (Certificate of Eligibility), embassy VISA requests, and Prometric score cards, keeping partner Japanese employers updated on deployment pipelines.
                </p>
              </div>

              <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-md">
                <span className="font-extrabold text-emerald-600 font-mono text-[10px] block">PHASE 3 - LONG TERM</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">Kizuna Job Matching & Alumnus support network</h4>
                <p className="mt-2 leading-relaxed">
                  A matching marketplace pairing current candidates directly with Japanese companies seeking caregiver or restaurant specialists, complete with contract translators and post-deployment housing tracking.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
