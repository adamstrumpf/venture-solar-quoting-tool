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

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: T.bg, 
      fontFamily: "'Outfit', sans-serif",
      color: T.text,
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: T.text
          }}>
            Service Quote Generator
          </h1>
          <p style={{ 
            color: T.muted, 
            margin: 0, 
            fontSize: '16px' 
          }}>
            Generate professional quotes for post-install services
          </p>
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
