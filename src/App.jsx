import { useState } from "react";

const UNITS = ["Kg", "Gram", "Liter", "Rs (Rupees)", "Custom"];
const generateId = () => Math.random().toString(36).substr(2, 9);
const defaultRow = () => ({ id: generateId(), product: "", quantity: "", unit: "Kg", customUnit: "" });

const Icon = ({ d, size = 16, stroke = 2 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const I = {
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  plus:    "M12 4v16M4 12h16",
  edit:    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  close:   "M6 18L18 6M6 6l12 12",
  check:   "M5 13l4 4L19 7",
  dl:      "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3",
  print:   "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z",
  chev:    "M19 9l-7 7-7-7",
  pdf:     "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  csv:     "M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
};

/* ── Draw PDF on Canvas → PNG → printable page ── */
function buildPDFCanvas(rows, reportTitle, shopName, date, filledRows) {
  const scale  = 2;                   // retina
  const W      = 794 * scale;         // A4 width  px @96dpi
  const rowH   = 36 * scale;
  const headerH = 90 * scale;
  const colPad  = 12 * scale;
  const cols    = [
    { label:"#",            w: 40  * scale, align:"center" },
    { label:"Product Name", w: 260 * scale, align:"left"   },
    { label:"Quantity",     w: 110 * scale, align:"right"  },
    { label:"Unit",         w: 100 * scale, align:"center" },
  ];
  const tableW   = cols.reduce((a,c) => a+c.w, 0);
  const marginX  = (W - tableW) / 2;
  const thH      = 32 * scale;
  const summaryH = 90 * scale;
  const footerH  = 28 * scale;
  const gap      = 16 * scale;
  const H = headerH + gap + thH + rows.length * rowH + gap + summaryH + footerH + 20 * scale;

  const cv  = document.createElement("canvas");
  cv.width  = W;
  cv.height = H;
  const c   = cv.getContext("2d");

  const fs = (n) => `${n * scale}px`;

  /* ── header gradient ── */
  const grad = c.createLinearGradient(0, 0, W, headerH);
  grad.addColorStop(0,   "#1e40af");
  grad.addColorStop(0.5, "#2563eb");
  grad.addColorStop(1,   "#0ea5e9");
  c.fillStyle = grad;
  roundRect(c, 0, 0, W, headerH, 0);
  c.fill();

  /* logo box */
  c.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(c, marginX, 16*scale, 52*scale, 52*scale, 10*scale);
  c.fill();
  c.font = `${28*scale}px serif`;
  c.fillText("🛒", marginX + 12*scale, 52*scale);

  /* title */
  c.fillStyle = "#fff";
  c.font = `bold ${20*scale}px Arial`;
  c.fillText(reportTitle, marginX + 62*scale, 36*scale);

  /* shop */
  c.fillStyle = "rgba(180,210,255,0.9)";
  c.font = `${12*scale}px Arial`;
  c.fillText(shopName, marginX + 62*scale, 54*scale);

  /* date label */
  c.fillStyle = "rgba(180,210,255,0.7)";
  c.font = `bold ${9*scale}px Arial`;
  c.fillText("DATE", W - marginX - 2, 22*scale, {});
  c.textAlign = "right";
  c.fillText("DATE", W - marginX, 22*scale);

  /* date value */
  c.fillStyle = "#fff";
  c.font = `bold ${12*scale}px Arial`;
  c.textAlign = "right";
  c.fillText(date, W - marginX, 38*scale);

  /* badge */
  const badgeText = `${filledRows.length} items added`;
  c.font = `bold ${10*scale}px Arial`;
  const bw = c.measureText(badgeText).width + 16*scale;
  const bx = W - marginX - bw;
  c.fillStyle = "rgba(255,255,255,0.22)";
  roundRect(c, bx, 46*scale, bw, 18*scale, 9*scale);
  c.fill();
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.fillText(badgeText, bx + bw/2, 59*scale);

  c.textAlign = "left";

  /* ── TABLE HEADER ── */
  let y = headerH + gap;
  c.fillStyle = "#eff6ff";
  c.fillRect(marginX, y, tableW, thH);
  c.strokeStyle = "#bfdbfe";
  c.lineWidth = 1 * scale;
  c.strokeRect(marginX, y, tableW, thH);

  let cx = marginX;
  cols.forEach(col => {
    c.fillStyle = "#2563eb";
    c.font = `bold ${9*scale}px Arial`;
    const tx = col.align === "center" ? cx + col.w/2
             : col.align === "right"  ? cx + col.w - colPad
             : cx + colPad;
    c.textAlign = col.align === "right" ? "right" : col.align === "center" ? "center" : "left";
    c.fillText(col.label.toUpperCase(), tx, y + thH/2 + 4*scale);
    cx += col.w;
  });

  /* ── TABLE ROWS ── */
  y += thH;
  rows.forEach((row, i) => {
    const unit = row.unit === "Custom" ? (row.customUnit || "Custom") : row.unit;
    const cells = [
      String(i+1).padStart(2,"0"),
      row.product || "—",
      row.quantity ? String(row.quantity) : "—",
      unit,
    ];
    /* row bg */
    c.fillStyle = i % 2 === 0 ? "#ffffff" : "#f8faff";
    c.fillRect(marginX, y, tableW, rowH);
    c.strokeStyle = "#f1f5f9";
    c.lineWidth = 0.5 * scale;
    c.strokeRect(marginX, y, tableW, rowH);

    cx = marginX;
    cols.forEach((col, ci) => {
      c.fillStyle = ci === 0 ? "#94a3b8" : ci === 3 ? "#2563eb" : "#1e293b";
      c.font = ci === 0 ? `bold ${10*scale}px monospace` : `${11*scale}px Arial`;
      c.textAlign = col.align === "right" ? "right" : col.align === "center" ? "center" : "left";
      const tx = col.align === "center" ? cx + col.w/2
               : col.align === "right"  ? cx + col.w - colPad
               : cx + colPad;
      /* clip long text */
      const maxW = col.w - colPad*2;
      const txt  = clipText(c, cells[ci], maxW);
      c.fillText(txt, tx, y + rowH/2 + 4*scale);
      cx += col.w;
    });
    y += rowH;
  });

  /* outer border */
  c.strokeStyle = "#bfdbfe";
  c.lineWidth   = 1.5 * scale;
  c.strokeRect(marginX, headerH + gap, tableW, thH + rows.length * rowH);

  /* ── SUMMARY ── */
  y += gap;
  const stats = [
    { label:"Total Rows",   value: String(rows.length),                                             color:"#2563eb" },
    { label:"Items Filled", value: String(filledRows.length),                                        color:"#16a34a" },
    { label:"Custom Units", value: String(rows.filter(r=>r.unit==="Custom"&&r.customUnit).length),   color:"#d97706" },
    { label:"Empty Rows",   value: String(rows.length - filledRows.length),                          color:"#94a3b8" },
  ];
  const sW = tableW / 4 - 6*scale;
  stats.forEach((s, i) => {
    const sx = marginX + i*(sW + 8*scale);
    c.fillStyle   = "#eff6ff";
    roundRect(c, sx, y, sW, summaryH - 10*scale, 8*scale);
    c.fill();
    c.strokeStyle = "#bfdbfe";
    c.lineWidth   = 1 * scale;
    roundRect(c, sx, y, sW, summaryH - 10*scale, 8*scale);
    c.stroke();

    c.fillStyle  = s.color;
    c.font       = `bold ${22*scale}px Arial`;
    c.textAlign  = "center";
    c.fillText(s.value, sx + sW/2, y + 34*scale);

    c.fillStyle  = "#64748b";
    c.font       = `${9*scale}px Arial`;
    c.fillText(s.label, sx + sW/2, y + 50*scale);
  });

  /* ── FOOTER ── */
  y += summaryH;
  c.fillStyle  = "#94a3b8";
  c.font       = `${9*scale}px Arial`;
  c.textAlign  = "center";
  c.fillText(`${reportTitle} · ${shopName} · ${date}`, W/2, y + 12*scale);

  return cv;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function clipText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

/* ── Main Component ── */
export default function GroceryReport() {
  const [rows, setRows]           = useState([defaultRow(), defaultRow(), defaultRow()]);
  const [reportTitle, setReportTitle] = useState("Weekly Grocery Report");
  const [shopName, setShopName]   = useState("Fresh Mart");
  const [date]                    = useState(new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }));
  const [showDl, setShowDl]       = useState(false);
  const [popup, setPopup]         = useState(null);
  const [draft, setDraft]         = useState(null);

  const openPopup  = (row) => { setDraft({...row}); setPopup(row.id); };
  const closePopup = () => { setPopup(null); setDraft(null); };
  const savePopup  = () => { setRows(r => r.map(row => row.id===draft.id ? {...draft} : row)); closePopup(); };
  const addRow     = () => { const r = defaultRow(); setRows(rs => [...rs, r]); openPopup(r); };
  const removeRow  = (id) => { if (rows.length > 1) setRows(r => r.filter(row => row.id !== id)); };
  const updateRow  = (id, f, v) => setRows(r => r.map(row => row.id===id ? {...row,[f]:v} : row));
  const filledRows = rows.filter(r => r.product.trim() || r.quantity);

  /* CSV */
  const handleCSV = () => {
    setShowDl(false);
    const csv = [["#","Product Name","Quantity","Unit"],
      ...rows.map((r,i)=>[i+1, r.product, r.quantity, r.unit==="Custom"?r.customUnit||"Custom":r.unit])
    ].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"),{
      href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})),
      download: reportTitle.replace(/\s+/g,"_")+".csv"
    });
    a.click();
  };

  /* PDF — canvas → PNG dataURL → invisible iframe print */
  const handlePDF = () => {
    setShowDl(false);
    const cv  = buildPDFCanvas(rows, reportTitle, shopName, date, filledRows);
    const img = cv.toDataURL("image/png", 1.0);

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#fff}
  img{width:100%;display:block;page-break-inside:avoid}
  @page{size:A4;margin:0}
  @media print{body{margin:0}img{width:100%;height:auto}}
</style></head>
<body><img src="${img}"/>
<script>
  window.onload=function(){
    setTimeout(function(){
      window.print();
      setTimeout(function(){window.close();},500);
    },300);
  };
</script></body></html>`;

    const blob = new Blob([html], {type:"text/html"});
    const url  = URL.createObjectURL(blob);
    const w    = window.open(url,"_blank","width=900,height=700");
    if (!w) {
      /* fallback: direct PNG download */
      const a = Object.assign(document.createElement("a"),{
        href: img,
        download: reportTitle.replace(/\s+/g,"_")+".png"
      });
      a.click();
    }
    setTimeout(()=>URL.revokeObjectURL(url), 15000);
  };

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',-apple-system,sans-serif}
        .app{min-height:100vh;background:linear-gradient(145deg,#dbeafe 0%,#eff6ff 35%,#e0f2fe 65%,#f0fdf4 100%);padding:24px 16px 40px}
        .wrap{max-width:960px;margin:0 auto}
        .hcard{background:white;border-radius:20px;padding:24px 28px;margin-bottom:18px;box-shadow:0 2px 20px rgba(59,130,246,.08);border:1.5px solid #dbeafe;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
        .hleft{display:flex;align-items:center;gap:16px}
        .logobox{width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#2563eb,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;box-shadow:0 4px 14px rgba(37,99,235,.3)}
        .tinput{background:transparent;border:none;border-bottom:2px solid transparent;font-size:21px;font-weight:700;color:#1e3a5f;width:100%;transition:border-color .2s;display:block;padding:2px 0;font-family:inherit}
        .tinput:focus{outline:none;border-bottom-color:#2563eb}
        .sinput{background:transparent;border:none;border-bottom:1.5px solid transparent;font-size:13px;color:#2563eb;margin-top:3px;display:block;width:100%;transition:border-color .2s;font-family:inherit}
        .sinput:focus{outline:none;border-bottom-color:#2563eb}
        .hright{text-align:right}
        .dlbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px}
        .dval{font-size:14px;font-weight:600;color:#374151}
        .badge{display:inline-block;margin-top:8px;padding:4px 14px;border-radius:20px;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:white;font-size:12px;font-weight:600}
        .tcard{background:white;border-radius:20px;box-shadow:0 2px 20px rgba(59,130,246,.08);border:1.5px solid #dbeafe;overflow:hidden;margin-bottom:18px}
        table{width:100%;border-collapse:collapse}
        thead{background:linear-gradient(to bottom,#f8faff,#eff6ff)}
        th{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#64748b;padding:13px 10px;border-bottom:1.5px solid #dbeafe;text-align:left}
        th.c{text-align:center}
        td{padding:10px 10px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:rgba(37,99,235,.02)}
        .ser{text-align:center;font-size:12px;font-weight:600;color:#94a3b8;font-family:monospace}
        .inp{width:100%;height:40px;background:#f8faff;border:1.5px solid #dbeafe;border-radius:9px;padding:0 12px;font-size:14px;color:#1e293b;font-family:inherit;transition:border-color .2s,box-shadow .2s,background .2s}
        .inp:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1);background:white}
        .inp::placeholder{color:#94a3b8;font-size:13px}
        select.inp{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' fill='%232563eb' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
        .inp-c{background:#eff6ff;border-color:#bfdbfe}
        .empty{height:40px;display:flex;align-items:center;padding-left:12px;color:#cbd5e1;font-size:14px}
        .delbtn{width:32px;height:32px;border-radius:8px;border:1.5px solid #fecaca;background:#fff5f5;color:#f87171;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;margin:auto;flex-shrink:0}
        .delbtn:hover:not(:disabled){background:#fef2f2;border-color:#ef4444;color:#ef4444}
        .delbtn:disabled{opacity:.25;cursor:not-allowed}
        .editbtn{width:32px;height:32px;border-radius:8px;border:1.5px solid #bfdbfe;background:#eff6ff;color:#2563eb;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
        .editbtn:hover{background:#dbeafe;border-color:#2563eb}
        .tfooter{padding:16px 20px;background:linear-gradient(to bottom,#f8faff,#eff6ff);border-top:1.5px solid #dbeafe;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .btnadd{background:linear-gradient(135deg,#2563eb,#0ea5e9);color:white;border:none;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:inherit;transition:all .2s;box-shadow:0 2px 10px rgba(37,99,235,.3)}
        .btnadd:hover{background:linear-gradient(135deg,#1d4ed8,#0284c7);transform:translateY(-1px)}
        .bgrp{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
        .btncl{background:white;color:#ef4444;border:1.5px solid #fecaca;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .btncl:hover{background:#fef2f2}
        .btnpr{background:white;color:#374151;border:1.5px solid #dbeafe;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:7px;font-family:inherit;transition:all .2s}
        .btnpr:hover{background:#eff6ff}
        .dlsplit{position:relative;display:flex}
        .btndlm{background:linear-gradient(135deg,#0f766e,#0d9488);color:white;border:none;border-radius:10px 0 0 10px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:7px;font-family:inherit;transition:all .2s;box-shadow:0 2px 8px rgba(13,148,136,.3);border-right:1px solid rgba(255,255,255,.25)}
        .btndlm:hover{background:linear-gradient(135deg,#0d6b63,#0b7e74)}
        .btndla{background:linear-gradient(135deg,#0f766e,#0d9488);color:white;border:none;border-radius:0 10px 10px 0;padding:10px 11px;cursor:pointer;display:flex;align-items:center;font-family:inherit;transition:all .2s;box-shadow:0 2px 8px rgba(13,148,136,.3)}
        .btndla:hover{background:linear-gradient(135deg,#0d6b63,#0b7e74)}
        .dldrop{position:absolute;bottom:calc(100% + 8px);right:0;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.15);border:1.5px solid #e2e8f0;overflow:hidden;min-width:200px;z-index:200;animation:upIn .15s ease}
        @keyframes upIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .dlopt{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;font-size:14px;font-weight:600;color:#374151;transition:background .15s;border:none;background:none;width:100%;font-family:inherit;text-align:left}
        .dlopt:hover{background:#f8faff}
        .dlopt:not(:last-child){border-bottom:1px solid #f1f5f9}
        .oico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .opdf{background:linear-gradient(135deg,#fee2e2,#fecaca);color:#ef4444}
        .ocsv{background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a}
        .otxt{display:flex;flex-direction:column}
        .olbl{font-size:13px;font-weight:700}
        .odsc{font-size:11px;color:#94a3b8;font-weight:400;margin-top:1px}
        .scard{background:white;border-radius:20px;padding:20px 24px;box-shadow:0 2px 20px rgba(59,130,246,.08);border:1.5px solid #dbeafe;margin-bottom:18px}
        .stitle{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:14px}
        .sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}
        .sbox{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1.5px solid #bfdbfe;border-radius:14px;padding:14px 16px}
        .sico{font-size:20px;margin-bottom:8px}
        .snum{font-size:26px;font-weight:800;line-height:1}
        .slbl{font-size:12px;color:#64748b;margin-top:5px;font-weight:500}
        .ftxt{text-align:center;color:#94a3b8;font-size:12px;padding-bottom:8px}
        .mob-row{display:none;padding:10px 14px;border-bottom:1px solid #f1f5f9;align-items:center;gap:10px;cursor:pointer;transition:background .15s}
        .mob-row:last-child{border-bottom:none}
        .mob-row:hover{background:#f8faff}
        .mob-ser{font-size:12px;font-weight:700;color:#94a3b8;font-family:monospace;width:22px;flex-shrink:0;text-align:center}
        .mob-product{flex:1;font-size:14px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mob-empty{color:#cbd5e1;font-size:13px}
        .mob-qty{font-size:13px;color:#374151;font-weight:600;flex-shrink:0}
        .mob-unit{font-size:12px;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:2px 8px;flex-shrink:0;font-weight:600}
        .mob-actions{display:flex;gap:6px;flex-shrink:0}
        .overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease}
        @media(min-width:520px){.overlay{align-items:center;padding:20px}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .modal{background:white;border-radius:24px 24px 0 0;width:100%;max-width:480px;overflow:hidden;animation:slideUp .25s ease;box-shadow:0 -8px 40px rgba(37,99,235,.15)}
        @media(min-width:520px){.modal{border-radius:24px;animation:popIn .2s ease}}
        @keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes popIn{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
        .mheader{background:linear-gradient(135deg,#2563eb,#0ea5e9);padding:20px 22px 18px;display:flex;align-items:center;justify-content:space-between}
        .mtitle{font-size:16px;font-weight:700;color:white}
        .msubtitle{font-size:12px;color:rgba(255,255,255,.7);margin-top:2px}
        .mclose{width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,.2);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
        .mclose:hover{background:rgba(255,255,255,.35)}
        .mbody{padding:20px 22px}
        .flabel{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#64748b;display:block;margin-bottom:6px}
        .fgroup{margin-bottom:16px}
        .mfooter{padding:16px 22px;background:#f8faff;border-top:1.5px solid #dbeafe;display:flex;gap:10px}
        .btnsave{flex:1;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:white;border:none;border-radius:12px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;transition:all .2s;box-shadow:0 2px 10px rgba(37,99,235,.3)}
        .btnsave:hover{background:linear-gradient(135deg,#1d4ed8,#0284c7)}
        .btncancel{padding:13px 18px;background:white;color:#64748b;border:1.5px solid #dbeafe;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .btncancel:hover{background:#f1f5f9}
        @media(max-width:700px){
          .desktop-table{display:none!important}
          .mob-row{display:flex!important}
          .hcard{padding:18px 20px}
          .tinput{font-size:18px}
          .tfooter{flex-direction:column;align-items:stretch}
          .bgrp{justify-content:flex-end}
        }
        @media print{
          body{background:white!important}
          .app{background:white!important;padding:0!important}
          .no-print{display:none!important}
          .tcard,.hcard,.scard{box-shadow:none!important;border:1px solid #ddd!important;margin-bottom:14px!important}
          .tfooter{display:none!important}
        }
        input[type=number]::-webkit-inner-spin-button{opacity:.4}
      `}</style>

      <div className="app" onClick={() => showDl && setShowDl(false)}>
        <div className="wrap">

          {/* HEADER */}
          <div className="hcard">
            <div className="hleft">
              <div className="logobox">🛒</div>
              <div>
                <input className="tinput" value={reportTitle} onChange={e=>setReportTitle(e.target.value)} placeholder="Report Title"/>
                <input className="sinput" value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="Shop Name"/>
              </div>
            </div>
            <div className="hright">
              <div className="dlbl">Date</div>
              <div className="dval">{date}</div>
              <div className="badge">{filledRows.length} item{filledRows.length!==1?"s":""} added</div>
            </div>
          </div>

          {/* TABLE */}
          <div className="tcard">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th className="c" style={{width:52}}>#</th>
                  <th style={{minWidth:180}}>Product Name</th>
                  <th style={{width:130}}>Quantity</th>
                  <th style={{width:148}}>Unit</th>
                  <th style={{width:168}}>Custom Unit</th>
                  <th className="c" style={{width:58}}>Del</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row,idx)=>(
                  <tr key={row.id}>
                    <td className="ser">{String(idx+1).padStart(2,"0")}</td>
                    <td><input className="inp" type="text" placeholder="e.g. Tomatoes, Rice, Milk..." value={row.product} onChange={e=>updateRow(row.id,"product",e.target.value)}/></td>
                    <td><input className="inp" type="number" placeholder="0.00" min="0" value={row.quantity} onChange={e=>updateRow(row.id,"quantity",e.target.value)}/></td>
                    <td><select className="inp" value={row.unit} onChange={e=>updateRow(row.id,"unit",e.target.value)}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select></td>
                    <td>{row.unit==="Custom"?<input className="inp inp-c" type="text" placeholder="e.g. dozen, pack..." value={row.customUnit} onChange={e=>updateRow(row.id,"customUnit",e.target.value)}/>:<div className="empty">—</div>}</td>
                    <td><button className="delbtn" onClick={()=>removeRow(row.id)} disabled={rows.length===1}><Icon d={I.trash} size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile rows */}
            <div>
              {rows.map((row,idx)=>(
                <div className="mob-row" key={row.id} onClick={()=>openPopup(row)}>
                  <span className="mob-ser">{String(idx+1).padStart(2,"0")}</span>
                  <span className={`mob-product ${!row.product?"mob-empty":""}`}>{row.product||"Tap to add item..."}</span>
                  {row.quantity && <span className="mob-qty">{row.quantity}</span>}
                  <span className="mob-unit">{row.unit==="Custom"?(row.customUnit||"Custom"):row.unit}</span>
                  <div className="mob-actions" onClick={e=>e.stopPropagation()}>
                    <button className="editbtn" onClick={()=>openPopup(row)}><Icon d={I.edit} size={13}/></button>
                    <button className="delbtn" onClick={()=>removeRow(row.id)} disabled={rows.length===1}><Icon d={I.trash} size={13}/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="tfooter no-print">
              <button className="btnadd" onClick={addRow}><Icon d={I.plus} size={15}/> Add More Items</button>
              <div className="bgrp">
                <button className="btncl" onClick={()=>setRows([defaultRow(),defaultRow(),defaultRow()])}>Clear All</button>
                <button className="btnpr" onClick={()=>window.print()}><Icon d={I.print} size={15}/> Print</button>
                <div className="dlsplit" onClick={e=>e.stopPropagation()}>
                  <button className="btndlm" onClick={()=>setShowDl(v=>!v)}><Icon d={I.dl} size={15}/> Download</button>
                  <button className="btndla" onClick={()=>setShowDl(v=>!v)}><Icon d={I.chev} size={13}/></button>
                  {showDl&&(
                    <div className="dldrop">
                      <button className="dlopt" onClick={handlePDF}>
                        <div className="oico opdf"><Icon d={I.pdf} size={15}/></div>
                        <div className="otxt"><span className="olbl">Download PDF</span><span className="odsc">Professional formatted file</span></div>
                      </button>
                      <button className="dlopt" onClick={handleCSV}>
                        <div className="oico ocsv"><Icon d={I.csv} size={15}/></div>
                        <div className="otxt"><span className="olbl">Download CSV</span><span className="odsc">Open in Excel / Sheets</span></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="scard">
            <div className="stitle">📊 Report Summary</div>
            <div className="sgrid">
              {[
                {label:"Total Rows",   value:rows.length,                                            icon:"📋",color:"#2563eb"},
                {label:"Items Filled", value:filledRows.length,                                       icon:"✅",color:"#16a34a"},
                {label:"Custom Units", value:rows.filter(r=>r.unit==="Custom"&&r.customUnit).length,  icon:"🏷️",color:"#d97706"},
                {label:"Empty Rows",   value:rows.length-filledRows.length,                           icon:"⬜",color:"#94a3b8"},
              ].map(s=>(
                <div className="sbox" key={s.label}>
                  <div className="sico">{s.icon}</div>
                  <div className="snum" style={{color:s.color}}>{s.value}</div>
                  <div className="slbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ftxt">{reportTitle} · {shopName} · {date}</div>
        </div>
      </div>

      {/* POPUP */}
      {popup&&draft&&(
        <div className="overlay" onClick={closePopup}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mheader">
              <div>
                <div className="mtitle">✏️ Edit Item</div>
                <div className="msubtitle">Row {String(rows.findIndex(r=>r.id===popup)+1).padStart(2,"0")} · {reportTitle}</div>
              </div>
              <button className="mclose" onClick={closePopup}><Icon d={I.close} size={16}/></button>
            </div>
            <div className="mbody">
              <div className="fgroup">
                <label className="flabel">Product Name</label>
                <input className="inp" type="text" placeholder="e.g. Tomatoes, Rice, Milk..." value={draft.product} onChange={e=>setDraft(d=>({...d,product:e.target.value}))} autoFocus style={{fontSize:15}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div className="fgroup" style={{marginBottom:0}}>
                  <label className="flabel">Quantity</label>
                  <input className="inp" type="number" placeholder="0.00" min="0" value={draft.quantity} onChange={e=>setDraft(d=>({...d,quantity:e.target.value}))} style={{fontSize:15}}/>
                </div>
                <div className="fgroup" style={{marginBottom:0}}>
                  <label className="flabel">Unit</label>
                  <select className="inp" value={draft.unit} onChange={e=>setDraft(d=>({...d,unit:e.target.value}))} style={{fontSize:15}}>
                    {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              {draft.unit==="Custom"&&(
                <div className="fgroup" style={{marginTop:14}}>
                  <label className="flabel">Custom Unit Name</label>
                  <input className="inp inp-c" type="text" placeholder="e.g. dozen, pack, box..." value={draft.customUnit} onChange={e=>setDraft(d=>({...d,customUnit:e.target.value}))} style={{fontSize:15}}/>
                </div>
              )}
            </div>
            <div className="mfooter">
              <button className="btncancel" onClick={closePopup}>Cancel</button>
              <button className="btnsave" onClick={savePopup}><Icon d={I.check} size={16}/> Save Item</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}