import { useState, useRef } from "react";

const UNITS = ["Kg", "Gram", "Liter", "₹ (Rupees)", "Custom"];
const generateId = () => Math.random().toString(36).substr(2, 9);
const defaultRow = () => ({ id: generateId(), product: "", quantity: "", unit: "Kg", customUnit: "" });

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
  </svg>
);
const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const CsvIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
);

export default function GroceryReport() {
  const [rows, setRows] = useState([defaultRow(), defaultRow(), defaultRow()]);
  const [reportTitle, setReportTitle] = useState("Weekly Grocery Report");
  const [shopName, setShopName] = useState("Fresh Mart");
  const [date] = useState(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const addRow = () => setRows((r) => [...r, defaultRow()]);
  const removeRow = (id) => { if (rows.length > 1) setRows((r) => r.filter((row) => row.id !== id)); };
  const updateRow = (id, field, value) => setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const clearAll = () => setRows([defaultRow(), defaultRow(), defaultRow()]);

  const filledRows = rows.filter((r) => r.product.trim() || r.quantity);

  const handleCSV = () => {
    setShowDropdown(false);
    const csvRows = [["#", "Product Name", "Quantity", "Unit"]];
    rows.forEach((row, i) => {
      const unit = row.unit === "Custom" ? row.customUnit || "Custom" : row.unit;
      csvRows.push([i + 1, row.product || "", row.quantity || "", unit]);
    });
    const csv = csvRows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = () => {
    setShowDropdown(false);
    const tableRows = rows.map((row, i) => {
      const unit = row.unit === "Custom" ? (row.customUnit || "Custom") : row.unit;
      return `
        <tr>
          <td style="text-align:center;color:#64748b;font-weight:600;">${String(i + 1).padStart(2, "0")}</td>
          <td>${row.product || "<span style='color:#94a3b8'>—</span>"}</td>
          <td>${row.quantity || "<span style='color:#94a3b8'>—</span>"}</td>
          <td>${unit}</td>
        </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${reportTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Segoe UI', sans-serif; background: #f8fafc; padding: 32px; color: #1e293b; }
    .page { max-width: 780px; margin: 0 auto; background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 32px rgba(37,99,235,0.10); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%); padding: 32px 36px; display: flex; align-items: center; justify-content: space-between; }
    .header-left { display: flex; align-items: center; gap: 18px; }
    .logo { width: 52px; height: 52px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; backdrop-filter: blur(10px); }
    .title { font-size: 22px; font-weight: 800; color: white; margin-bottom: 4px; }
    .shop { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 500; }
    .header-right { text-align: right; }
    .date-lbl { font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .date-val { font-size: 14px; color: white; font-weight: 600; }
    .badge { display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 20px; background: rgba(255,255,255,0.2); color: white; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px); }
    .body { padding: 28px 36px 36px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    thead tr { background: linear-gradient(to right, #eff6ff, #dbeafe); }
    th { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #3b82f6; padding: 12px 14px; text-align: left; border-bottom: 2px solid #bfdbfe; }
    th:first-child { text-align: center; width: 48px; }
    td { padding: 11px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: middle; }
    td:first-child { text-align: center; font-weight: 700; color: #94a3b8; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #fafcff; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 4px; }
    .stat { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; }
    .stat-icon { font-size: 18px; margin-bottom: 6px; }
    .stat-num { font-size: 24px; font-weight: 800; color: #2563eb; line-height: 1; }
    .stat-lbl { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500; }
    .footer { text-align: center; padding: 18px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <div class="logo">🛒</div>
      <div>
        <div class="title">${reportTitle}</div>
        <div class="shop">${shopName}</div>
      </div>
    </div>
    <div class="header-right">
      <div class="date-lbl">Date</div>
      <div class="date-val">${date}</div>
      <div class="badge">${filledRows.length} item${filledRows.length !== 1 ? "s" : ""} added</div>
    </div>
  </div>
  <div class="body">
    <div class="section-title">🧾 Grocery Items</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="section-title">📊 Report Summary</div>
    <div class="summary">
      <div class="stat"><div class="stat-icon">📋</div><div class="stat-num">${rows.length}</div><div class="stat-lbl">Total Rows</div></div>
      <div class="stat"><div class="stat-icon">✅</div><div class="stat-num" style="color:#16a34a">${filledRows.length}</div><div class="stat-lbl">Items Filled</div></div>
      <div class="stat"><div class="stat-icon">🏷️</div><div class="stat-num" style="color:#d97706">${rows.filter(r => r.unit === "Custom" && r.customUnit).length}</div><div class="stat-lbl">Custom Units</div></div>
      <div class="stat"><div class="stat-icon">⬜</div><div class="stat-num" style="color:#94a3b8">${rows.length - filledRows.length}</div><div class="stat-lbl">Empty Rows</div></div>
    </div>
  </div>
  <div class="footer">${reportTitle} · ${shopName} · ${date} · Generated by Grocery Report App</div>
</div>
<script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) alert("Please allow popups to download PDF.");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; }
        .app { min-height: 100vh; background: linear-gradient(145deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 65%, #f0fdf4 100%); padding: 24px 16px 40px; }
        .wrap { max-width: 960px; margin: 0 auto; }
        .header-card { background: white; border-radius: 20px; padding: 24px 28px; margin-bottom: 18px; box-shadow: 0 2px 20px rgba(59,130,246,0.08); border: 1.5px solid #dbeafe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .logo-box { width: 52px; height: 52px; border-radius: 15px; background: linear-gradient(135deg, #2563eb, #0ea5e9); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
        .title-input { background: transparent; border: none; border-bottom: 2px solid transparent; font-size: 21px; font-weight: 700; color: #1e3a5f; width: 100%; transition: border-color 0.2s; display: block; padding: 2px 0; font-family: inherit; }
        .title-input:focus { outline: none; border-bottom-color: #2563eb; }
        .shop-input { background: transparent; border: none; border-bottom: 1.5px solid transparent; font-size: 13px; color: #2563eb; margin-top: 3px; display: block; width: 100%; transition: border-color 0.2s; font-family: inherit; }
        .shop-input:focus { outline: none; border-bottom-color: #2563eb; }
        .header-right { text-align: right; }
        .date-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
        .date-val { font-size: 14px; font-weight: 600; color: #374151; }
        .badge { display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 20px; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; font-size: 12px; font-weight: 600; }
        .table-card { background: white; border-radius: 20px; box-shadow: 0 2px 20px rgba(59,130,246,0.08); border: 1.5px solid #dbeafe; overflow: hidden; margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: linear-gradient(to bottom, #f8faff, #eff6ff); }
        th { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; padding: 13px 10px; border-bottom: 1.5px solid #dbeafe; text-align: left; }
        th.center { text-align: center; }
        td { padding: 11px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(37,99,235,0.02); }
        .serial { text-align: center; font-size: 12px; font-weight: 600; color: #94a3b8; font-family: monospace; }
        .inp { width: 100%; height: 40px; background: #f8faff; border: 1.5px solid #dbeafe; border-radius: 9px; padding: 0 12px; font-size: 14px; color: #1e293b; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .inp:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: white; }
        .inp::placeholder { color: #94a3b8; font-size: 13px; }
        select.inp { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' fill='%232563eb' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 01.753 1.659l-4.796 5.48a1 1 0 01-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
        .inp-custom { background: #eff6ff; border-color: #bfdbfe; }
        .empty-cell { height: 40px; display: flex; align-items: center; padding-left: 12px; color: #cbd5e1; font-size: 14px; }
        .del-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid #fecaca; background: #fff5f5; color: #f87171; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; margin: auto; }
        .del-btn:hover:not(:disabled) { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
        .del-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .table-footer { padding: 16px 20px; background: linear-gradient(to bottom, #f8faff, #eff6ff); border-top: 1.5px solid #dbeafe; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .btn-add { background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; border: none; border-radius: 10px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: inherit; transition: all 0.2s; box-shadow: 0 2px 10px rgba(37,99,235,0.3); }
        .btn-add:hover { background: linear-gradient(135deg, #1d4ed8, #0284c7); transform: translateY(-1px); }
        .btn-group { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .btn-clear { background: white; color: #ef4444; border: 1.5px solid #fecaca; border-radius: 10px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .btn-clear:hover { background: #fef2f2; }
        .btn-print { background: white; color: #374151; border: 1.5px solid #dbeafe; border-radius: 10px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; font-family: inherit; transition: all 0.2s; }
        .btn-print:hover { background: #eff6ff; }

        /* Download split button */
        .download-split { position: relative; display: flex; }
        .btn-dl-main { background: linear-gradient(135deg, #0f766e, #0d9488); color: white; border: none; border-radius: 10px 0 0 10px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; font-family: inherit; transition: all 0.2s; box-shadow: 0 2px 8px rgba(13,148,136,0.3); border-right: 1px solid rgba(255,255,255,0.25); }
        .btn-dl-main:hover { background: linear-gradient(135deg, #0d6b63, #0b7e74); }
        .btn-dl-arrow { background: linear-gradient(135deg, #0f766e, #0d9488); color: white; border: none; border-radius: 0 10px 10px 0; padding: 10px 11px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; font-family: inherit; transition: all 0.2s; box-shadow: 0 2px 8px rgba(13,148,136,0.3); }
        .btn-dl-arrow:hover { background: linear-gradient(135deg, #0d6b63, #0b7e74); }
        .dl-dropdown { position: absolute; bottom: calc(100% + 8px); right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08); border: 1.5px solid #e2e8f0; overflow: hidden; min-width: 190px; z-index: 100; animation: dropUp 0.15s ease; }
        @keyframes dropUp { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        .dl-option { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; font-size: 14px; font-weight: 600; color: #374151; transition: background 0.15s; border: none; background: none; width: 100%; font-family: inherit; text-align: left; }
        .dl-option:hover { background: #f8faff; }
        .dl-option:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
        .dl-option .opt-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .opt-pdf { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #ef4444; }
        .opt-csv { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #16a34a; }
        .opt-text { display: flex; flex-direction: column; }
        .opt-label { font-size: 13px; font-weight: 700; }
        .opt-desc { font-size: 11px; color: #94a3b8; font-weight: 400; margin-top: 1px; }

        .summary-card { background: white; border-radius: 20px; padding: 20px 24px; box-shadow: 0 2px 20px rgba(59,130,246,0.08); border: 1.5px solid #dbeafe; margin-bottom: 18px; }
        .summary-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 14px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
        .stat-box { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1.5px solid #bfdbfe; border-radius: 14px; padding: 14px 16px; }
        .stat-icon { font-size: 20px; margin-bottom: 8px; }
        .stat-num { font-size: 26px; font-weight: 800; line-height: 1; }
        .stat-lbl { font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 500; }
        .footer-txt { text-align: center; color: #94a3b8; font-size: 12px; padding-bottom: 8px; }

        .mobile-list { display: none; padding: 12px; }
        .mobile-item { background: #f8faff; border: 1.5px solid #dbeafe; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
        .mobile-item-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .mobile-num { font-size: 12px; font-weight: 700; color: #2563eb; }
        .field-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-bottom: 5px; }
        .field-group { margin-bottom: 10px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        @media (max-width: 700px) {
          .desktop-table { display: none !important; }
          .mobile-list { display: block !important; }
          .header-card { padding: 18px 20px; }
          .title-input { font-size: 18px; }
          .table-footer { flex-direction: column; align-items: stretch; }
          .btn-group { justify-content: flex-end; }
        }
        @media print {
          body { background: white !important; }
          .app { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .table-card, .header-card, .summary-card { box-shadow: none !important; border: 1px solid #ddd !important; margin-bottom: 14px !important; }
          .table-footer { display: none !important; }
        }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>

      <div className="app" onClick={() => showDropdown && setShowDropdown(false)}>
        <div className="wrap">

          {/* HEADER */}
          <div className="header-card">
            <div className="header-left">
              <div className="logo-box">🛒</div>
              <div>
                <input className="title-input" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="Report Title" />
                <input className="shop-input" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop Name" />
              </div>
            </div>
            <div className="header-right">
              <div className="date-label">Date</div>
              <div className="date-val">{date}</div>
              <div className="badge">{filledRows.length} item{filledRows.length !== 1 ? "s" : ""} added</div>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="table-card">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th className="center" style={{ width: 52 }}>#</th>
                  <th style={{ minWidth: 180 }}>Product Name</th>
                  <th style={{ width: 130 }}>Quantity</th>
                  <th style={{ width: 148 }}>Unit</th>
                  <th style={{ width: 168 }}>Custom Unit</th>
                  <th className="center" style={{ width: 58 }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="serial">{String(idx + 1).padStart(2, "0")}</td>
                    <td><input className="inp" type="text" placeholder="e.g. Tomatoes, Rice, Milk..." value={row.product} onChange={(e) => updateRow(row.id, "product", e.target.value)} /></td>
                    <td><input className="inp" type="number" placeholder="0.00" min="0" value={row.quantity} onChange={(e) => updateRow(row.id, "quantity", e.target.value)} /></td>
                    <td>
                      <select className="inp" value={row.unit} onChange={(e) => updateRow(row.id, "unit", e.target.value)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td>
                      {row.unit === "Custom"
                        ? <input className="inp inp-custom" type="text" placeholder="e.g. dozen, pack..." value={row.customUnit} onChange={(e) => updateRow(row.id, "customUnit", e.target.value)} />
                        : <div className="empty-cell">—</div>
                      }
                    </td>
                    <td>
                      <button className="del-btn" onClick={() => removeRow(row.id)} disabled={rows.length === 1}><TrashIcon /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="mobile-list">
              {rows.map((row, idx) => (
                <div className="mobile-item" key={row.id}>
                  <div className="mobile-item-head">
                    <span className="mobile-num">Item {String(idx + 1).padStart(2, "0")}</span>
                    <button className="del-btn" onClick={() => removeRow(row.id)} disabled={rows.length === 1}><TrashIcon /></button>
                  </div>
                  <div className="field-group"><label className="field-label">Product Name</label><input className="inp" type="text" placeholder="e.g. Tomatoes..." value={row.product} onChange={(e) => updateRow(row.id, "product", e.target.value)} /></div>
                  <div className="two-col">
                    <div className="field-group"><label className="field-label">Quantity</label><input className="inp" type="number" placeholder="0.00" min="0" value={row.quantity} onChange={(e) => updateRow(row.id, "quantity", e.target.value)} /></div>
                    <div className="field-group"><label className="field-label">Unit</label><select className="inp" value={row.unit} onChange={(e) => updateRow(row.id, "unit", e.target.value)}>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
                  </div>
                  {row.unit === "Custom" && <div className="field-group"><label className="field-label">Custom Unit</label><input className="inp inp-custom" type="text" placeholder="e.g. dozen, pack..." value={row.customUnit} onChange={(e) => updateRow(row.id, "customUnit", e.target.value)} /></div>}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="table-footer no-print">
              <button className="btn-add" onClick={addRow}><PlusIcon /> Add More Items</button>
              <div className="btn-group">
                <button className="btn-clear" onClick={clearAll}>Clear All</button>
                <button className="btn-print" onClick={() => window.print()}><PrintIcon /> Print</button>

                {/* ── SPLIT DOWNLOAD BUTTON ── */}
                <div className="download-split" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                  <button className="btn-dl-main" onClick={() => setShowDropdown((v) => !v)}>
                    <DownloadIcon /> Download
                  </button>
                  <button className="btn-dl-arrow" onClick={() => setShowDropdown((v) => !v)}>
                    <ChevronIcon />
                  </button>

                  {showDropdown && (
                    <div className="dl-dropdown">
                      <button className="dl-option" onClick={handlePDF}>
                        <div className="opt-icon opt-pdf"><PdfIcon /></div>
                        <div className="opt-text">
                          <span className="opt-label">Download PDF</span>
                          <span className="opt-desc">Formatted print-ready file</span>
                        </div>
                      </button>
                      <button className="dl-option" onClick={handleCSV}>
                        <div className="opt-icon opt-csv"><CsvIcon /></div>
                        <div className="opt-text">
                          <span className="opt-label">Download CSV</span>
                          <span className="opt-desc">Open in Excel / Sheets</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="summary-card">
            <div className="summary-title">📊 Report Summary</div>
            <div className="summary-grid">
              {[
                { label: "Total Rows", value: rows.length, icon: "📋", color: "#2563eb" },
                { label: "Items Filled", value: filledRows.length, icon: "✅", color: "#16a34a" },
                { label: "Custom Units", value: rows.filter((r) => r.unit === "Custom" && r.customUnit).length, icon: "🏷️", color: "#d97706" },
                { label: "Empty Rows", value: rows.length - filledRows.length, icon: "⬜", color: "#94a3b8" },
              ].map((s) => (
                <div className="stat-box" key={s.label}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-txt">{reportTitle} · {shopName} · {date}</div>
        </div>
      </div>
    </>
  );
}