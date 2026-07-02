import { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    serviceType: '',
    state: '',
    panelQuantity: 1,
    estimatedHours: 1,
    technicianCount: 1,
    materials: []
  });

  const [showQuote, setShowQuote] = useState(false);
  const [hoverStates, setHoverStates] = useState({});

  const T = {
    bg: "#0A0D10",
    surface: "#11151A", 
    border: "#1E2530",
    accent: "#F0A830",
    green: "#2DD4A8",
    red: "#F87171",
    text: "#E8EDF3",
    muted: "#8B95A3",
    dim: "#4A5568",
  };

  const serviceTypes = [
    'Critter Guards',
    'Temp Removal/Reinstall for Roof Work', 
    'BOS Repair for Siding',
    'System Reconnection',
    'Panel/Inverter Replacement',
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
  const requiresElectrician = electricianStates.includes(formData.state) && 
    ['BOS Repair for Siding', 'System Reconnection', 'Panel/Inverter Replacement'].includes(formData.serviceType);

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
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowQuote(false);
  };

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
    email: 'contact@venturehome.com',
    web: 'venturehome.com',
  };

  const stateNames = {
    ME: 'Maine', NH: 'New Hampshire', RI: 'Rhode Island', MA: 'Massachusetts',
    CT: 'Connecticut', NY: 'New York', NJ: 'New Jersey', MD: 'Maryland', PA: 'Pennsylvania',
  };

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
    if (!formData.serviceType || !formData.state) return;
    const q = calculateQuote();
    const items = buildLineItems(q);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const pad = (n) => String(n).padStart(2, '0');
    const quoteNo = `VH-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const locationName = stateNames[formData.state] || formData.state;
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
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #F0A830; padding-bottom: 18px; }
  .wordmark { font-size: 26px; font-weight: 700; letter-spacing: 1px; color: #0A0D10; }
  .wordmark span { color: #F0A830; }
  .tag { font-size: 12px; color: #6b7688; margin-top: 4px; }
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
  .total { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 16px 20px; background: #0A0D10; border-radius: 8px; }
  .total .lbl { color: #ffffff; font-size: 16px; font-weight: 600; }
  .total .val { color: #2DD4A8; font-size: 22px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .note { margin-top: 22px; padding: 13px 16px; background: #FEF6E7; border: 1px solid #F0A830; border-radius: 6px; font-size: 12.5px; color: #7a5b13; }
  .terms { margin-top: 34px; font-size: 11px; color: #9aa4b2; line-height: 1.7; border-top: 1px solid #eef1f5; padding-top: 16px; }
  @media print { body { padding: 32px 40px; } }
</style></head>
<body>
  <div class="head">
    <div>
      <div class="wordmark">VENTURE <span>HOME</span></div>
      <div class="tag">Whole-Home Solar &middot; Battery &middot; EV Charging</div>
    </div>
    <div class="contact">${COMPANY.phone}<br/>${COMPANY.email}<br/>${COMPANY.web}</div>
  </div>
  <div class="title">Service Quote</div>
  <div class="meta">
    <div><div class="lbl">Quote #</div><b>${quoteNo}</b></div>
    <div><div class="lbl">Date</div><b>${dateStr}</b></div>
    <div><div class="lbl">Service</div><b>${formData.serviceType}</b></div>
    <div><div class="lbl">Location</div><b>${locationName}</b></div>
    <div><div class="lbl">System</div><b>${panelWord}</b></div>
  </div>
  <table>
    <thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total"><div class="lbl">Total Quote</div><div class="val">${money(q.total)}</div></div>
  ${requiresElectrician ? `<div class="note">&#9889; This service requires a licensed electrician in ${locationName}. Labor is priced at the licensed electrician rate.</div>` : ''}
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
            <div style={{
              fontSize: '22px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: T.text,
              marginBottom: '12px'
            }}>
              VENTURE <span style={{ color: T.accent }}>HOME</span>
            </div>
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
            contact@venturehome.com
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
                  Service Type *
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

              {/* State */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: '500',
                  color: T.text
                }}>
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
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
                  <option value="">Select state...</option>
                  {serviceStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
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
                  backgroundColor: T.accent + '20',
                  border: `1px solid ${T.accent}`,
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  color: T.accent
                }}>
                  ⚡ Licensed electrician required for this service in {formData.state}
                </div>
              )}

              {/* Generate Quote Button */}
              <button
                onClick={generateQuote}
                disabled={!formData.serviceType || !formData.state}
                onMouseEnter={() => setHoverStates(prev => ({ ...prev, generate: true }))}
                onMouseLeave={() => setHoverStates(prev => ({ ...prev, generate: false }))}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  backgroundColor: formData.serviceType && formData.state ? T.accent : T.dim,
                  color: formData.serviceType && formData.state ? T.bg : T.muted,
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: formData.serviceType && formData.state ? 'pointer' : 'not-allowed',
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
                    {formData.state} • {formData.panelQuantity} panels
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
                    borderTop: `1px solid ${T.border}`,
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: T.text 
                    }}>
                      Total Quote
                    </span>
                    <span style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      fontFamily: "'JetBrains Mono', monospace",
                      color: T.green
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
                    backgroundColor: 'transparent',
                    color: T.accent,
                    border: `1px solid ${T.accent}`,
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
