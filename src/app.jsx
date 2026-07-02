import { useState, useRef, useEffect } from 'react';

function App() {
  const [formData, setFormData] = useState({
    serviceType: '',
    customerAddress: '',
    panelQuantity: 1,
    estimatedHours: 1,
    technicianCount: 1,
    materials: []
  });

  const [showQuote, setShowQuote] = useState(false);
  const [hoverStates, setHoverStates] = useState({});
  // State captured directly from a Google Places selection (most reliable).
  const [placeState, setPlaceState] = useState('');
  const addressInputRef = useRef(null);

  // Venture Home light theme — brand green (#73FFC6) + near-black (#231F20).
  const T = {
    bg: "#F4F6F3",      // page background (soft light)
    surface: "#FFFFFF", // cards
    field: "#F7F8F6",   // input fields
    border: "#E2E7E0",
    accent: "#73FFC6",  // brand green
    ink: "#231F20",     // brand near-black — text on green, dark pills
    green: "#73FFC6",
    red: "#DC2626",
    text: "#231F20",
    muted: "#6E756E",
    dim: "#AEB4AD",
  };

  const serviceTypes = [
    'Critter Guards',
    'Temp Removal/Reinstall for Roof Work',
    'BOS Repair for Siding',
    'Component Replacement',
    'Custom Service'
  ];

  const serviceStates = ['ME', 'NH', 'RI', 'MA', 'CT', 'NY', 'NJ', 'MD', 'PA'];

  const materials = [
    'Solar Panels',
    'Inverters/Microinverters', 
    'Wiring/Conduit',
    'Other Components'
  ];

  const materialCosts = {
    'Solar Panels': 238.50, // Average from price sheet
    'Inverters/Microinverters': 122.50,
    'Wiring/Conduit': 45.00, // Per panel worth
    'Other Components': 25.00
  };

  const electricianStates = ['MA', 'ME', 'RI', 'NH', 'CT'];

  const stateNames = {
    ME: 'Maine', NH: 'New Hampshire', RI: 'Rhode Island', MA: 'Massachusetts',
    CT: 'Connecticut', NY: 'New York', NJ: 'New Jersey', MD: 'Maryland', PA: 'Pennsylvania',
  };

  // Derive the service state from a free-form customer address so the rep only
  // types the address. Tries full state name, then a 2-letter state code, then
  // a ZIP-code prefix (Venture's 9 service states). Returns '' if undetermined.
  const detectStateFromAddress = (raw) => {
    if (!raw) return '';
    const addr = raw.toUpperCase();
    // 1) Full state name (e.g., "Massachusetts")
    for (const abbr of serviceStates) {
      if (addr.includes(stateNames[abbr].toUpperCase())) return abbr;
    }
    // 2) Standalone 2-letter state code (e.g., "..., MA 02101")
    for (const abbr of serviceStates) {
      if (new RegExp(`\\b${abbr}\\b`).test(addr)) return abbr;
    }
    // 3) ZIP-code prefix fallback
    const zip = addr.match(/\b(\d{5})(?:-\d{4})?\b/);
    if (zip) {
      const p = parseInt(zip[1].slice(0, 3), 10);
      const ranges = [
        ['CT', 60, 69], ['MA', 10, 27], ['RI', 28, 29], ['NH', 30, 38], ['ME', 39, 49],
        ['NJ', 70, 89], ['NY', 100, 149], ['PA', 150, 196], ['MD', 206, 219],
      ];
      for (const [st, lo, hi] of ranges) if (p >= lo && p <= hi) return st;
    }
    return '';
  };

  // Prefer the state Google returns; otherwise parse it from the typed text.
  const detectedState = placeState || detectStateFromAddress(formData.customerAddress);

  const requiresElectrician = electricianStates.includes(detectedState) &&
    ['BOS Repair for Siding', 'Component Replacement'].includes(formData.serviceType);

  const calculateQuote = () => {
    let laborCost = 0;
    let materialCost = 0;

    // Special formula for critter guards
    if (formData.serviceType === 'Critter Guards') {
      return {
        labor: 0,
        materials: 0,
        subtotal: (formData.panelQuantity * 25) + 250,
        total: (formData.panelQuantity * 25) + 250
      };
    }

    // Special formula for temp removal/reinstall
    if (formData.serviceType === 'Temp Removal/Reinstall for Roof Work') {
      return {
        labor: 0,
        materials: 0, 
        subtotal: formData.panelQuantity * 325,
        total: formData.panelQuantity * 325
      };
    }

    // Standard labor calculation
    const hourlyRate = requiresElectrician ? 86.45 : 39.90; // Including 33% burden
    laborCost = formData.estimatedHours * formData.technicianCount * hourlyRate;

    // Material costs with 15% margin
    formData.materials.forEach(material => {
      const baseCost = materialCosts[material] || 0;
      const quantity = material === 'Solar Panels' || material === 'Inverters/Microinverters' ? 
        formData.panelQuantity : Math.max(1, Math.floor(formData.panelQuantity / 2));
      materialCost += baseCost * quantity * 1.15; // 15% margin
    });

    const subtotal = laborCost + materialCost;
    return {
      labor: laborCost,
      materials: materialCost,
      subtotal: subtotal,
      total: subtotal
    };
  };

  const quote = showQuote ? calculateQuote() : null;

  const handleInputChange = (field, value) => {
    // Manually editing the address invalidates any state Google gave us.
    if (field === 'customerAddress') setPlaceState('');
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowQuote(false);
  };

  // Load Google Places (if an API key is configured at runtime) and attach
  // address autocomplete to the Customer Address field. If no key is present,
  // the field stays a normal text input backed by detectStateFromAddress().
  useEffect(() => {
    const key = (window.APP_CONFIG && window.APP_CONFIG.googleMapsApiKey) || '';
    if (!key || !addressInputRef.current) return;

    const initAutocomplete = () => {
      if (!(window.google && window.google.maps && window.google.maps.places)) return;
      const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'address_components'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        const addr = place.formatted_address || addressInputRef.current.value;
        let st = '';
        (place.address_components || []).forEach((c) => {
          if (c.types.includes('administrative_area_level_1')) st = c.short_name;
        });
        setPlaceState(st);
        setFormData((prev) => ({ ...prev, customerAddress: addr }));
        setShowQuote(false);
      });
    };

    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
      return;
    }
    let script = document.getElementById('gmaps-script');
    if (script) {
      script.addEventListener('load', initAutocomplete);
      return;
    }
    script = document.createElement('script');
    script.id = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);
  }, []);

  const handleMaterialToggle = (material) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
    }));
    setShowQuote(false);
  };

  const generateQuote = () => {
    setShowQuote(true);
  };

  // --- Company identity (used in the app header and the printed quote) ---
  const COMPANY = {
    name: 'Venture Home Solar',
    phone: '(888) 522-9161',
    email: 'support@venturehome.com',
    web: 'venturehome.com',
  };

  // Venture Home horizontal wordmark (black) — inlined so the printed quote
  // never depends on a network image load at print time.
  const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596.73 74.21"><g fill="#231f20"><path d="M358.99,4.47v20.48c3.61-1.76,7.41-2.63,11.51-2.72,13.96-.2,24.87,7.8,24.87,22.72v28.09h-7.61v-28.09c-.1-10.06-7.7-15.8-17.27-15.8-3.7,0-7.8.78-11.51,2.14v41.75h-7.61V4.47h7.61Z"/><path d="M426.19,74.21c-14.82,0-25.07-11.41-25.07-25.86s10.23-25.76,25.07-25.76,25.17,11.31,25.17,25.76-10.23,25.86-25.17,25.86ZM426.19,67.49c8.98,0,17.56-6.23,17.56-19.11s-8.59-18.92-17.56-18.92-17.47,6.04-17.47,18.92,8.59,19.11,17.47,19.11Z"/><path d="M499.07,43.48l-.1,29.56h-7.31l-.2-29.56c0-11.31-6.04-14.33-13.96-14.43-4.1,0-8.19.29-12,1.76v42.24h-7.7V25.93c6.33-2.23,13.27-3.61,19.8-3.61,7.21.1,14.23,1.96,17.66,8.59,3.51-6.43,9.96-8.49,16.88-8.49,11.31,0,20.58,5.76,20.58,22.05v28.58h-7.61v-28.58c0-10.82-5.67-15.31-12.98-15.31s-12.98,3.41-13.07,14.33v-.02Z"/><path d="M581.59,53.57l7.12,1c-1.92,8.13-7.35,13.86-14.88,17.07-15.43,6.59-28.33-2-33.26-13.8-5.02-11.74-2.14-27.09,12.9-33.62,14.41-6.25,29.31,1.8,33.36,17.25l-38.2,16.33c3.82,7.49,12.53,11.94,22.56,7.64,5.02-2.14,9.13-6.45,10.41-11.88ZM577.93,38.28c-4.27-8.04-12.96-11.45-21.72-7.9-9.82,4.31-12.04,13.53-10.04,21.46l31.76-13.56Z"/><path d="M182.75,0h-13.49v20.11h-5.67v11.51h5.67v24.46c-.47,14.05,11.06,18.86,22.7,17v-12.15c-5.88.71-9.21-1.8-9.21-5.23v-24.09h9.21v-11.51h-9.21V0Z"/><path d="M270.8,25.17l-1.12-5.51v-.06h-11.21v53.4h13.66v-32.97c0-8.66,9.96-10.19,16.41-5.82l5.88-10.74c-6.78-6.06-17.52-6.21-23.6,1.69l-.02.02Z"/><path d="M247.04,20.11h-13.98v40.38c-8.68,3.1-20.27.12-19.84-10.84v-29.54h-13.76v29.48c0,15.96,11.86,24.52,26.34,24.52,6.57,0,13.17-1.04,21.27-3.98l-.06-.06V20.11h.02Z"/><path d="M113.08,22.9h.06v-.04l-.06.06v-.02Z"/><path d="M28.52,49.75l-2,14.17h-.69l-2.23-14.39-8.84-29.7H0l17.41,53.4h17.25l17.52-53.4h-14.76l-8.9,29.91Z"/><path d="M111.18,22.88v50.14h13.98v-40.48c8.31-3.55,19.95-1.41,19.84,10.25v30.31h13.76v-30.34c-.31-26.78-28.83-26.82-47.57-19.86v-.02Z"/><path d="M71.45,57.04l33.44-16.45c-.69-2.67-1.74-5.12-2.43-6.65-6.19-13.35-20.43-19.17-33.93-12.43-15.29,7.63-17.78,24.03-12.07,36.34,5.61,12.37,19.43,21.09,35.24,13.29,6.72-3.33,11.64-9,14.29-18.03l-10-2.94c-4.39,10.68-18.09,15.25-24.56,6.86h.02ZM73.82,32.58c4.7-2.35,10.74-2.18,14.82,3.92l-21.76,10.68c-1.96-6.86,2.22-12.25,6.94-14.6Z"/><path d="M334.57,50.24c-4.29,10.74-17.99,15.37-24.5,7.04l33.34-16.68c-.69-2.67-1.74-5.12-2.43-6.65-6.29-13.35-20.58-19.07-34.03-12.25-15.29,7.74-17.68,24.09-11.9,36.4,5.67,12.31,19.52,20.92,35.3,13.07,6.76-3.37,11.62-9.02,14.21-18.03l-9.98-2.88-.02-.02ZM312.24,32.7c4.76-2.39,10.8-2.23,14.88,3.82l-21.7,10.84c-2.02-6.86,2.02-12.25,6.82-14.66Z"/><path d="M592.75,74.06c-2.35,0-4.01-1.57-4.01-3.78s1.66-3.76,4.01-3.76,3.98,1.55,3.98,3.76-1.65,3.78-3.98,3.78ZM592.75,73.36c1.87,0,3.18-1.27,3.18-3.07s-1.32-3.06-3.18-3.06-3.18,1.27-3.18,3.06,1.32,3.07,3.18,3.07ZM591.37,72.24v-3.92h1.57c.88,0,1.47.38,1.47,1.02,0,.58-.47.89-.97.97.52.08.8.33.83.83.02.47.03.99.16,1.1h-.8c-.09-.19-.11-.55-.13-.96-.02-.5-.25-.67-.75-.67h-.61v1.63h-.77ZM592.14,70.02h.75c.45,0,.71-.27.71-.6s-.28-.52-.71-.52h-.75v1.11Z"/></g></svg>`;

  // Build human-readable line items for the printed quote from the current inputs.
  const buildLineItems = (q) => {
    const p = formData.panelQuantity;
    const panelWord = `${p} panel${p > 1 ? 's' : ''}`;
    const items = [];

    if (formData.serviceType === 'Critter Guards') {
      items.push({ desc: `Critter guard installation — ${panelWord} (@ $25.00/panel)`, amount: p * 25 });
      items.push({ desc: 'Base service fee', amount: 250 });
    } else if (formData.serviceType === 'Temp Removal/Reinstall for Roof Work') {
      items.push({ desc: `Temporary removal & reinstall — ${panelWord} (@ $325.00/panel)`, amount: p * 325 });
    } else {
      if (q.labor > 0) {
        const role = requiresElectrician ? 'licensed electrician' : 'technician';
        const roleWord = `${formData.technicianCount} ${role}${formData.technicianCount > 1 ? 's' : ''}`;
        const rate = requiresElectrician ? '86.45' : '39.90';
        items.push({
          desc: `Labor — ${formData.estimatedHours} hr × ${roleWord} @ $${rate}/hr`,
          amount: q.labor,
        });
      }
      if (q.materials > 0) {
        const list = formData.materials.length ? formData.materials.join(', ') : 'materials';
        items.push({ desc: `Materials (${list}) — incl. 15% margin`, amount: q.materials });
      }
    }
    return items;
  };

  // Generate a branded, printable PDF quote. Uses the browser's native
  // print-to-PDF via a hidden iframe — no external dependencies required.
  const generatePDF = () => {
    if (!formData.serviceType || !formData.customerAddress.trim()) return;
    const q = calculateQuote();
    const items = buildLineItems(q);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pad = (n) => String(n).padStart(2, '0');
    const quoteNo = `VH-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const stateName = stateNames[detectedState] || detectedState || 'the service state';
    const customerAddress = formData.customerAddress.trim();
    const panelWord = `${formData.panelQuantity} panel${formData.panelQuantity > 1 ? 's' : ''}`;
    const rows = items
      .map((it) => `<tr><td class="desc">${it.desc}</td><td class="amt">${money(it.amount)}</td></tr>`)
      .join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<title>Venture Home Quote ${quoteNo}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Outfit', Arial, sans-serif; color: #1a2230; margin: 0; padding: 48px 56px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #73FFC6; padding-bottom: 18px; }
  .logo svg { height: 26px; width: auto; display: block; }
  .contact { text-align: right; font-size: 12px; color: #6b7688; line-height: 1.7; }
  .title { font-size: 22px; font-weight: 700; margin: 32px 0 18px; }
  .meta { display: flex; flex-wrap: wrap; gap: 32px; font-size: 13px; color: #6b7688; margin-bottom: 26px; }
  .meta .lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
  .meta b { display: block; color: #1a2230; font-weight: 600; font-size: 14px; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #8b95a3; border-bottom: 2px solid #e3e7ee; padding: 0 0 8px; }
  th.amt, td.amt { text-align: right; }
  td { padding: 14px 0; border-bottom: 1px solid #eef1f5; font-size: 14px; vertical-align: top; }
  td.amt { font-family: 'JetBrains Mono', monospace; white-space: nowrap; padding-left: 24px; }
  .total { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 16px 20px; background: #231F20; border-radius: 8px; }
  .total .lbl { color: #ffffff; font-size: 16px; font-weight: 600; }
  .total .val { color: #73FFC6; font-size: 22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .note { margin-top: 22px; padding: 13px 16px; background: #EAFBF3; border: 1px solid #73FFC6; border-radius: 6px; font-size: 12.5px; color: #231F20; }
  .terms { margin-top: 34px; font-size: 11px; color: #9aa4b2; line-height: 1.7; border-top: 1px solid #eef1f5; padding-top: 16px; }
  @media print { body { padding: 32px 40px; } }
</style></head>
<body>
  <div class="head">
    <div class="logo">${LOGO_SVG}</div>
    <div class="contact">${COMPANY.phone}<br/>${COMPANY.email}<br/>${COMPANY.web}</div>
  </div>
  <div class="title">Service Quote</div>
  <div class="meta">
    <div><div class="lbl">Quote #</div><b>${quoteNo}</b></div>
    <div><div class="lbl">Date</div><b>${dateStr}</b></div>
    <div><div class="lbl">Service</div><b>${formData.serviceType}</b></div>
    <div><div class="lbl">Location</div><b>${customerAddress}</b></div>
    <div><div class="lbl">System</div><b>${panelWord}</b></div>
  </div>
  <table>
    <thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total"><div class="lbl">Total Quote</div><div class="val">${money(q.total)}</div></div>
  ${requiresElectrician ? `<div class="note">&#9889; This service requires a licensed electrician in ${stateName}. Labor is priced at the licensed electrician rate.</div>` : ''}
  <div class="terms">This quote is an estimate for post-installation service work and is valid for 30 days from the date above. Final pricing may vary based on site conditions confirmed at the time of service. Prepared by ${COMPANY.name}. Questions? Call ${COMPANY.phone} or email ${COMPANY.email}.</div>
</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    let printed = false;
    const triggerPrint = () => {
      if (printed) return;
      printed = true;
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1000);
      }
    };
    // Give the fonts/layout a moment to settle before opening the print dialog.
    iframe.onload = () => setTimeout(triggerPrint, 400);
    // Fallback in case onload doesn't fire for the written document.
    setTimeout(triggerPrint, 800);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: T.bg, 
      fontFamily: "'Outfit', sans-serif",
      color: T.text,
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{
          marginBottom: '32px',
          borderBottom: `1px solid ${T.border}`,
          paddingBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <img
              src="/vh-logo.svg"
              alt="Venture Home"
              style={{ height: '30px', display: 'block', marginBottom: '16px' }}
            />
            <h1 style={{
              fontSize: '26px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              color: T.text
            }}>
              Service Quote Generator
            </h1>
            <p style={{ color: T.muted, margin: 0, fontSize: '15px' }}>
              Standardized pricing for post-install service work
            </p>
          </div>
          <div style={{ textAlign: 'right', color: T.muted, fontSize: '13px', lineHeight: 1.7 }}>
            (888) 522-9161<br />
            support@venturehome.com
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Quote Form */}
          <div style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: '0 0 24px 0',
              color: T.text
            }}>
              Quote Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Service Type */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: T.text
                }}>
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: '6px',
                    color: T.text,
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select service type...</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Customer Address */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: T.text
                }}>
                  Customer Address
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                  placeholder="Start typing the address…"
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: '6px',
                    color: T.text,
                    fontSize: '14px'
                  }}
                />
                {formData.customerAddress.trim() && !serviceStates.includes(detectedState) && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: T.red }}>
                    {detectedState
                      ? `${stateNames[detectedState] || detectedState} is outside Venture's service area.`
                      : 'Add the state or ZIP so pricing applies correctly.'}
                  </p>
                )}
              </div>

              {/* System Size */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: T.text
                }}>
                  Number of Panels
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.panelQuantity}
                  onChange={(e) => handleInputChange('panelQuantity', parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: T.bg,
                    border: `1px solid ${T.border}`,
                    borderRadius: '6px',
                    color: T.text,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Labor Estimates - Only show for non-formula services */}
              {!['Critter Guards', 'Temp Removal/Reinstall for Roof Work'].includes(formData.serviceType) && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        color: T.text
                      }}>
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.estimatedHours}
                        onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 1)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: T.bg,
                          border: `1px solid ${T.border}`,
                          borderRadius: '6px',
                          color: T.text,
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        color: T.text
                      }}>
                        Technicians
                      </label>
                      <select
                        value={formData.technicianCount}
                        onChange={(e) => handleInputChange('technicianCount', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: T.bg,
                          border: `1px solid ${T.border}`,
                          borderRadius: '6px',
                          color: T.text,
                          fontSize: '14px'
                        }}
                      >
                        <option value="1">1 Technician</option>
                        <option value="2">2 Technicians</option>
                      </select>
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '12px', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: T.text
                    }}>
                      Materials Needed
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {materials.map(material => (
                        <label key={material} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={formData.materials.includes(material)}
                            onChange={() => handleMaterialToggle(material)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '14px', color: T.text }}>
                            {material}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Technician Type Alert */}
              {requiresElectrician && (
                <div style={{
                  backgroundColor: '#EAFBF3',
                  border: `1px solid ${T.accent}`,
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: T.ink
                }}>
                  ⚡ Licensed electrician required for this service in {stateNames[detectedState] || detectedState}
                </div>
              )}

              {/* Generate Quote Button */}
              <button
                onClick={generateQuote}
                disabled={!formData.serviceType || !formData.customerAddress.trim()}
                onMouseEnter={() => setHoverStates(prev => ({ ...prev, generate: true }))}
                onMouseLeave={() => setHoverStates(prev => ({ ...prev, generate: false }))}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: formData.serviceType && formData.customerAddress.trim() ? T.accent : '#EDEFEC',
                  color: formData.serviceType && formData.customerAddress.trim() ? T.ink : T.dim,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: formData.serviceType && formData.customerAddress.trim() ? 'pointer' : 'not-allowed',
                  transform: hoverStates.generate ? 'translateY(-1px)' : 'translateY(0)',
                  transition: 'all 0.2s ease'
                }}
              >
                Generate Quote
              </button>
            </div>
          </div>

          {/* Quote Preview */}
          <div style={{
            backgroundColor: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: '8px',
            padding: '24px',
            opacity: showQuote ? 1 : 0.5
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: '0 0 24px 0',
              color: T.text
            }}>
              Quote Preview
            </h2>

            {showQuote && quote ? (
              <div>
                {/* Quote Header */}
                <div style={{ 
                  borderBottom: `1px solid ${T.border}`, 
                  paddingBottom: '16px', 
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    margin: '0 0 8px 0',
                    color: T.text
                  }}>
                    {formData.serviceType}
                  </h3>
                  <p style={{ 
                    color: T.muted, 
                    margin: 0, 
                    fontSize: '14px' 
                  }}>
                    {formData.customerAddress} • {formData.panelQuantity} panels
                    {requiresElectrician && ' • Licensed electrician required'}
                  </p>
                </div>

                {/* Quote Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Only show breakdown for non-formula services */}
                  {!['Critter Guards', 'Temp Removal/Reinstall for Roof Work'].includes(formData.serviceType) && (
                    <>
                      {quote.labor > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: T.muted }}>
                            Labor ({formData.estimatedHours}h × {formData.technicianCount} × ${requiresElectrician ? '86.45' : '39.90'}/hr)
                          </span>
                          <span style={{ 
                            fontFamily: "'JetBrains Mono', monospace", 
                            color: T.text 
                          }}>
                            ${quote.labor.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {quote.materials > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: T.muted }}>Materials (incl. 15% margin)</span>
                          <span style={{ 
                            fontFamily: "'JetBrains Mono', monospace", 
                            color: T.text 
                          }}>
                            ${quote.materials.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Total */}
                  <div style={{
                    marginTop: '8px',
                    padding: '16px 20px',
                    backgroundColor: T.ink,
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#FFFFFF'
                    }}>
                      Total Quote
                    </span>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: T.accent
                    }}>
                      ${quote.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Generate PDF Button */}
                <button
                  onClick={generatePDF}
                  onMouseEnter={() => setHoverStates(prev => ({ ...prev, pdf: true }))}
                  onMouseLeave={() => setHoverStates(prev => ({ ...prev, pdf: false }))}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '12px 24px',
                    backgroundColor: hoverStates.pdf ? T.ink : 'transparent',
                    color: hoverStates.pdf ? '#FFFFFF' : T.ink,
                    border: `1px solid ${T.ink}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transform: hoverStates.pdf ? 'translateY(-1px)' : 'translateY(0)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📄 Generate PDF Quote
                </button>
              </div>
            ) : (
              <p style={{ color: T.muted, fontSize: '14px', textAlign: 'center', marginTop: '60px' }}>
                Fill out the form and generate a quote to see the preview
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
