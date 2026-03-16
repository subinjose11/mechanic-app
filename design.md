import { useState, useRef, useMemo } from "react";

// ─── DATA ────────────────────────────────────────────────
const INIT_CUSTOMERS = [
  {
    id:"C001", name:"Rajesh Kumar", phone:"98765 43210", email:"rajesh@email.com",
    city:"Coimbatore", since:"Jan 2025", avatar:"RK",
    vehicles:[
      { id:"V001", make:"Honda", model:"City", year:"2021", reg:"TN11AB1234", color:"Pearl White", fuel:"Petrol", km:"35200", type:"car" },
      { id:"V002", make:"Honda", model:"Activa 6G", year:"2023", reg:"TN11CD5678", color:"Matte Black", fuel:"Petrol", km:"11800", type:"bike" },
    ],
  },
  {
    id:"C002", name:"Priya Nair", phone:"99887 76655", email:"", city:"Coimbatore",
    since:"Mar 2025", avatar:"PN",
    vehicles:[
      { id:"V003", make:"Maruti", model:"Swift", year:"2020", reg:"KL12XX4567", color:"Red", fuel:"Petrol", km:"48000", type:"car" },
    ],
  },
  {
    id:"C003", name:"Suresh Babu", phone:"91234 56789", email:"suresh@gmail.com",
    city:"Tiruppur", since:"Nov 2024", avatar:"SB",
    vehicles:[
      { id:"V004", make:"Toyota", model:"Fortuner", year:"2020", reg:"TN41BZ9900", color:"Silver", fuel:"Diesel", km:"62000", type:"suv" },
      { id:"V005", make:"Royal Enfield", model:"Classic 350", year:"2022", reg:"TN41XY2211", color:"Gunmetal", fuel:"Petrol", km:"18500", type:"bike" },
    ],
  },
  {
    id:"C004", name:"Anitha Ravi", phone:"96543 21098", email:"",
    city:"Coimbatore", since:"Jun 2025", avatar:"AR",
    vehicles:[
      { id:"V006", make:"Hyundai", model:"i20", year:"2019", reg:"TN07CD5678", color:"Blue", fuel:"Petrol", km:"52000", type:"car" },
    ],
  },
];

const INIT_JOBS = [
  { id:"JB-0041", customerId:"C001", vehicleId:"V001", date:"2 Mar 2026", status:"completed",
    complaint:"Engine noise on cold start", services:["Oil Change","Engine Tune-Up"],
    parts:[{ id:"p1", name:"Engine Oil 5W-30", qty:"4", price:"350" }],
    labor:"600", advance:"500" },
  { id:"JB-0040", customerId:"C002", vehicleId:"V003", date:"2 Mar 2026", status:"in-progress",
    complaint:"AC not cooling, brake squeal",services:["AC Service","Brake Service"],
    parts:[{ id:"p2", name:"AC Refrigerant", qty:"1", price:"800" }],
    labor:"900", advance:"300" },
  { id:"JB-0039", customerId:"C003", vehicleId:"V004", date:"1 Mar 2026", status:"waiting",
    complaint:"Full service due, wheel wobble",services:["Full Inspection","Wheel Alignment","Brake Service"],
    parts:[{ id:"p3", name:"Brake Pads Front", qty:"1", price:"1200" },{ id:"p4", name:"Air Filter", qty:"1", price:"450" }],
    labor:"1500", advance:"1000" },
  { id:"JB-0038", customerId:"C001", vehicleId:"V002", date:"28 Feb 2026", status:"completed",
    complaint:"Chain slack, suspension noise",services:["Chain Adjustment","Suspension Check"],
    parts:[{ id:"p5", name:"Chain Lubricant", qty:"1", price:"180" }],
    labor:"300", advance:"480" },
];

const SERVICES_PRESET = [
  "Oil Change","Brake Service","AC Service","Engine Tune-Up","Wheel Alignment",
  "Tyre Rotation","Battery Service","Full Inspection","Suspension Check",
  "Radiator Flush","Chain Adjustment","Clutch Service","Headlight Restoration",
];

const uid = () => Math.random().toString(36).slice(2,8);
const fmt = n => Number(n||0).toLocaleString("en-IN");
const calcJob = j => {
  const parts = (j.parts||[]).reduce((s,p)=>s+(parseFloat(p.qty)||0)*(parseFloat(p.price)||0),0);
  const labor = parseFloat(j.labor)||0;
  const total = parts+labor;
  const advance = parseFloat(j.advance)||0;
  return { parts, labor, total, advance, balance:Math.max(0,total-advance) };
};
const vIcon = v => {
  if(!v) return "🚗";
  const t = (v.type||"").toLowerCase();
  const m = (v.model||"").toLowerCase();
  if(t==="bike"||m.includes("activa")||m.includes("350")||m.includes("classic")||m.includes("dio")) return "🛵";
  if(t==="suv"||m.includes("fortuner")||m.includes("innova")||m.includes("creta")) return "🚙";
  if(t==="auto") return "🛺";
  return "🚗";
};

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@400;500&display=swap');

*{ box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }

:root{
  --bg:       #08080c;
  --bg1:      #0d0d12;
  --bg2:      #111118;
  --bg3:      #16161f;
  --bg4:      #1c1c27;
  --line:     #ffffff0d;
  --line2:    #ffffff16;
  --line3:    #ffffff22;
  --text:     #f0f0f8;
  --text2:    #9090a8;
  --text3:    #55556a;
  --blue:     #6366f1;
  --blue-dim: rgba(99,102,241,0.12);
  --blue-glow:rgba(99,102,241,0.35);
  --blue-border:rgba(99,102,241,0.28);
  --cyan:     #22d3ee;
  --cyan-dim: rgba(34,211,238,0.1);
  --green:    #10b981;
  --green-dim:rgba(16,185,129,0.12);
  --green-bdr:rgba(16,185,129,0.3);
  --red:      #f43f5e;
  --red-dim:  rgba(244,63,94,0.12);
  --red-bdr:  rgba(244,63,94,0.3);
  --amber:    #f59e0b;
  --amber-dim:rgba(245,158,11,0.12);
  --amber-bdr:rgba(245,158,11,0.3);
  --r:        14px;
  --r2:       18px;
}

body{ background:#050508; font-family:'Bricolage Grotesque',sans-serif; color:var(--text); }

/* ── SHELL ── */
.shell{
  display:flex; justify-content:center; align-items:center; min-height:100vh;
  background:radial-gradient(ellipse 120% 70% at 50% -10%, #1a1030 0%, #050508 55%);
  padding:16px;
}
.phone{
  width:393px; height:852px;
  background:var(--bg); border-radius:48px;
  border:1.5px solid #ffffff0a;
  box-shadow:
    0 0 0 8px #0a0a10,
    0 0 0 9px #ffffff05,
    0 60px 120px rgba(0,0,0,0.9),
    0 0 100px rgba(99,102,241,0.06);
  overflow:hidden; display:flex; flex-direction:column; position:relative;
}

/* ── STATUS BAR ── */
.sbar{
  height:50px; background:var(--bg); flex-shrink:0;
  display:flex; align-items:flex-end; justify-content:space-between;
  padding:0 26px 10px;
}
.sbar-time{ font-family:'DM Mono',monospace; font-size:14px; font-weight:500; }
.sbar-right{ display:flex; gap:5px; align-items:center; font-size:13px; color:var(--text2); }

.screen{ flex:1; overflow-y:auto; overflow-x:hidden; scrollbar-width:none; }
.screen::-webkit-scrollbar{ display:none; }

/* ── BOTTOM NAV ── */
.bnav{
  height:80px; background:rgba(8,8,12,0.95); flex-shrink:0;
  border-top:1px solid var(--line2); backdrop-filter:blur(24px);
  display:flex; align-items:center; padding:0 6px 10px;
}
.ni{
  flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
  padding:9px 4px; border-radius:14px; cursor:pointer; border:none; background:transparent;
  transition:background 0.2s;
}
.ni-ico{ font-size:20px; opacity:0.3; transition:opacity 0.2s; }
.ni-lbl{ font-size:9px; font-weight:600; color:var(--text3); letter-spacing:0.6px; text-transform:uppercase; transition:color 0.2s; }
.ni.on .ni-ico{ opacity:1; }
.ni.on .ni-lbl{ color:var(--blue); }
.ni.on{ background:var(--blue-dim); }
.fab-col{ display:flex; flex-direction:column; align-items:center; }
.fab{
  width:52px; height:52px; border-radius:16px; border:none;
  background:linear-gradient(135deg,#6366f1,#818cf8);
  display:flex; align-items:center; justify-content:center;
  font-size:24px; color:#fff; cursor:pointer;
  box-shadow:0 4px 20px var(--blue-glow), 0 0 0 1px rgba(99,102,241,0.3);
  transition:transform 0.15s, box-shadow 0.15s;
}
.fab:active{ transform:scale(0.91); }

/* ── COMMON ── */
.topbar{
  display:flex; align-items:center; gap:10px;
  padding:13px 18px;
  background:rgba(8,8,12,0.92); backdrop-filter:blur(20px);
  border-bottom:1px solid var(--line2);
  position:sticky; top:0; z-index:40;
}
.back-btn{
  width:36px; height:36px; background:var(--bg3); border:1px solid var(--line2);
  border-radius:11px; display:flex; align-items:center; justify-content:center;
  font-size:19px; cursor:pointer; color:var(--text); flex-shrink:0;
}
.tb-title{ font-size:17px; font-weight:700; letter-spacing:-0.3px; }
.tb-right{ margin-left:auto; display:flex; gap:8px; }
.ico-btn{
  width:36px; height:36px; background:var(--bg3); border:1px solid var(--line2);
  border-radius:11px; display:flex; align-items:center; justify-content:center;
  font-size:15px; cursor:pointer;
}

/* badges */
.badge{ font-size:10px; font-weight:700; padding:4px 9px; border-radius:20px; letter-spacing:0.4px; white-space:nowrap; }
.b-done{ background:var(--green-dim); color:var(--green); border:1px solid var(--green-bdr); }
.b-active{ background:var(--blue-dim); color:#818cf8; border:1px solid var(--blue-border); }
.b-wait{ background:var(--amber-dim); color:var(--amber); border:1px solid var(--amber-bdr); }

/* ── LOGIN ── */
.login-wrap{
  min-height:100%; display:flex; flex-direction:column;
  align-items:center; justify-content:center; padding:32px;
  background:linear-gradient(160deg,#12103a 0%,#08080c 55%);
  position:relative; overflow:hidden;
}
.login-orb{
  position:absolute; top:-80px; left:50%; transform:translateX(-50%);
  width:280px; height:280px; border-radius:50%;
  background:radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%);
  pointer-events:none;
}
.app-logo{
  width:76px; height:76px; border-radius:22px;
  background:linear-gradient(135deg,#6366f1,#4f46e5);
  display:flex; align-items:center; justify-content:center; font-size:32px;
  box-shadow:0 12px 40px var(--blue-glow); margin-bottom:20px;
}
.app-name{ font-size:30px; font-weight:800; letter-spacing:-0.5px; text-align:center; line-height:1; }
.app-name span{ color:var(--blue); }
.app-tagline{ font-size:12px; color:var(--text3); letter-spacing:2.5px; text-transform:uppercase; margin:8px 0 36px; }
.login-card{
  width:100%; background:var(--bg2);
  border:1px solid var(--line2); border-radius:22px; padding:24px;
}
.login-heading{ font-size:20px; font-weight:700; margin-bottom:4px; }
.login-sub{ font-size:13px; color:var(--text2); margin-bottom:22px; }
.l-inp{
  width:100%; background:var(--bg3); border:1px solid var(--line2);
  border-radius:11px; padding:12px 14px; color:var(--text);
  font-family:'Bricolage Grotesque',sans-serif; font-size:14px;
  outline:none; margin-bottom:10px; transition:border-color 0.2s;
}
.l-inp:focus{ border-color:var(--blue); }
.l-inp::placeholder{ color:var(--text3); }
.login-btn{
  width:100%; background:linear-gradient(135deg,#6366f1,#4f46e5);
  border:none; border-radius:12px; padding:14px;
  font-family:'Bricolage Grotesque',sans-serif; font-size:15px; font-weight:700; color:#fff;
  cursor:pointer; margin-top:6px;
  box-shadow:0 4px 20px var(--blue-glow);
}
.login-link{ text-align:center; font-size:12px; color:var(--text3); margin-top:16px; cursor:pointer; }
.login-link span{ color:var(--blue); font-weight:600; }

/* ── DASHBOARD ── */
.dash-head{
  padding:18px 18px 16px;
  background:linear-gradient(180deg,#10102a 0%,var(--bg) 100%);
  border-bottom:1px solid var(--line);
}
.dash-row1{ display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.shop-tag{
  display:flex; align-items:center; gap:8px;
  background:var(--bg3); border:1px solid var(--line2);
  border-radius:20px; padding:5px 12px 5px 8px;
}
.online-dot{ width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 6px var(--green); animation:blink 2s infinite; }
@keyframes blink{ 0%,100%{ opacity:1; } 50%{ opacity:0.4; } }
.shop-label{ font-size:12px; font-weight:600; color:var(--text2); }
.notif{
  width:34px; height:34px; background:var(--bg3); border:1px solid var(--line2);
  border-radius:11px; display:flex; align-items:center; justify-content:center;
  font-size:16px; cursor:pointer; position:relative;
}
.notif-dot{ position:absolute; top:6px; right:6px; width:6px; height:6px; background:var(--red); border-radius:50%; border:1.5px solid var(--bg); }
.dash-greet{ font-size:25px; font-weight:800; line-height:1.15; letter-spacing:-0.5px; }
.dash-greet em{ color:var(--blue); font-style:normal; }
.dash-date{ font-size:12px; color:var(--text3); margin-top:5px; font-weight:500; }

/* Stat cards */
.stat-row{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:14px 18px; }
.stat{
  background:var(--bg2); border:1px solid var(--line2);
  border-radius:15px; padding:14px 10px; text-align:center;
  position:relative; overflow:hidden;
}
.stat::before{
  content:''; position:absolute; top:-20px; right:-20px;
  width:60px; height:60px; border-radius:50%;
  background:radial-gradient(circle,var(--glow-c,rgba(99,102,241,0.1)) 0%,transparent 70%);
}
.stat[data-c="blue"]{ --glow-c:rgba(99,102,241,0.12); }
.stat[data-c="green"]{ --glow-c:rgba(16,185,129,0.12); }
.stat[data-c="amber"]{ --glow-c:rgba(245,158,11,0.12); }
.stat[data-c="red"]{ --glow-c:rgba(244,63,94,0.12); }
.stat-n{ font-family:'DM Mono',monospace; font-size:28px; font-weight:500; line-height:1; }
.stat-n.blue{ color:var(--blue); }
.stat-n.green{ color:var(--green); }
.stat-n.amber{ color:var(--amber); }
.stat-n.red{ color:var(--red); }
.stat-l{ font-size:9px; font-weight:600; color:var(--text3); letter-spacing:0.6px; text-transform:uppercase; margin-top:4px; }

/* Revenue hero card */
.rev{
  margin:0 18px 14px; padding:18px;
  background:linear-gradient(135deg,#12103a,#0d0d20);
  border:1px solid var(--blue-border); border-radius:18px;
  position:relative; overflow:hidden;
}
.rev-shine{
  position:absolute; top:-40px; right:-40px; width:180px; height:180px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%);
  pointer-events:none;
}
.rev-top{ display:flex; justify-content:space-between; align-items:flex-start; }
.rev-lbl{ font-size:11px; font-weight:600; color:var(--text3); letter-spacing:1px; text-transform:uppercase; }
.rev-up{ display:flex; align-items:center; gap:5px; background:var(--green-dim); border:1px solid var(--green-bdr); color:var(--green); font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
.rev-amt{ font-family:'DM Mono',monospace; font-size:34px; font-weight:500; color:#fff; line-height:1; margin:8px 0 4px; }
.rev-sub{ font-size:11px; color:var(--text3); }
.rev-bar{ height:3px; background:var(--line3); border-radius:99px; margin-top:14px; overflow:hidden; }
.rev-fill{ height:100%; background:linear-gradient(90deg,var(--blue),#818cf8); border-radius:99px; transition:width 0.6s ease; }

/* Section header */
.sec-hdr{ display:flex; align-items:center; justify-content:space-between; padding:4px 18px 10px; }
.sec-lbl{ font-size:11px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; }
.sec-link{ font-size:12px; font-weight:600; color:var(--blue); cursor:pointer; background:none; border:none; }

/* Job cards */
.jobs{ padding:0 18px 24px; display:flex; flex-direction:column; gap:8px; }
.jcard{
  background:var(--bg2); border:1px solid var(--line2); border-radius:18px;
  padding:15px; cursor:pointer;
  transition:border-color 0.2s, background 0.2s;
}
.jcard:hover{ border-color:var(--line3); background:var(--bg3); }
.jcard:active{ transform:scale(0.99); }
.jcard-top{ display:flex; align-items:center; gap:10px; margin-bottom:11px; }
.av{
  width:38px; height:38px; border-radius:12px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-family:'DM Mono',monospace; font-size:13px; font-weight:500; letter-spacing:0.5px;
}
.av-blue{ background:var(--blue-dim); border:1px solid var(--blue-border); color:#818cf8; }
.jcard-name{ font-size:14px; font-weight:700; line-height:1; }
.jcard-id{ font-size:11px; color:var(--text3); margin-top:2px; font-family:'DM Mono',monospace; }
.jcard-veh{
  background:var(--bg3); border-radius:10px; padding:9px 12px;
  display:flex; align-items:center; gap:8px; margin-bottom:10px;
}
.jcard-vn{ font-size:13px; font-weight:600; flex:1; }
.jcard-reg{
  font-family:'DM Mono',monospace; font-size:11px; font-weight:500; color:var(--text2);
  background:var(--bg4); border:1px solid var(--line2); padding:3px 8px; border-radius:7px; letter-spacing:0.8px;
}
.jcard-foot{ display:flex; align-items:flex-end; justify-content:space-between; }
.jcard-meta{ font-size:11px; color:var(--text3); }
.jcard-fin{ text-align:right; }
.jcard-total{ font-family:'DM Mono',monospace; font-size:18px; font-weight:500; }
.jcard-due{ font-size:10px; font-weight:700; color:var(--red); margin-top:2px; }
.jcard-paid{ font-size:10px; font-weight:700; color:var(--green); margin-top:2px; }

/* ── NEW JOB / SEARCH ── */
.nj-head{
  padding:18px 18px 16px;
  background:var(--bg); border-bottom:1px solid var(--line2);
}
.nj-eyebrow{ font-size:11px; font-weight:600; color:var(--blue); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:6px; }
.nj-title{ font-size:22px; font-weight:800; letter-spacing:-0.5px; }
.nj-sub{ font-size:13px; color:var(--text2); margin-top:4px; line-height:1.4; }

.search-wrap{ padding:14px 18px 0; }
.search-row{
  display:flex; align-items:center; gap:10px;
  background:var(--bg2); border:1.5px solid var(--line2);
  border-radius:14px; padding:12px 14px;
  transition:border-color 0.2s;
}
.search-row.focused{ border-color:var(--blue); box-shadow:0 0 0 3px var(--blue-dim); }
.search-ico{ font-size:17px; color:var(--text3); flex-shrink:0; }
.search-inp{
  flex:1; background:transparent; border:none; outline:none;
  font-family:'Bricolage Grotesque',sans-serif; font-size:15px; color:var(--text);
}
.search-inp::placeholder{ color:var(--text3); }
.search-x{ font-size:16px; color:var(--text3); cursor:pointer; flex-shrink:0; }

.results{ padding:16px 18px; }
.res-label{
  display:flex; align-items:center; gap:8px;
  font-size:11px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase;
  margin-bottom:12px;
}
.res-count{ background:var(--blue-dim); color:#818cf8; border:1px solid var(--blue-border); font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }

/* Customer result cards */
.cust-card{
  background:var(--bg2); border:1.5px solid var(--line2); border-radius:18px;
  margin-bottom:10px; overflow:hidden; cursor:pointer;
  transition:border-color 0.2s;
}
.cust-card.open{ border-color:var(--blue-border); }
.cust-card-top{ display:flex; align-items:center; gap:12px; padding:14px; }
.cust-av{ width:44px; height:44px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:14px; font-weight:500; }
.cust-av.blue{ background:var(--blue-dim); border:1px solid var(--blue-border); color:#818cf8; }
.cust-name{ font-size:15px; font-weight:700; line-height:1; }
.cust-phone{ font-size:12px; color:var(--text3); margin-top:3px; }
.cust-v-pill{
  margin-left:auto; display:flex; flex-direction:column; align-items:center;
  background:var(--bg3); border:1px solid var(--line2); border-radius:10px; padding:6px 12px;
}
.cust-v-n{ font-family:'DM Mono',monospace; font-size:17px; font-weight:500; line-height:1; }
.cust-v-l{ font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }
.match-tag{ background:var(--blue-dim); border:1px solid var(--blue-border); color:#818cf8; font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px; display:inline-block; margin-top:5px; }

/* Vehicle selector */
.veh-sel{ border-top:1px solid var(--line2); padding:12px 14px 14px; background:var(--bg3); }
.veh-sel-lbl{ font-size:11px; font-weight:700; color:var(--text3); letter-spacing:1px; text-transform:uppercase; margin-bottom:10px; }
.veh-list{ display:flex; flex-direction:column; gap:7px; }
.veh-row{
  display:flex; align-items:center; gap:10px;
  background:var(--bg2); border:1px solid var(--line2); border-radius:12px;
  padding:11px 12px; cursor:pointer; transition:border-color 0.2s;
}
.veh-row:hover{ border-color:var(--blue-border); }
.veh-ico{ font-size:22px; flex-shrink:0; }
.veh-mn{ font-size:13px; font-weight:700; line-height:1; }
.veh-yr{ font-size:11px; color:var(--text3); margin-top:2px; }
.veh-hist{ font-size:10px; color:var(--text3); margin-left:auto; margin-right:8px; white-space:nowrap; }
.veh-reg-tag{
  font-family:'DM Mono',monospace; font-size:10px; font-weight:500;
  background:var(--bg4); border:1px solid var(--line2); padding:3px 8px;
  border-radius:6px; letter-spacing:0.8px; color:var(--text2); white-space:nowrap;
}
.add-veh-row{
  display:flex; align-items:center; gap:8px;
  background:transparent; border:1px dashed var(--line3); border-radius:12px;
  padding:10px 12px; cursor:pointer; width:100%;
  color:var(--text3); font-size:13px; font-weight:600;
  transition:border-color 0.2s, color 0.2s;
}
.add-veh-row:hover{ border-color:var(--blue); color:var(--blue); }

/* No result */
.no-res{ text-align:center; padding:40px 20px; }
.no-res-ico{ font-size:42px; margin-bottom:14px; opacity:0.5; }
.no-res-t{ font-size:18px; font-weight:700; margin-bottom:6px; }
.no-res-s{ font-size:13px; color:var(--text2); margin-bottom:24px; line-height:1.5; }

/* Before search */
.pre-search{ padding:20px 18px; }
.pre-lbl{ font-size:11px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; }
.recent-list{ display:flex; flex-direction:column; gap:7px; }
.recent-row{
  display:flex; align-items:center; gap:10px;
  background:var(--bg2); border:1px solid var(--line2); border-radius:14px;
  padding:12px 14px; cursor:pointer; transition:border-color 0.2s;
}
.recent-row:hover{ border-color:var(--blue-border); }
.recent-av{ width:36px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:12px; }
.recent-name{ font-size:13px; font-weight:600; flex:1; }
.recent-regs{ font-size:11px; color:var(--text3); margin-top:1px; }
.recent-arr{ color:var(--text3); font-size:18px; }

/* ── FORMS ── */
.form-body{ background:var(--bg); }
.context-bar{
  background:var(--bg2); border-bottom:1px solid var(--line2);
  padding:13px 18px; display:flex; align-items:center; gap:10px;
}
.ctx-av{ width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:13px; font-weight:500; flex-shrink:0; }
.ctx-name{ font-size:14px; font-weight:700; }
.ctx-phone{ font-size:11px; color:var(--text3); margin-top:1px; }
.ctx-veh{
  margin-left:auto; background:var(--bg3); border:1px solid var(--line2);
  border-radius:10px; padding:7px 11px; text-align:right;
}
.ctx-veh-name{ font-size:12px; font-weight:600; }
.ctx-veh-reg{ font-family:'DM Mono',monospace; font-size:10px; color:var(--text3); letter-spacing:0.8px; margin-top:2px; }

.f-block{ padding:20px 18px; border-bottom:1px solid var(--line); }
.f-block-head{ display:flex; align-items:center; gap:10px; margin-bottom:16px; }
.f-block-icon{
  width:32px; height:32px; border-radius:10px;
  display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0;
}
.fbi-blue{ background:var(--blue-dim); border:1px solid var(--blue-border); }
.fbi-green{ background:var(--green-dim); border:1px solid var(--green-bdr); }
.fbi-amber{ background:var(--amber-dim); border:1px solid var(--amber-bdr); }
.fbi-red{ background:var(--red-dim); border:1px solid var(--red-bdr); }
.f-block-title{ font-size:15px; font-weight:700; }
.f-block-sub{ font-size:11px; color:var(--text3); margin-top:1px; }

/* inputs */
.fi,.fs,.ft{
  width:100%; background:var(--bg2); border:1px solid var(--line2);
  border-radius:11px; padding:12px 13px; color:var(--text);
  font-family:'Bricolage Grotesque',sans-serif; font-size:14px;
  outline:none; transition:border-color 0.2s; -webkit-appearance:none;
}
.fi:focus,.fs:focus,.ft:focus{ border-color:var(--blue); box-shadow:0 0 0 3px var(--blue-dim); }
.fi::placeholder{ color:var(--text3); }
.fs option{ background:var(--bg2); }
.ft{ resize:none; min-height:70px; line-height:1.5; }
.f-row{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.f-label{ display:block; font-size:11px; font-weight:600; color:var(--text3); letter-spacing:0.6px; text-transform:uppercase; margin-bottom:6px; }
.f-field{ margin-bottom:12px; }
.f-field:last-child{ margin-bottom:0; }

/* vehicle type */
.vtype-row{ display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }
.vtype-row::-webkit-scrollbar{ display:none; }
.vtype-btn{
  flex-shrink:0; background:var(--bg2); border:1px solid var(--line2);
  border-radius:12px; padding:10px 14px; display:flex; align-items:center; gap:8px;
  cursor:pointer; transition:all 0.15s; white-space:nowrap;
}
.vtype-btn.on{ border-color:var(--blue); background:var(--blue-dim); }
.vtype-btn-ico{ font-size:18px; }
.vtype-btn-lbl{ font-size:12px; font-weight:600; color:var(--text2); }
.vtype-btn.on .vtype-btn-lbl{ color:#818cf8; }

/* services checklist */
.svc-grid{ display:flex; flex-direction:column; gap:7px; }
.svc-item{
  display:flex; align-items:center; gap:10px;
  background:var(--bg2); border:1px solid var(--line2);
  border-radius:11px; padding:11px 13px; cursor:pointer; transition:all 0.15s;
}
.svc-item:hover{ border-color:var(--line3); }
.svc-item.on{ border-color:var(--blue-border); background:var(--blue-dim); }
.svc-label{ font-size:13px; font-weight:500; flex:1; }
.svc-box{
  width:20px; height:20px; border-radius:6px;
  border:1.5px solid var(--line3); display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:all 0.15s;
}
.svc-item.on .svc-box{ background:var(--blue); border-color:var(--blue); }
.svc-tick{ font-size:10px; color:#fff; font-weight:700; }
.custom-row{ display:flex; gap:8px; margin-top:8px; }
.custom-inp{ flex:1; }
.custom-btn{
  background:var(--blue-dim); border:1px solid var(--blue-border);
  border-radius:10px; padding:0 14px; font-size:13px; font-weight:600;
  color:#818cf8; cursor:pointer; white-space:nowrap;
}

/* parts */
.parts-stack{ display:flex; flex-direction:column; gap:10px; }
.part-card{
  background:var(--bg2); border:1px solid var(--line2);
  border-radius:14px; overflow:hidden; position:relative;
}
.part-card-top{
  display:flex; align-items:center; justify-content:space-between;
  padding:10px 12px 0;
}
.part-num{ font-family:'DM Mono',monospace; font-size:10px; font-weight:500; color:var(--blue); letter-spacing:0.8px; }
.part-del{
  width:24px; height:24px; border-radius:8px;
  background:var(--red-dim); border:1px solid var(--red-bdr);
  display:flex; align-items:center; justify-content:center;
  font-size:12px; cursor:pointer; color:var(--red);
}
.part-fields{ padding:8px 12px 12px; display:flex; flex-direction:column; gap:7px; }
.part-2col{ display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.part-total{
  background:linear-gradient(135deg,var(--blue-dim),rgba(99,102,241,0.06));
  border:1px solid var(--blue-border); border-radius:10px; padding:9px 12px;
  display:flex; align-items:center; justify-content:space-between;
}
.pt-lbl{ font-size:11px; color:var(--text3); }
.pt-val{ font-family:'DM Mono',monospace; font-size:18px; font-weight:500; color:#818cf8; }
.add-part{
  width:100%; background:transparent; border:1px dashed var(--line3); border-radius:12px;
  padding:12px; display:flex; align-items:center; justify-content:center; gap:8px;
  cursor:pointer; color:var(--text3); font-size:13px; font-weight:600;
  transition:border-color 0.2s, color 0.2s;
}
.add-part:hover{ border-color:var(--blue); color:var(--blue); }

/* labor */
.labor-card{ background:var(--bg2); border:1px solid var(--line2); border-radius:14px; padding:15px; }
.labor-hint{ font-size:11px; color:var(--text3); margin-bottom:10px; }
.labor-row{ position:relative; }
.labor-sym{ position:absolute; left:13px; top:50%; transform:translateY(-50%); font-family:'DM Mono',monospace; font-size:18px; font-weight:500; color:var(--blue); }
.labor-inp{
  width:100%; background:var(--bg3); border:1px solid var(--line2);
  border-radius:11px; padding:13px 13px 13px 30px;
  font-family:'DM Mono',monospace; font-size:26px; font-weight:500; color:var(--text);
  outline:none; transition:border-color 0.2s;
}
.labor-inp:focus{ border-color:var(--blue); }
.labor-inp::placeholder{ color:var(--text3); }

/* running total */
.total-box{
  background:linear-gradient(135deg,#12103a,#0d0d20);
  border:1px solid var(--blue-border); border-radius:14px; padding:14px 16px; margin-top:12px;
}
.total-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.total-lbl{ font-size:12px; color:var(--text3); }
.total-val{ font-family:'DM Mono',monospace; font-size:13px; color:var(--text2); }
.total-sep{ height:1px; background:var(--line2); margin:8px 0; }
.grand-row{ display:flex; justify-content:space-between; align-items:baseline; }
.grand-lbl{ font-size:13px; font-weight:700; color:var(--text2); }
.grand-val{ font-family:'DM Mono',monospace; font-size:24px; font-weight:500; color:#fff; }

/* photos */
.photos-wrap{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.photo-tile{
  aspect-ratio:1; border-radius:14px; border:1px dashed var(--line3);
  background:var(--bg2); cursor:pointer; overflow:hidden; position:relative;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px;
  transition:border-color 0.2s;
}
.photo-tile:hover{ border-color:var(--blue); }
.photo-tile.has{ border-style:solid; border-color:var(--line2); }
.photo-tile img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.photo-ico{ font-size:26px; opacity:0.35; }
.photo-lbl{ font-size:11px; font-weight:600; color:var(--text3); }
.photo-hover{ position:absolute; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:12px; color:#fff; font-weight:600; opacity:0; transition:opacity 0.2s; }
.photo-tile:hover .photo-hover{ opacity:1; }
.photo-tag{ position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); border-radius:6px; padding:2px 8px; font-size:10px; font-weight:600; color:#fff; z-index:2; }
.photo-category-label{ font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-bottom:9px; }

/* advance / balance */
.adv-row{
  display:flex; align-items:center; gap:12px;
  background:var(--green-dim); border:1px solid var(--green-bdr);
  border-radius:13px; padding:14px 15px; margin-bottom:10px;
}
.adv-ico{ font-size:22px; flex-shrink:0; }
.adv-text{ flex:1; }
.adv-lbl{ font-size:13px; font-weight:700; color:var(--green); }
.adv-sub{ font-size:11px; color:var(--text3); margin-top:1px; }
.adv-inp{
  width:108px; background:rgba(16,185,129,0.1); border:1px solid var(--green-bdr);
  border-radius:9px; padding:8px 10px; text-align:right;
  font-family:'DM Mono',monospace; font-size:20px; font-weight:500; color:var(--green);
  outline:none;
}
.adv-inp:focus{ border-color:var(--green); }

.bal-card{
  border-radius:14px; padding:16px 18px;
  display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;
}
.bal-due{ background:var(--red-dim); border:1.5px solid var(--red-bdr); }
.bal-clear{ background:var(--green-dim); border:1.5px solid var(--green-bdr); }
.bal-label{ font-size:13px; font-weight:700; }
.bal-sub{ font-size:11px; color:var(--text3); margin-top:2px; }
.bal-label.due{ color:var(--red); }
.bal-label.clear{ color:var(--green); }
.bal-amt{ font-family:'DM Mono',monospace; font-size:30px; font-weight:500; }
.bal-amt.due{ color:var(--red); }
.bal-amt.clear{ color:var(--green); }

/* buttons */
.btn-primary{
  width:100%; background:linear-gradient(135deg,#6366f1,#4f46e5);
  border:none; border-radius:13px; padding:15px;
  font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; color:#fff;
  cursor:pointer; box-shadow:0 4px 20px var(--blue-glow);
  transition:opacity 0.15s, transform 0.1s;
}
.btn-primary:active{ transform:scale(0.98); }
.btn-primary:disabled{ opacity:0.35; cursor:not-allowed; }
.btn-ghost{
  width:100%; background:var(--bg2); border:1px solid var(--line2);
  border-radius:13px; padding:13px; margin-top:8px;
  font-family:'Bricolage Grotesque',sans-serif; font-size:14px; font-weight:600; color:var(--text2);
  cursor:pointer; transition:border-color 0.2s;
}
.btn-ghost:hover{ border-color:var(--line3); }
.btn-actions{ padding:18px 18px 28px; display:flex; flex-direction:column; gap:0; }
.new-cust-btn{
  background:linear-gradient(135deg,#6366f1,#4f46e5);
  border:none; border-radius:13px; padding:14px 24px;
  font-family:'Bricolage Grotesque',sans-serif; font-size:15px; font-weight:700; color:#fff;
  cursor:pointer; box-shadow:0 4px 20px var(--blue-glow);
}

/* ── CUSTOMER PROFILE ── */
.profile-hero{
  padding:20px 18px 18px;
  background:linear-gradient(160deg,#12103a,var(--bg));
  border-bottom:1px solid var(--line2);
}
.profile-top{ display:flex; align-items:center; gap:14px; margin-bottom:16px; }
.profile-av{
  width:56px; height:56px; border-radius:18px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-family:'DM Mono',monospace; font-size:18px; font-weight:500;
  background:var(--blue-dim); border:1.5px solid var(--blue-border); color:#818cf8;
}
.profile-name{ font-size:22px; font-weight:800; letter-spacing:-0.5px; }
.profile-since{ font-size:11px; color:var(--text3); margin-top:3px; }
.profile-phone{ font-size:14px; color:var(--text2); margin-top:5px; }
.profile-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.ps-card{ background:var(--bg2); border:1px solid var(--line2); border-radius:13px; padding:12px; text-align:center; }
.ps-val{ font-family:'DM Mono',monospace; font-size:22px; font-weight:500; }
.ps-lbl{ font-size:9px; color:var(--text3); text-transform:uppercase; letter-spacing:0.6px; margin-top:3px; }

.prof-section{ padding:16px 18px; border-bottom:1px solid var(--line); }
.prof-sec-hdr{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.prof-sec-lbl{ font-size:11px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; }
.prof-add-btn{ font-size:12px; font-weight:600; color:var(--blue); background:none; border:none; cursor:pointer; }

.prof-veh{
  background:var(--bg2); border:1px solid var(--line2); border-radius:14px;
  padding:13px; margin-bottom:8px;
}
.pv-top{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.pv-ico{ font-size:26px; }
.pv-name{ font-size:14px; font-weight:700; }
.pv-sub{ font-size:11px; color:var(--text3); margin-top:1px; }
.pv-reg{ font-family:'DM Mono',monospace; font-size:12px; font-weight:500; letter-spacing:1.2px; margin-left:auto; background:var(--bg3); border:1px solid var(--line2); padding:4px 10px; border-radius:8px; color:var(--text2); }
.pv-foot{ display:flex; align-items:center; justify-content:space-between; }
.pv-meta{ font-size:11px; color:var(--text3); }
.svc-btn{
  background:var(--blue); border:none; border-radius:9px; padding:7px 13px;
  font-family:'Bricolage Grotesque',sans-serif; font-size:12px; font-weight:700; color:#fff;
  cursor:pointer; box-shadow:0 2px 10px var(--blue-glow);
}

/* ── JOB DETAIL ── */
.jd-hero{
  padding:18px; border-bottom:1px solid var(--line2);
  background:linear-gradient(160deg,#12103a,var(--bg));
}
.jd-id-row{ display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.jd-id{ font-family:'DM Mono',monospace; font-size:11px; color:var(--text3); }
.jd-name{ font-size:24px; font-weight:800; letter-spacing:-0.5px; }
.jd-phone{ font-size:13px; color:var(--text2); margin-top:4px; }

.info-blk{ padding:16px 18px; border-bottom:1px solid var(--line); }
.ib-lbl{ font-size:10px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:11px; }
.ib-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.ib-k{ font-size:11px; color:var(--text3); }
.ib-v{ font-size:13px; font-weight:600; margin-top:2px; }

.prog-wrap{
  margin:14px 18px; background:var(--bg2); border:1px solid var(--line2);
  border-radius:16px; padding:16px;
}
.prog-title{ font-size:13px; font-weight:700; margin-bottom:14px; }
.prog-step{ display:flex; gap:12px; }
.prog-l{ display:flex; flex-direction:column; align-items:center; }
.prog-dot{ width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; flex-shrink:0; }
.pd-done{ background:var(--green); color:#fff; }
.pd-active{ background:var(--blue); color:#fff; box-shadow:0 0 12px var(--blue-glow); }
.pd-pend{ background:var(--bg3); border:1.5px solid var(--line2); color:var(--text3); }
.prog-line{ width:2px; flex:1; min-height:16px; margin:3px 0; background:var(--line2); }
.prog-line.done{ background:var(--green); }
.prog-content{ padding-bottom:16px; }
.prog-n{ font-size:13px; font-weight:600; margin-top:3px; }
.prog-t{ font-size:11px; color:var(--text3); margin-top:1px; }

.action-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:0 18px 18px; }
.act{
  background:var(--bg2); border:1px solid var(--line2); border-radius:14px;
  padding:14px; cursor:pointer; transition:border-color 0.2s;
}
.act.primary{ background:var(--blue-dim); border-color:var(--blue-border); }
.act-ico{ font-size:20px; margin-bottom:6px; }
.act-lbl{ font-size:13px; font-weight:700; }
.act-sub{ font-size:10px; color:var(--text3); margin-top:2px; }

/* ── INVOICE ── */
.inv-head{
  background:linear-gradient(160deg,#12103a,var(--bg));
  padding:20px 18px; border-bottom:1px solid var(--line2);
}
.inv-shop{ font-size:20px; font-weight:800; letter-spacing:-0.3px; display:flex; align-items:center; gap:8px; }
.inv-addr{ font-size:11px; color:var(--text3); margin-top:5px; line-height:1.6; }
.inv-num{ font-family:'DM Mono',monospace; font-size:11px; color:var(--text3); letter-spacing:1.5px; margin-top:12px; }
.inv-chip{ display:inline-flex; align-items:center; gap:5px; margin-top:8px; background:var(--green-dim); border:1px solid var(--green-bdr); color:var(--green); font-size:11px; font-weight:700; padding:5px 12px; border-radius:20px; }

.inv-sec{ padding:14px 18px; border-bottom:1px solid var(--line); background:var(--bg2); }
.inv-sec-lbl{ font-size:10px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:10px; }
.inv-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.inv-k{ font-size:11px; color:var(--text3); }
.inv-v{ font-size:13px; font-weight:600; margin-top:2px; }
.inv-line{ display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; }
.inv-dot{ width:5px; height:5px; border-radius:50%; background:var(--blue); flex-shrink:0; margin-top:7px; }
.inv-ln{ flex:1; font-size:13px; }
.inv-lp{ font-family:'DM Mono',monospace; font-size:14px; font-weight:500; }
.inv-totals{ padding:14px 18px; background:var(--bg); }
.inv-r{ display:flex; justify-content:space-between; font-size:13px; color:var(--text2); margin-bottom:7px; }
.inv-sep{ height:1px; background:var(--line2); margin:10px 0; }
.inv-grand{ display:flex; justify-content:space-between; align-items:baseline; }
.inv-grand-lbl{ font-size:16px; font-weight:700; }
.inv-grand-val{ font-family:'DM Mono',monospace; font-size:30px; font-weight:500; }

.inv-bal{
  margin:14px 18px; border-radius:15px; padding:16px;
  display:flex; align-items:center; justify-content:space-between;
}
.invb-due{ background:var(--red-dim); border:1.5px solid var(--red-bdr); }
.invb-clear{ background:var(--green-dim); border:1.5px solid var(--green-bdr); }
.invb-lbl{ font-size:13px; font-weight:700; }
.invb-sub{ font-size:11px; color:var(--text3); margin-top:2px; }
.invb-lbl.due{ color:var(--red); }
.invb-lbl.clear{ color:var(--green); }
.invb-amt{ font-family:'DM Mono',monospace; font-size:30px; font-weight:500; }
.invb-amt.due{ color:var(--red); }
.invb-amt.clear{ color:var(--green); }

.share-wrap{ padding:14px 18px 28px; background:var(--bg2); }
.share-lbl{ font-size:11px; font-weight:700; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; }
.share-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
.share-btn{
  background:var(--bg3); border:1px solid var(--line2); border-radius:13px;
  padding:12px; display:flex; align-items:center; gap:9px; cursor:pointer; transition:border-color 0.2s;
}
.share-btn:hover{ border-color:var(--blue-border); }
.share-ico{ width:34px; height:34px; background:var(--bg4); border:1px solid var(--line2); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
.share-lbl2{ font-size:12px; font-weight:600; }
.share-sub2{ font-size:10px; color:var(--text3); margin-top:1px; }
.wa-btn{
  width:100%; background:#25D366; border:none; border-radius:13px; padding:15px;
  display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer;
  box-shadow:0 4px 16px rgba(37,211,102,0.3); margin-bottom:10px;
}
.wa-lbl{ font-family:'Bricolage Grotesque',sans-serif; font-size:16px; font-weight:700; color:#fff; }

/* tag */
.tag{ display:inline-flex; background:var(--blue-dim); border:1px solid var(--blue-border); color:#818cf8; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }

/* animations */
@keyframes fup{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:translateY(0); } }
.fu{ animation:fup 0.25s ease both; }
@keyframes sin{ from{ opacity:0; transform:translateX(12px); } to{ opacity:1; transform:translateX(0); } }
.si{ animation:sin 0.25s ease both; }
@keyframes expand{ from{ opacity:0; max-height:0; } to{ opacity:1; max-height:500px; } }
.exp{ animation:expand 0.28s ease both; overflow:hidden; }

.divider{ height:1px; background:var(--line); margin:10px 0; }
.spacer{ height:8px; background:var(--bg); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
`;

// ─── PHOTO SLOT ──────────────────────────────────────────
const PhotoTile = ({ label, emoji, src, onPick }) => {
  const ref = useRef();
  return (
    <div className={`photo-tile${src?" has":""}`} onClick={()=>ref.current.click()}>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}}
        onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>onPick(ev.target.result);r.readAsDataURL(f);}}} />
      {src ? <>
        <img src={src} alt={label}/>
        <div className="photo-hover">✏ Change</div>
        <div className="photo-tag">{label}</div>
      </> : <>
        <div className="photo-ico">{emoji}</div>
        <div className="photo-lbl">{label}</div>
      </>}
    </div>
  );
};

// ─── BADGE ───────────────────────────────────────────────
const Badge = ({status}) => {
  const m = {completed:["b-done","✓ Done"],"in-progress":["b-active","⚙ Active"],waiting:["b-wait","⏳ Waiting"]};
  const [c,t] = m[status]||["b-wait",status];
  return <span className={`badge ${c}`}>{t}</span>;
};

// ─── APP ─────────────────────────────────────────────────
export default function App() {
  const [view, setView]     = useState("login");
  const [tab, setTab]       = useState("home");
  const [stack, setStack]   = useState([]);
  const [customers, setCust]= useState(INIT_CUSTOMERS);
  const [jobs, setJobs]     = useState(INIT_JOBS);

  const [selCust, setSelCust]   = useState(null);
  const [selVeh, setSelVeh]     = useState(null);
  const [selJob, setSelJob]     = useState(null);
  const [profCust, setProfCust] = useState(null);
  const [addVehFor, setAddVehFor] = useState(null);

  // search
  const [q, setQ]         = useState("");
  const [focused, setFoc] = useState(false);
  const [openId, setOpenId] = useState(null);

  // service form
  const [sfServices, setSfSvc]       = useState([]);
  const [sfCustomSvc, setSfCustom]   = useState("");
  const [sfParts, setSfParts]        = useState([]);
  const [sfLabor, setSfLabor]        = useState("");
  const [sfComplaint, setSfComplaint]= useState("");
  const [sfAdvance, setSfAdv]        = useState("");
  const [sfPhotos, setSfPhotos]      = useState({b1:null,b2:null,a1:null,a2:null});

  // register forms
  const blankC = {name:"",phone:"",email:"",city:""};
  const blankV = {type:"car",make:"",model:"",year:"",color:"",reg:"",km:"",fuel:"Petrol"};
  const [regC, setRegC] = useState(blankC);
  const [regV, setRegV] = useState(blankV);
  const [newV, setNewV] = useState(blankV);

  // computed
  const partsTotal = sfParts.reduce((s,p)=>s+(parseFloat(p.qty)||0)*(parseFloat(p.price)||0),0);
  const laborAmt   = parseFloat(sfLabor)||0;
  const grandTotal = partsTotal+laborAmt;
  const advAmt     = parseFloat(sfAdvance)||0;
  const balance    = Math.max(0,grandTotal-advAmt);

  // nav
  const push = v => { setStack(s=>[...s,view]); setView(v); };
  const pop  = () => { const prev=stack[stack.length-1]||"main"; setStack(s=>s.slice(0,-1)); setView(prev); };
  const home = () => { setStack([]); setView("main"); setTab("home"); };

  const getC = id => customers.find(c=>c.id===id);
  const getV = (cid,vid) => customers.find(c=>c.id===cid)?.vehicles?.find(v=>v.id===vid);
  const custJobs = cid => jobs.filter(j=>j.customerId===cid);
  const vehJobs  = vid => jobs.filter(j=>j.vehicleId===vid);

  const results = useMemo(()=>{
    if(!q.trim()) return [];
    const raw = q.toLowerCase().replace(/\s/g,"");
    return customers.filter(c=>
      c.name.toLowerCase().includes(q.toLowerCase())||
      c.phone.replace(/\s/g,"").includes(raw)||
      c.vehicles.some(v=>v.reg.toLowerCase().replace(/\s/g,"").includes(raw))
    );
  },[q,customers]);

  const startService = (c,v) => {
    setSelCust(c); setSelVeh(v);
    setSfSvc([]); setSfParts([]); setSfLabor(""); setSfComplaint(""); setSfAdv("");
    setSfPhotos({b1:null,b2:null,a1:null,a2:null});
    setOpenId(null); setQ("");
    push("svc-form");
  };

  const toggleSvc = n => setSfSvc(s=>s.includes(n)?s.filter(x=>x!==n):[...s,n]);
  const addPart   = () => setSfParts(p=>[...p,{id:uid(),name:"",qty:"1",price:""}]);
  const updPart   = (id,k,v) => setSfParts(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  const delPart   = id => setSfParts(p=>p.filter(x=>x.id!==id));

  const submitJob = () => {
    const j = {
      id:`JB-00${jobs.length+38}`,
      customerId:selCust.id, vehicleId:selVeh.id,
      date:"2 Mar 2026", status:"waiting",
      complaint:sfComplaint, services:sfServices,
      parts:sfParts.filter(p=>p.name), labor:sfLabor, advance:sfAdvance,
    };
    setJobs(prev=>[j,...prev]);
    setSelJob(j);
    push("invoice");
  };

  const registerAndStart = () => {
    const v = {...regV,id:`V${uid()}`};
    const c = {id:`C${uid()}`,name:regC.name,phone:regC.phone,email:regC.email,city:regC.city,since:"Mar 2026",avatar:regC.name.slice(0,2).toUpperCase(),vehicles:[v]};
    setCust(prev=>[...prev,c]);
    startService(c,v);
  };

  const addVehicle = cid => {
    const v = {...newV,id:`V${uid()}`};
    setCust(prev=>prev.map(c=>c.id===cid?{...c,vehicles:[...c.vehicles,v]}:c));
    const c = customers.find(x=>x.id===cid);
    if(c) startService(c,v);
    setAddVehFor(null);
  };

  // invoice helpers
  const invC    = selJob ? getC(selJob.customerId) : selCust;
  const invV    = selJob ? getV(selJob.customerId,selJob.vehicleId) : selVeh;
  const invCalc = selJob ? calcJob(selJob) : {parts:partsTotal,labor:laborAmt,total:grandTotal,advance:advAmt,balance};
  const invSvcs = selJob?.services || sfServices;
  const invParts= selJob?.parts || sfParts.filter(p=>p.name);
  const invLabor= selJob ? parseFloat(selJob.labor)||0 : laborAmt;

  const VTYPES = [{k:"car",i:"🚗",l:"Car"},{k:"bike",i:"🛵",l:"Bike/Scooter"},{k:"suv",i:"🚙",l:"SUV"},{k:"auto",i:"🛺",l:"Auto"}];

  const VTypeRow = ({val,onChange}) => (
    <div className="vtype-row">
      {VTYPES.map(t=>(
        <div key={t.k} className={`vtype-btn${val===t.k?" on":""}`} onClick={()=>onChange(t.k)}>
          <span className="vtype-btn-ico">{t.i}</span>
          <span className="vtype-btn-lbl">{t.l}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <div className="phone">
          {view!=="login" && (
            <div className="sbar">
              <span style={{fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:500}}>9:41</span>
              <div className="sbar-right"><span>📶</span><span>🔋</span></div>
            </div>
          )}

          {/* ═══════════════════════
              LOGIN
          ═══════════════════════ */}
          {view==="login" && (
            <div className="screen fu">
              <div className="login-wrap">
                <div className="login-orb"/>
                <div className="app-logo">🔧</div>
                <div className="app-name">MOTOR<span>FIX</span></div>
                <div className="app-tagline">Workshop Manager</div>
                <div className="login-card">
                  <div className="login-heading">Welcome back 👋</div>
                  <div className="login-sub">Sign in to your workshop dashboard</div>
                  <input className="l-inp" placeholder="Phone number" type="tel"/>
                  <input className="l-inp" placeholder="Password" type="password"/>
                  <button className="login-btn" onClick={()=>{setView("main");setTab("home");}}>Sign In →</button>
                  <div className="login-link">New here? <span>Register your workshop</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════
              MAIN TABS
          ═══════════════════════ */}
          {view==="main" && (
            <>
              <div className="screen">

                {/* HOME */}
                {tab==="home" && (
                  <div className="fu">
                    <div className="dash-head">
                      <div className="dash-row1">
                        <div className="shop-tag"><div className="online-dot"/><span className="shop-label">MOTORFIX PRO</span></div>
                        <div className="notif">🔔<div className="notif-dot"/></div>
                      </div>
                      <div className="dash-greet">Good morning,<br/><em>Mechanic!</em> 🛠</div>
                      <div className="dash-date">Monday, 2 March 2026 · Coimbatore</div>
                    </div>

                    <div className="stat-row">
                      {[
                        {n:jobs.length,l:"Total",c:"blue"},
                        {n:jobs.filter(j=>j.status==="waiting").length,l:"Waiting",c:"amber"},
                        {n:jobs.filter(j=>j.status==="in-progress").length,l:"Active",c:"blue"},
                        {n:jobs.filter(j=>j.status==="completed").length,l:"Done",c:"green"},
                      ].map((s,i)=>(
                        <div key={i} className="stat" data-c={s.c}>
                          <div className={`stat-n ${s.c}`}>{s.n}</div>
                          <div className="stat-l">{s.l}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rev">
                      <div className="rev-shine"/>
                      <div className="rev-top">
                        <div><div className="rev-lbl">Today's Revenue</div></div>
                        <div className="rev-up">↑ 18%</div>
                      </div>
                      <div className="rev-amt">₹{fmt(jobs.filter(j=>j.status==="completed").reduce((s,j)=>s+calcJob(j).total,0))}</div>
                      <div className="rev-sub">Target ₹75,000 · 48% achieved</div>
                      <div className="rev-bar"><div className="rev-fill" style={{width:"48%"}}/></div>
                    </div>

                    <div className="sec-hdr">
                      <span className="sec-lbl">Today's Jobs</span>
                      <button className="sec-link" onClick={()=>setTab("jobs")}>View all →</button>
                    </div>
                    <div className="jobs">
                      {jobs.slice(0,3).map(j=>{
                        const c=getC(j.customerId), v=getV(j.customerId,j.vehicleId), calc=calcJob(j);
                        return (
                          <div key={j.id} className="jcard" onClick={()=>{setSelJob(j);push("job-detail");}}>
                            <div className="jcard-top">
                              <div className={`av av-blue`}>{c?.avatar}</div>
                              <div><div className="jcard-name">{c?.name}</div><div className="jcard-id">{j.id} · {j.date}</div></div>
                              <Badge status={j.status}/>
                            </div>
                            <div className="jcard-veh">
                              <span style={{fontSize:18}}>{vIcon(v)}</span>
                              <span className="jcard-vn">{v?.make} {v?.model} · {v?.year}</span>
                              <span className="jcard-reg">{v?.reg}</span>
                            </div>
                            <div className="jcard-foot">
                              <span className="jcard-meta">{j.services.length} svc · {j.parts.length} parts</span>
                              <div className="jcard-fin">
                                <div className="jcard-total">₹{fmt(calc.total)}</div>
                                {calc.balance>0?<div className="jcard-due">Due ₹{fmt(calc.balance)}</div>:calc.advance>0?<div className="jcard-paid">✓ Paid</div>:null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* JOBS */}
                {tab==="jobs" && (
                  <div className="fu">
                    <div className="topbar"><div className="tb-title">All Jobs</div><div className="tb-right"><button className="ico-btn">🔍</button></div></div>
                    <div style={{display:"flex",gap:8,padding:"12px 18px",overflowX:"auto",scrollbarWidth:"none"}}>
                      {["All","Waiting","Active","Done"].map(f=>(
                        <div key={f} style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,background:"var(--bg2)",border:"1px solid var(--line2)",color:"var(--text2)",cursor:"pointer",whiteSpace:"nowrap"}}>{f}</div>
                      ))}
                    </div>
                    <div className="jobs">
                      {jobs.map(j=>{
                        const c=getC(j.customerId), v=getV(j.customerId,j.vehicleId), calc=calcJob(j);
                        return (
                          <div key={j.id} className="jcard" onClick={()=>{setSelJob(j);push("job-detail");}}>
                            <div className="jcard-top">
                              <div className="av av-blue">{c?.avatar}</div>
                              <div><div className="jcard-name">{c?.name}</div><div className="jcard-id">{j.id} · {j.date}</div></div>
                              <Badge status={j.status}/>
                            </div>
                            <div className="jcard-veh">
                              <span style={{fontSize:18}}>{vIcon(v)}</span>
                              <span className="jcard-vn">{v?.make} {v?.model} · {v?.year}</span>
                              <span className="jcard-reg">{v?.reg}</span>
                            </div>
                            <div className="jcard-foot">
                              <span className="jcard-meta">{j.services.length} svc · {j.parts.length} parts · ₹{fmt(parseFloat(j.labor)||0)} labour</span>
                              <div className="jcard-fin">
                                <div className="jcard-total">₹{fmt(calc.total)}</div>
                                {calc.balance>0?<div className="jcard-due">Due ₹{fmt(calc.balance)}</div>:calc.advance>0?<div className="jcard-paid">✓ Paid</div>:null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CUSTOMERS */}
                {tab==="customers" && (
                  <div className="fu">
                    <div className="topbar">
                      <div className="tb-title">Customers</div>
                      <div className="tb-right"><button className="ico-btn" onClick={()=>push("register")}>➕</button></div>
                    </div>
                    <div style={{padding:"12px 18px"}}>
                      <div style={{position:"relative"}}>
                        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"var(--text3)"}}>🔍</span>
                        <input style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--line2)",borderRadius:11,padding:"11px 14px 11px 38px",color:"var(--text)",fontFamily:"Bricolage Grotesque,sans-serif",fontSize:14,outline:"none"}} placeholder="Search customers..."/>
                      </div>
                    </div>
                    <div className="jobs">
                      {customers.map(c=>{
                        const cj=custJobs(c.id);
                        return (
                          <div key={c.id} className="jcard" onClick={()=>{setProfCust(c);push("profile");}}>
                            <div className="jcard-top">
                              <div className="av av-blue">{c.avatar}</div>
                              <div>
                                <div className="jcard-name">{c.name}</div>
                                <div className="jcard-id">📞 {c.phone} · {c.vehicles.length} vehicle{c.vehicles.length>1?"s":""}</div>
                              </div>
                              <div style={{marginLeft:"auto",textAlign:"center",background:"var(--bg3)",border:"1px solid var(--line2)",borderRadius:10,padding:"6px 12px"}}>
                                <div style={{fontFamily:"DM Mono,monospace",fontSize:19,fontWeight:500}}>{cj.length}</div>
                                <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:0.5}}>Jobs</div>
                              </div>
                            </div>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {c.vehicles.map(v=>(
                                <span key={v.id} style={{background:"var(--bg3)",border:"1px solid var(--line2)",borderRadius:8,padding:"3px 9px",fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--text2)",letterSpacing:0.8}}>{v.reg}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SETTINGS */}
                {tab==="settings" && (
                  <div className="fu">
                    <div style={{padding:"20px 18px",background:"linear-gradient(160deg,#12103a,var(--bg))",borderBottom:"1px solid var(--line2)",display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:54,height:54,borderRadius:16,background:"linear-gradient(135deg,#6366f1,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Mono,monospace",fontSize:18,fontWeight:500,color:"#fff",flexShrink:0}}>MF</div>
                      <div><div style={{fontSize:18,fontWeight:800,letterSpacing:-0.3}}>MotorFix Pro</div><div style={{fontSize:12,color:"var(--text3)",marginTop:3}}>Workshop Admin · Coimbatore</div></div>
                      <button style={{marginLeft:"auto",background:"var(--bg3)",border:"1px solid var(--line2)",borderRadius:9,padding:"6px 12px",fontSize:12,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Edit</button>
                    </div>
                    {[
                      {label:"Shop",rows:[{i:"🏪",l:"Shop Profile"},{i:"⚙️",l:"Services & Pricing"},{i:"🧾",l:"Invoice Template"},{i:"👨‍🔧",l:"Staff & Mechanics"}]},
                      {label:"Preferences",rows:[{i:"🔔",l:"Notifications",v:"On"},{i:"💬",l:"WhatsApp Alerts",v:"On"},{i:"💰",l:"Currency",v:"INR ₹"}]},
                      {label:"Support",rows:[{i:"❓",l:"Help & FAQ"},{i:"⭐",l:"Rate the App"},{i:"📞",l:"Contact Support"}]},
                    ].map((sec,i)=>(
                      <div key={i} style={{padding:"14px 18px 0"}}>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:9}}>{sec.label}</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                          {sec.rows.map((r,j)=>(
                            <div key={j} style={{background:"var(--bg2)",border:"1px solid var(--line2)",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
                              <span style={{fontSize:17,width:26}}>{r.i}</span>
                              <span style={{fontSize:13,fontWeight:500,flex:1}}>{r.l}</span>
                              <span style={{fontSize:12,color:"var(--text3)"}}>{r.v||"›"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button style={{margin:"6px 18px 28px",width:"calc(100% - 36px)",background:"var(--red-dim)",border:"1px solid var(--red-bdr)",borderRadius:12,padding:13,fontFamily:"Bricolage Grotesque,sans-serif",fontSize:15,fontWeight:700,color:"var(--red)",cursor:"pointer"}} onClick={()=>setView("login")}>🚪 Sign Out</button>
                  </div>
                )}

              </div>

              <div className="bnav">
                {[{id:"home",i:"🏠",l:"Home"},{id:"jobs",i:"📋",l:"Jobs"}].map(n=>(
                  <button key={n.id} className={`ni${tab===n.id?" on":""}`} onClick={()=>setTab(n.id)}>
                    <span className="ni-ico">{n.i}</span><span className="ni-lbl">{n.l}</span>
                  </button>
                ))}
                <div className="fab-col">
                  <button className="fab" onClick={()=>{setQ("");setOpenId(null);push("new-job");}}>＋</button>
                </div>
                {[{id:"customers",i:"👥",l:"Customers"},{id:"settings",i:"⚙️",l:"Settings"}].map(n=>(
                  <button key={n.id} className={`ni${tab===n.id?" on":""}`} onClick={()=>setTab(n.id)}>
                    <span className="ni-ico">{n.i}</span><span className="ni-lbl">{n.l}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ═══════════════════════
              NEW JOB — SEARCH
          ═══════════════════════ */}
          {view==="new-job" && (
            <div className="screen fu">
              <div className="topbar">
                <button className="back-btn" onClick={pop}>‹</button>
                <div>
                  <div className="tb-title">New Service Job</div>
                </div>
              </div>

              <div className="nj-head">
                <div className="nj-eyebrow">Step 1</div>
                <div className="nj-title">Find Customer</div>
                <div className="nj-sub">Search by name, phone, or vehicle number</div>
              </div>

              <div className="search-wrap">
                <div className={`search-row${focused?" focused":""}`}>
                  <span className="search-ico">🔍</span>
                  <input className="search-inp" placeholder="Rajesh  or  TN11AB1234  or  98765…"
                    value={q} onChange={e=>{setQ(e.target.value);setOpenId(null);}}
                    onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} autoFocus/>
                  {q && <span className="search-x" onClick={()=>setQ("")}>✕</span>}
                </div>
              </div>

              {q ? (
                <div className="results">
                  {results.length>0 ? (
                    <>
                      <div className="res-label">Matches <span className="res-count">{results.length}</span></div>
                      {results.map(c=>{
                        const isOpen=openId===c.id;
                        const matchedVehs=c.vehicles.filter(v=>v.reg.toLowerCase().replace(/\s/g,"").includes(q.toLowerCase().replace(/\s/g,"")));
                        return (
                          <div key={c.id} className={`cust-card${isOpen?" open":""}`}>
                            <div className="cust-card-top" onClick={()=>setOpenId(isOpen?null:c.id)}>
                              <div className="cust-av blue">{c.avatar}</div>
                              <div style={{flex:1}}>
                                <div className="cust-name">{c.name}</div>
                                <div className="cust-phone">📞 {c.phone} · since {c.since}</div>
                                {matchedVehs.map(v=>(
                                  <span key={v.id} className="match-tag">{vIcon(v)} {v.reg} matched</span>
                                ))}
                              </div>
                              <div className="cust-v-pill">
                                <div className="cust-v-n">{c.vehicles.length}</div>
                                <div className="cust-v-l">Vehicles</div>
                              </div>
                            </div>
                            {isOpen && (
                              <div className="veh-sel exp">
                                <div className="veh-sel-lbl">Select vehicle to service</div>
                                <div className="veh-list">
                                  {c.vehicles.map(v=>{
                                    const vj=vehJobs(v.id).length;
                                    return (
                                      <div key={v.id} className="veh-row" onClick={()=>startService(c,v)}>
                                        <span className="veh-ico">{vIcon(v)}</span>
                                        <div style={{flex:1}}>
                                          <div className="veh-mn">{v.make} {v.model}</div>
                                          <div className="veh-yr">{v.year} · {v.color} · {v.fuel}</div>
                                        </div>
                                        <span className="veh-hist">{vj} job{vj!==1?"s":""}</span>
                                        <span className="veh-reg-tag">{v.reg}</span>
                                      </div>
                                    );
                                  })}
                                  <button className="add-veh-row" onClick={()=>{setAddVehFor(c);setNewV(blankV);push("add-veh");}}>
                                    <span style={{fontSize:16,color:"var(--blue)"}}>＋</span> Add new vehicle for {c.name}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid var(--line2)"}}>
                        <div className="res-label" style={{marginBottom:10}}>Not found?</div>
                        <button className="new-cust-btn" style={{width:"100%"}} onClick={()=>push("register")}>➕ Register New Customer</button>
                      </div>
                    </>
                  ) : (
                    <div className="no-res">
                      <div className="no-res-ico">🔍</div>
                      <div className="no-res-t">No customer found</div>
                      <div className="no-res-s">No match for "<strong>{q}</strong>".<br/>Is this their first visit?</div>
                      <button className="new-cust-btn" onClick={()=>push("register")}>➕ Register New Customer</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pre-search">
                  <div className="pre-lbl">Recent customers</div>
                  <div className="recent-list">
                    {customers.slice(0,4).map(c=>(
                      <div key={c.id} className="recent-row" onClick={()=>{setQ(c.name.split(" ")[0]);setOpenId(c.id);}}>
                        <div className="recent-av av-blue">{c.avatar}</div>
                        <div style={{flex:1}}>
                          <div className="recent-name">{c.name}</div>
                          <div className="recent-regs">{c.vehicles.map(v=>v.reg).join(" · ")}</div>
                        </div>
                        <span className="recent-arr">›</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:16}}>
                    <button style={{width:"100%",background:"var(--bg2)",border:"1px dashed var(--line3)",borderRadius:13,padding:14,fontFamily:"Bricolage Grotesque,sans-serif",fontSize:14,fontWeight:600,color:"var(--text2)",cursor:"pointer"}} onClick={()=>push("register")}>
                      ➕ Register New Customer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════
              REGISTER CUSTOMER
          ═══════════════════════ */}
          {view==="register" && (
            <div className="screen si">
              <div className="topbar">
                <button className="back-btn" onClick={pop}>‹</button>
                <div className="tb-title">New Customer</div>
              </div>

              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-blue">👤</div>
                  <div><div className="f-block-title">Customer Info</div><div className="f-block-sub">Contact details</div></div>
                </div>
                <div className="f-field"><label className="f-label">Full Name *</label><input className="fi" value={regC.name} onChange={e=>setRegC({...regC,name:e.target.value})} placeholder="e.g. Rajesh Kumar"/></div>
                <div className="f-field"><label className="f-label">Phone *</label><input className="fi" value={regC.phone} onChange={e=>setRegC({...regC,phone:e.target.value})} placeholder="98765 43210" type="tel"/></div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Email</label><input className="fi" value={regC.email} onChange={e=>setRegC({...regC,email:e.target.value})} placeholder="optional"/></div>
                  <div className="f-field"><label className="f-label">City</label><input className="fi" value={regC.city} onChange={e=>setRegC({...regC,city:e.target.value})} placeholder="Coimbatore"/></div>
                </div>
              </div>

              <div className="spacer"/>

              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-blue">🚗</div>
                  <div><div className="f-block-title">First Vehicle</div><div className="f-block-sub">Register their vehicle</div></div>
                </div>
                <div className="f-field"><label className="f-label">Vehicle Type</label><VTypeRow val={regV.type} onChange={t=>setRegV({...regV,type:t})}/></div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Make *</label><input className="fi" value={regV.make} onChange={e=>setRegV({...regV,make:e.target.value})} placeholder="Honda"/></div>
                  <div className="f-field"><label className="f-label">Model *</label><input className="fi" value={regV.model} onChange={e=>setRegV({...regV,model:e.target.value})} placeholder="City"/></div>
                </div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Year</label><input className="fi" value={regV.year} onChange={e=>setRegV({...regV,year:e.target.value})} placeholder="2021" type="number"/></div>
                  <div className="f-field"><label className="f-label">Colour</label><input className="fi" value={regV.color} onChange={e=>setRegV({...regV,color:e.target.value})} placeholder="White"/></div>
                </div>
                <div className="f-field"><label className="f-label">Registration No. *</label><input className="fi" value={regV.reg} onChange={e=>setRegV({...regV,reg:e.target.value.toUpperCase().replace(/\s/g,"")})} placeholder="TN11AB1234" style={{fontFamily:"DM Mono,monospace",fontWeight:500,letterSpacing:2,fontSize:16}}/></div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Odometer (km)</label><input className="fi" value={regV.km} onChange={e=>setRegV({...regV,km:e.target.value})} placeholder="35,000" type="number"/></div>
                  <div className="f-field"><label className="f-label">Fuel</label>
                    <select className="fs" value={regV.fuel} onChange={e=>setRegV({...regV,fuel:e.target.value})}>
                      <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="btn-actions">
                <button className="btn-primary" disabled={!regC.name||!regC.phone||!regV.make||!regV.reg} onClick={registerAndStart}>
                  Register & Start Service →
                </button>
                <button className="btn-ghost" onClick={pop}>← Back</button>
              </div>
            </div>
          )}

          {/* ═══════════════════════
              ADD VEHICLE
          ═══════════════════════ */}
          {view==="add-veh" && addVehFor && (
            <div className="screen si">
              <div className="topbar">
                <button className="back-btn" onClick={pop}>‹</button>
                <div className="tb-title">Add Vehicle</div>
              </div>
              <div style={{padding:"12px 18px",background:"var(--blue-dim)",borderBottom:"1px solid var(--blue-border)",display:"flex",alignItems:"center",gap:10}}>
                <div className="av av-blue">{addVehFor.avatar}</div>
                <div><div style={{fontSize:13,color:"var(--text3)"}}>Adding vehicle for</div><div style={{fontSize:15,fontWeight:700,color:"#818cf8"}}>{addVehFor.name}</div></div>
              </div>
              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-blue">🚗</div>
                  <div><div className="f-block-title">New Vehicle</div><div className="f-block-sub">Will be added to their profile</div></div>
                </div>
                <div className="f-field"><label className="f-label">Vehicle Type</label><VTypeRow val={newV.type} onChange={t=>setNewV({...newV,type:t})}/></div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Make *</label><input className="fi" value={newV.make} onChange={e=>setNewV({...newV,make:e.target.value})} placeholder="Honda"/></div>
                  <div className="f-field"><label className="f-label">Model *</label><input className="fi" value={newV.model} onChange={e=>setNewV({...newV,model:e.target.value})} placeholder="Activa"/></div>
                </div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Year</label><input className="fi" value={newV.year} onChange={e=>setNewV({...newV,year:e.target.value})} placeholder="2023" type="number"/></div>
                  <div className="f-field"><label className="f-label">Colour</label><input className="fi" value={newV.color} onChange={e=>setNewV({...newV,color:e.target.value})} placeholder="Black"/></div>
                </div>
                <div className="f-field"><label className="f-label">Registration No. *</label><input className="fi" value={newV.reg} onChange={e=>setNewV({...newV,reg:e.target.value.toUpperCase().replace(/\s/g,"")})} placeholder="TN11CD5678" style={{fontFamily:"DM Mono,monospace",fontWeight:500,letterSpacing:2,fontSize:16}}/></div>
                <div className="f-row">
                  <div className="f-field"><label className="f-label">Odometer (km)</label><input className="fi" value={newV.km} onChange={e=>setNewV({...newV,km:e.target.value})} placeholder="5,000" type="number"/></div>
                  <div className="f-field"><label className="f-label">Fuel</label>
                    <select className="fs" value={newV.fuel} onChange={e=>setNewV({...newV,fuel:e.target.value})}>
                      <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="btn-actions">
                <button className="btn-primary" disabled={!newV.make||!newV.reg} onClick={()=>addVehicle(addVehFor.id)}>Add Vehicle & Start Service →</button>
                <button className="btn-ghost" onClick={pop}>← Back</button>
              </div>
            </div>
          )}

          {/* ═══════════════════════
              SERVICE FORM
          ═══════════════════════ */}
          {view==="svc-form" && selCust && selVeh && (
            <div className="screen si">
              <div className="topbar">
                <button className="back-btn" onClick={pop}>‹</button>
                <div className="tb-title">New Service</div>
              </div>

              {/* Context */}
              <div className="context-bar">
                <div className="ctx-av av-blue">{selCust.avatar}</div>
                <div>
                  <div className="ctx-name">{selCust.name}</div>
                  <div className="ctx-phone">📞 {selCust.phone}</div>
                </div>
                <div className="ctx-veh">
                  <div className="ctx-veh-name">{vIcon(selVeh)} {selVeh.make} {selVeh.model}</div>
                  <div className="ctx-veh-reg">{selVeh.reg}</div>
                </div>
              </div>

              {/* Complaint */}
              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-red">💬</div>
                  <div><div className="f-block-title">Complaint</div><div className="f-block-sub">What did the customer report?</div></div>
                </div>
                <textarea className="ft" value={sfComplaint} onChange={e=>setSfComplaint(e.target.value)} placeholder="Engine noise on startup, AC not cooling, brake squeal when stopping…"/>
              </div>

              <div className="spacer"/>

              {/* Services */}
              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-blue">🛠️</div>
                  <div><div className="f-block-title">Services Done</div><div className="f-block-sub">Select all that apply</div></div>
                </div>
                <div className="svc-grid">
                  {SERVICES_PRESET.map(s=>(
                    <div key={s} className={`svc-item${sfServices.includes(s)?" on":""}`} onClick={()=>toggleSvc(s)}>
                      <span className="svc-label">{s}</span>
                      <div className="svc-box">{sfServices.includes(s)&&<span className="svc-tick">✓</span>}</div>
                    </div>
                  ))}
                </div>
                <div className="custom-row">
                  <input className="fi custom-inp" value={sfCustomSvc} onChange={e=>setSfCustom(e.target.value)} placeholder="Add custom service…" onKeyDown={e=>{if(e.key==="Enter"&&sfCustomSvc.trim()){setSfSvc(s=>[...s,sfCustomSvc.trim()]);setSfCustom("");}}}/>
                  <button className="custom-btn" onClick={()=>{if(sfCustomSvc.trim()){setSfSvc(s=>[...s,sfCustomSvc.trim()]);setSfCustom("");}}}>Add</button>
                </div>
              </div>

              <div className="spacer"/>

              {/* Parts */}
              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-blue">🔩</div>
                  <div><div className="f-block-title">Spare Parts</div><div className="f-block-sub">Name · Qty · Unit price</div></div>
                </div>
                <div className="parts-stack">
                  {sfParts.map((p,idx)=>{
                    const rt=(parseFloat(p.qty)||0)*(parseFloat(p.price)||0);
                    return (
                      <div className="part-card" key={p.id}>
                        <div className="part-card-top">
                          <span className="part-num">PART {String(idx+1).padStart(2,"0")}</span>
                          <button className="part-del" onClick={()=>delPart(p.id)}>✕</button>
                        </div>
                        <div className="part-fields">
                          <input className="fi" value={p.name} onChange={e=>updPart(p.id,"name",e.target.value)} placeholder="Part name (e.g. Engine Oil 5W-30, Brake Pad Set)"/>
                          <div className="part-2col">
                            <div><div className="f-label">Qty</div><input className="fi" value={p.qty} onChange={e=>updPart(p.id,"qty",e.target.value)} type="number" min="1" placeholder="1"/></div>
                            <div><div className="f-label">Unit Price (₹)</div><input className="fi" value={p.price} onChange={e=>updPart(p.id,"price",e.target.value)} type="number" placeholder="0"/></div>
                          </div>
                          <div className="part-total">
                            <span className="pt-lbl">Row Total</span>
                            <span className="pt-val">₹{fmt(rt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button className="add-part" onClick={addPart}><span style={{fontSize:18,color:"var(--blue)"}}>＋</span> Add Spare Part</button>
                </div>
              </div>

              <div className="spacer"/>

              {/* Labour */}
              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-green">💪</div>
                  <div><div className="f-block-title">Labour Charges</div><div className="f-block-sub">Total mechanic work charge</div></div>
                </div>
                <div className="labor-card">
                  <div className="labor-hint">Enter total labour amount for all work performed</div>
                  <div className="labor-row">
                    <span className="labor-sym">₹</span>
                    <input className="labor-inp" value={sfLabor} onChange={e=>setSfLabor(e.target.value)} type="number" placeholder="0"/>
                  </div>
                </div>
                {(partsTotal>0||laborAmt>0) && (
                  <div className="total-box">
                    {partsTotal>0 && <div className="total-row"><span className="total-lbl">Parts Total</span><span className="total-val">₹{fmt(partsTotal)}</span></div>}
                    {laborAmt>0 && <div className="total-row"><span className="total-lbl">Labour</span><span className="total-val">₹{fmt(laborAmt)}</span></div>}
                    <div className="total-sep"/>
                    <div className="grand-row"><span className="grand-lbl">Grand Total</span><span className="grand-val">₹{fmt(grandTotal)}</span></div>
                  </div>
                )}
              </div>

              <div className="spacer"/>

              {/* Photos */}
              <div className="f-block">
                <div className="f-block-head">
                  <div className="f-block-icon fbi-amber">📷</div>
                  <div><div className="f-block-title">Before & After Photos</div><div className="f-block-sub">Optional · Protects workshop</div></div>
                </div>
                <div className="photo-category-label">Before service</div>
                <div className="photos-wrap" style={{marginBottom:14}}>
                  <PhotoTile label="Before 1" emoji="📷" src={sfPhotos.b1} onPick={s=>setSfPhotos(p=>({...p,b1:s}))}/>
                  <PhotoTile label="Before 2" emoji="📷" src={sfPhotos.b2} onPick={s=>setSfPhotos(p=>({...p,b2:s}))}/>
                </div>
                <div className="photo-category-label">After service</div>
                <div className="photos-wrap">
                  <PhotoTile label="After 1" emoji="✅" src={sfPhotos.a1} onPick={s=>setSfPhotos(p=>({...p,a1:s}))}/>
                  <PhotoTile label="After 2" emoji="✅" src={sfPhotos.a2} onPick={s=>setSfPhotos(p=>({...p,a2:s}))}/>
                </div>
              </div>

              <div className="spacer"/>

              {/* Payment */}
              <div className="f-block" style={{paddingBottom:28}}>
                <div className="f-block-head">
                  <div className="f-block-icon fbi-green">💰</div>
                  <div><div className="f-block-title">Payment</div><div className="f-block-sub">Record advance & see balance</div></div>
                </div>

                <div className="adv-row">
                  <span className="adv-ico">💵</span>
                  <div className="adv-text">
                    <div className="adv-lbl">Advance Received</div>
                    <div className="adv-sub">Amount collected right now</div>
                  </div>
                  <input className="adv-inp" value={sfAdvance} onChange={e=>setSfAdv(e.target.value)} type="number" placeholder="0"/>
                </div>

                <div className={`bal-card ${balance<=0&&grandTotal>0?"bal-clear":"bal-due"}`}>
                  <div>
                    <div className={`bal-label ${balance<=0&&grandTotal>0?"clear":"due"}`}>
                      {balance<=0&&grandTotal>0?"✓ Fully Paid":"Balance Due"}
                    </div>
                    <div className="bal-sub">
                      {balance<=0&&grandTotal>0?"No pending amount":grandTotal>0?`₹${fmt(grandTotal)} total − ₹${fmt(advAmt)} advance`:"Enter parts & labour above"}
                    </div>
                  </div>
                  <div className={`bal-amt ${balance<=0&&grandTotal>0?"clear":"due"}`}>₹{fmt(balance)}</div>
                </div>

                <button className="btn-primary" onClick={submitJob}>✓ Create Job & Generate Invoice</button>
              </div>
            </div>
          )}

          {/* ═══════════════════════
              CUSTOMER PROFILE
          ═══════════════════════ */}
          {view==="profile" && profCust && (
            <div className="screen fu">
              <div className="topbar">
                <button className="back-btn" onClick={pop}>‹</button>
                <div className="tb-title">Profile</div>
                <div className="tb-right"><button className="ico-btn">✏️</button></div>
              </div>
              <div className="profile-hero">
                <div className="profile-top">
                  <div className="profile-av">{profCust.avatar}</div>
                  <div>
                    <div className="profile-name">{profCust.name}</div>
                    <div className="profile-since">Since {profCust.since} · {profCust.city}</div>
                    <div className="profile-phone">📞 {profCust.phone}</div>
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="ps-card"><div className="ps-val" style={{color:"var(--blue)"}}>{custJobs(profCust.id).length}</div><div className="ps-lbl">Jobs</div></div>
                  <div className="ps-card"><div className="ps-val" style={{color:"var(--cyan)"}}>{profCust.vehicles.length}</div><div className="ps-lbl">Vehicles</div></div>
                  <div className="ps-card"><div className="ps-val" style={{color:"var(--green)",fontSize:14,marginTop:4}}>₹{fmt(custJobs(profCust.id).reduce((s,j)=>s+calcJob(j).total,0))}</div><div className="ps-lbl">Spent</div></div>
                </div>
              </div>

              <div className="prof-section">
                <div className="prof-sec-hdr">
                  <div className="prof-sec-lbl">Vehicles ({profCust.vehicles.length})</div>
                  <button className="prof-add-btn" onClick={()=>{setAddVehFor(profCust);setNewV(blankV);push("add-veh");}}>+ Add Vehicle</button>
                </div>
                {profCust.vehicles.map(v=>{
                  const vj=vehJobs(v.id);
                  return (
                    <div className="prof-veh" key={v.id}>
                      <div className="pv-top">
                        <span className="pv-ico">{vIcon(v)}</span>
                        <div><div className="pv-name">{v.make} {v.model}</div><div className="pv-sub">{v.year} · {v.color} · {v.fuel}</div></div>
                        <div className="pv-reg">{v.reg}</div>
                      </div>
                      <div className="pv-foot">
                        <div className="pv-meta">{v.km?`${fmt(v.km)} km`:"—"} · {vj.length} service{vj.length!==1?"s":""}</div>
                        <button className="svc-btn" onClick={()=>startService(profCust,v)}>+ Service</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="prof-section">
                <div className="prof-sec-hdr"><div className="prof-sec-lbl">Service History</div></div>
                {custJobs(profCust.id).length===0 ? (
                  <div style={{textAlign:"center",padding:"20px 0",color:"var(--text3)",fontSize:13}}>No history yet</div>
                ) : custJobs(profCust.id).map(j=>{
                  const v=getV(j.customerId,j.vehicleId), calc=calcJob(j);
                  return (
                    <div key={j.id} onClick={()=>{setSelJob(j);push("job-detail");}} style={{background:"var(--bg2)",border:"1px solid var(--line2)",borderRadius:14,padding:13,marginBottom:8,cursor:"pointer"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div>
                          <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--text3)"}}>{j.id} · {j.date}</div>
                          <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{vIcon(v||{})} {v?.make} {v?.model} <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--text2)",letterSpacing:0.8}}>{v?.reg}</span></div>
                        </div>
                        <Badge status={j.status}/>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                        {j.services.map((s,i)=><span key={i} className="tag">{s}</span>)}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                        <span style={{fontSize:11,color:"var(--text3)"}}>{j.parts.length} parts · ₹{fmt(parseFloat(j.labor)||0)} labour</span>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"DM Mono,monospace",fontSize:16,fontWeight:500}}>₹{fmt(calc.total)}</div>
                          {calc.balance>0&&<div style={{fontSize:10,color:"var(--red)",fontWeight:700}}>Due ₹{fmt(calc.balance)}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════
              JOB DETAIL
          ═══════════════════════ */}
          {view==="job-detail" && selJob && (()=>{
            const c=getC(selJob.customerId), v=getV(selJob.customerId,selJob.vehicleId), calc=calcJob(selJob);
            return (
              <div className="screen fu">
                <div className="topbar">
                  <button className="back-btn" onClick={pop}>‹</button>
                  <div className="tb-title">Job Detail</div>
                  <div className="tb-right"><button className="ico-btn">✏️</button></div>
                </div>
                <div className="jd-hero">
                  <div className="jd-id-row"><span className="jd-id">{selJob.id} · {selJob.date}</span><Badge status={selJob.status}/></div>
                  <div className="jd-name">{c?.name}</div>
                  <div className="jd-phone">📞 {c?.phone}</div>
                </div>

                <div className="info-blk">
                  <div className="ib-lbl">Vehicle</div>
                  <div style={{background:"var(--bg2)",border:"1px solid var(--line2)",borderRadius:12,padding:"12px 13px",display:"flex",alignItems:"center",gap:12,marginBottom:v&&selJob.complaint?10:0}}>
                    <span style={{fontSize:28}}>{vIcon(v)}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:700}}>{v?.make} {v?.model}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{v?.year} · {v?.color} · {v?.fuel} · {v?.km?`${fmt(v.km)} km`:"—"}</div>
                    </div>
                    <span style={{fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:500,letterSpacing:1.5,background:"var(--bg3)",border:"1px solid var(--line2)",padding:"4px 10px",borderRadius:8,color:"var(--text2)"}}>{v?.reg}</span>
                  </div>
                  {selJob.complaint && (
                    <div style={{background:"var(--amber-dim)",border:"1px solid var(--amber-bdr)",borderRadius:10,padding:"10px 12px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"var(--amber)",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Complaint</div>
                      <div style={{fontSize:13,color:"var(--text2)"}}>{selJob.complaint}</div>
                    </div>
                  )}
                </div>

                <div className="prog-wrap">
                  <div className="prog-title">Service Progress</div>
                  {[
                    {n:"Job Received",t:selJob.date,s:"done"},
                    {n:"Inspection",t:"—",s:"done"},
                    {n:"Service Bay",t:"—",s:selJob.status==="in-progress"?"active":selJob.status==="completed"?"done":"pend"},
                    {n:"Quality Check",t:"—",s:selJob.status==="completed"?"done":"pend"},
                    {n:"Ready / Delivered",t:selJob.status==="completed"?"Complete":"Pending",s:selJob.status==="completed"?"done":"pend"},
                  ].map((s,i,arr)=>(
                    <div className="prog-step" key={i}>
                      <div className="prog-l">
                        <div className={`prog-dot pd-${s.s}`}>{s.s==="done"?"✓":s.s==="active"?"●":i+1}</div>
                        {i<arr.length-1&&<div className={`prog-line${s.s==="done"?" done":""}`}/>}
                      </div>
                      <div className="prog-content">
                        <div className="prog-n" style={{color:s.s==="active"?"var(--blue)":"var(--text)"}}>{s.n}</div>
                        <div className="prog-t">{s.t}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="info-blk">
                  <div className="ib-lbl">Services</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:selJob.parts.length?12:0}}>
                    {selJob.services.map((s,i)=><span key={i} className="tag">{s}</span>)}
                    {!selJob.services.length&&<span style={{fontSize:12,color:"var(--text3)"}}>None</span>}
                  </div>
                  {selJob.parts.length>0&&<>
                    <div style={{height:1,background:"var(--line)",margin:"10px 0"}}/>
                    <div className="ib-lbl">Parts Used</div>
                    {selJob.parts.map((p,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid var(--line)"}}>
                        <span>{p.name} <span style={{color:"var(--text3)"}}>×{p.qty}</span></span>
                        <strong style={{fontFamily:"DM Mono,monospace",fontWeight:500}}>₹{fmt((parseFloat(p.qty)||0)*(parseFloat(p.price)||0))}</strong>
                      </div>
                    ))}
                    <div style={{height:1,background:"var(--line)",margin:"10px 0"}}/>
                  </>}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <span style={{color:"var(--text3)"}}>Labour</span>
                    <strong style={{fontFamily:"DM Mono,monospace",fontWeight:500}}>₹{fmt(parseFloat(selJob.labor)||0)}</strong>
                  </div>
                </div>

                <div className="info-blk">
                  <div className="ib-lbl">Payment Summary</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"var(--text3)"}}>Grand Total</span><span style={{fontFamily:"DM Mono,monospace",fontWeight:500}}>₹{fmt(calc.total)}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"var(--green)"}}>Advance Paid</span><span style={{fontFamily:"DM Mono,monospace",fontWeight:500,color:"var(--green)"}}>– ₹{fmt(calc.advance)}</span></div>
                    <div style={{height:1,background:"var(--line)"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                      <span style={{fontSize:14,fontWeight:700}}>Balance Due</span>
                      <span style={{fontFamily:"DM Mono,monospace",fontSize:26,fontWeight:500,color:calc.balance>0?"var(--red)":"var(--green)"}}>₹{fmt(calc.balance)}</span>
                    </div>
                  </div>
                </div>

                <div className="action-grid">
                  <div className="act primary" onClick={()=>{setSelCust(c);setSelVeh(v);push("invoice");}}>
                    <div className="act-ico">🧾</div><div className="act-lbl">View Invoice</div><div className="act-sub">Generate & share</div>
                  </div>
                  <div className="act" onClick={()=>{setProfCust(c);push("profile");}}>
                    <div className="act-ico">👤</div><div className="act-lbl">Profile</div><div className="act-sub">All vehicles & history</div>
                  </div>
                  <div className="act"><div className="act-ico">💬</div><div className="act-lbl">WhatsApp</div><div className="act-sub">Send update</div></div>
                  <div className="act"><div className="act-ico">📞</div><div className="act-lbl">Call</div><div className="act-sub">{c?.phone}</div></div>
                </div>
              </div>
            );
          })()}

          {/* ═══════════════════════
              INVOICE
          ═══════════════════════ */}
          {view==="invoice" && (
            <div className="screen fu">
              <div className="topbar">
                <button className="back-btn" onClick={pop}>‹</button>
                <div className="tb-title">Invoice</div>
                <div className="tb-right"><button className="ico-btn">⬇</button><button className="ico-btn">📤</button></div>
              </div>

              <div className="inv-head">
                <div className="inv-shop">🔧 MOTORFIX PRO</div>
                <div className="inv-addr">123, Race Course Rd, Coimbatore – 641018<br/>📞 +91 98765 00000</div>
                <div className="inv-num">INV-{String(Date.now()).slice(-4)} · {new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
                <div className="inv-chip">✓ INVOICE READY</div>
              </div>

              <div className="inv-sec">
                <div className="inv-sec-lbl">Billed To</div>
                <div className="inv-grid">
                  <div><div className="inv-k">Customer</div><div className="inv-v">{invC?.name}</div></div>
                  <div><div className="inv-k">Phone</div><div className="inv-v">{invC?.phone}</div></div>
                </div>
              </div>

              <div className="inv-sec">
                <div className="inv-sec-lbl">Vehicle</div>
                <div style={{display:"flex",alignItems:"center",gap:12,background:"var(--bg3)",border:"1px solid var(--line2)",borderRadius:11,padding:"11px 13px"}}>
                  <span style={{fontSize:26}}>{vIcon(invV)}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700}}>{invV?.make} {invV?.model}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{invV?.year} · {invV?.fuel} · {invV?.km?`${fmt(invV.km)} km`:"—"}</div>
                  </div>
                  <span style={{fontFamily:"DM Mono,monospace",fontSize:12,fontWeight:500,letterSpacing:1.5,background:"var(--bg4)",border:"1px solid var(--line2)",padding:"4px 10px",borderRadius:8,color:"var(--text2)"}}>{invV?.reg}</span>
                </div>
              </div>

              {invSvcs.length>0 && (
                <div className="inv-sec">
                  <div className="inv-sec-lbl">Services Performed</div>
                  {invSvcs.map((s,i)=><div key={i} className="inv-line"><div className="inv-dot"/><span className="inv-ln">{s}</span></div>)}
                </div>
              )}

              {invParts.length>0 && (
                <div className="inv-sec">
                  <div className="inv-sec-lbl">Spare Parts</div>
                  {invParts.map((p,i)=>(
                    <div key={i} className="inv-line">
                      <div className="inv-dot"/>
                      <div style={{flex:1}}>
                        <div className="inv-ln">{p.name}</div>
                        <div style={{fontSize:11,color:"var(--text3)"}}>Qty {p.qty} × ₹{fmt(p.price)}</div>
                      </div>
                      <div className="inv-lp">₹{fmt((parseFloat(p.qty)||0)*(parseFloat(p.price)||0))}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="inv-sec">
                <div className="inv-sec-lbl">Labour</div>
                <div className="inv-line">
                  <div className="inv-dot"/>
                  <span className="inv-ln">Mechanic Labour (fitting, service & time)</span>
                  <div className="inv-lp">₹{fmt(invLabor)}</div>
                </div>
              </div>

              <div className="inv-totals">
                {invCalc.parts>0&&<div className="inv-r"><span>Parts Total</span><span>₹{fmt(invCalc.parts)}</span></div>}
                <div className="inv-r"><span>Labour Total</span><span>₹{fmt(invCalc.labor)}</span></div>
                <div className="inv-sep"/>
                <div className="inv-grand"><span className="inv-grand-lbl">Grand Total</span><span className="inv-grand-val">₹{fmt(invCalc.total)}</span></div>
                {invCalc.advance>0 && (
                  <div className="inv-r" style={{marginTop:8,color:"var(--green)"}}><span>Advance Received</span><span>– ₹{fmt(invCalc.advance)}</span></div>
                )}
              </div>

              <div className="inv-bal" style={{margin:"14px 18px",borderRadius:15,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between",...(invCalc.balance<=0&&invCalc.total>0?{background:"var(--green-dim)",border:"1.5px solid var(--green-bdr)"}:{background:"var(--red-dim)",border:"1.5px solid var(--red-bdr)"})}}>
                <div>
                  <div className={`invb-lbl ${invCalc.balance<=0&&invCalc.total>0?"clear":"due"}`}>{invCalc.balance<=0&&invCalc.total>0?"✓ Fully Settled":"Balance Due"}</div>
                  <div className="invb-sub">{invCalc.balance<=0&&invCalc.total>0?"No pending amount":"Collect before vehicle delivery"}</div>
                </div>
                <div className={`invb-amt ${invCalc.balance<=0&&invCalc.total>0?"clear":"due"}`}>₹{fmt(invCalc.balance)}</div>
              </div>

              <div className="share-wrap">
                <div className="share-lbl" style={{marginBottom:12}}>Share Invoice</div>
                <div className="share-grid">
                  {[{i:"📄",l:"Download PDF",s:"Save to device"},{i:"📧",l:"Email",s:"To customer"},{i:"🖨️",l:"Print",s:"Bluetooth"},{i:"🔗",l:"Copy Link",s:"Share URL"}].map((x,i)=>(
                    <div key={i} className="share-btn"><div className="share-ico">{x.i}</div><div><div className="share-lbl2">{x.l}</div><div className="share-sub2">{x.s}</div></div></div>
                  ))}
                </div>
                <button className="wa-btn"><span style={{fontSize:20}}>💬</span><span className="wa-lbl">SEND VIA WHATSAPP</span></button>
                <button className="btn-ghost" onClick={home}>＋ Start New Job</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}