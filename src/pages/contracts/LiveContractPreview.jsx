import React from 'react';
import formatDate from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency';

const LiveContractPreview = ({ settings, data }) => {
  
  // 1. Defaults (Tunisian Context) combined with Settings Prop
  const s = {
    branding: { 
      primary: settings?.branding?.colors?.primary || '#F18237', 
      text: '#1F2937',
      logo: settings?.branding?.logo 
    },
    company: { 
      displayName: settings?.companyInfo?.displayName || 'VOTRE SOCIÉTÉ',
      legalName: settings?.companyInfo?.legalName || '', 
      matriculeFiscale: settings?.companyInfo?.matriculeFiscale || '', 
      address: settings?.companyInfo?.address || '', 
      rib: settings?.companyInfo?.rib || '',
      phone: settings?.companyInfo?.phone || ''
    },
    labels: settings?.labels || {
      contractTitle: 'CONTRAT DE PRESTATION',
      clientLabel: 'Le Client',
      partnerLabel: 'Le Partenaire'
    }
  };

  // 2. Data Safe Accessors
  const party = data?.party || {};
  const financials = data?.financials || {};
  const logistics = data?.logistics || {};
  const legal = data?.legal || {};
  const services = data?.services || [];
  
  const partyLabel = data?.contractType === 'partner' ? s.labels.partnerLabel : s.labels.clientLabel;

  // 3. CSS Styles for A4 Paper (Inline for reliable PDF generation)
  const styles = {
    page: {
      width: '794px', // Standard A4 pixel width at 96 DPI
      minHeight: '1123px', 
      backgroundColor: 'white',
      padding: '50px 60px',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '11px',
      color: '#000',
      lineHeight: '1.5',
      margin: '0 auto',
      boxShadow: '0 0 15px rgba(0,0,0,0.05)',
      position: 'relative'
    },
    headerRow: { display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${s.branding.primary}`, paddingBottom: '20px', marginBottom: '30px' },
    title: { textAlign: 'center', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '25px', letterSpacing: '1px' },
    h3: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' },
    p: { marginBottom: '8px', textAlign: 'justify' },
    bold: { fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '10px' },
    th: { borderBottom: '1px solid #000', textAlign: 'left', padding: '6px', fontWeight: 'bold' },
    td: { borderBottom: '1px solid #eee', padding: '6px' },
    tdNum: { textAlign: 'right' },
    signatureBox: { height: '100px', border: '1px solid #ddd', borderRadius: '4px', marginTop: '10px', backgroundColor: '#f9fafb' }
  };

  return (
    <div style={styles.page} id="contract-preview">
      
      {/* --- HEADER --- */}
      <div style={styles.headerRow}>
        <div>
          {s.branding.logo?.url ? (
            <img 
              src={s.branding.logo.url.startsWith('http') ? s.branding.logo.url : `http://localhost:5000${s.branding.logo.url}`} 
              alt="Logo" 
              style={{ height: '50px', objectFit: 'contain', marginBottom: '5px' }} 
            />
          ) : (
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: s.branding.primary }}>{s.company.displayName}</h2>
          )}
          <div style={{ fontSize: '9px', color: '#555' }}>
            <p style={{ margin: 0 }}>{s.company.legalName}</p>
            <p style={{ margin: 0 }}>{s.company.address}</p>
            <p style={{ margin: 0 }}>MF: {s.company.matriculeFiscale}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{s.labels.contractTitle}</p>
          <p style={{ fontSize: '10px', fontFamily: 'monospace' }}>Réf: {data?.contractNumber || 'BROUILLON'}</p>
          <p style={{ fontSize: '10px' }}>Date: {formatDate(new Date())}</p>
        </div>
      </div>

      {/* --- PARTIES --- */}
      <div style={{ marginBottom: '25px' }}>
        <p style={styles.p}><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
        
        {/* Provider */}
        <div style={{ paddingLeft: '20px', marginBottom: '10px' }}>
          <span style={styles.bold}>La Société {s.company.legalName}</span>, 
          immatriculée sous le M.F N° {s.company.matriculeFiscale}, 
          dont le siège social est sis à {s.company.address}.
          <br/>Ci-après dénommée <strong>« Le Prestataire »</strong>.
        </div>

        {/* Client */}
        <div style={{ paddingLeft: '20px' }}>
          <span style={styles.bold}>{party.name || '____________________'}</span>,
          {party.type === 'company' 
            ? ` immatriculée sous le M.F N° ${party.identifier || '___________'}` 
            : ` titulaire de la CIN N° ${party.identifier || '___________'}`
          },
          {party.address && ` demeurant à ${party.address}`}.
          <br/>Ci-après dénommé(e) <strong>« {partyLabel} »</strong>.
        </div>
      </div>

      <div style={{ textAlign: 'center', fontStyle: 'italic', margin: '20px 0', fontSize: '10px' }}>
        Il a été convenu et arrêté ce qui suit :
      </div>

      {/* --- CONTENT --- */}
      <h3 style={styles.h3}>Article 1 : Objet du Contrat</h3>
      <p style={styles.p}>
        Le présent contrat a pour objet : <strong>{data?.title || 'Organisation d\'événement'}</strong>.
        <br/>
        L'événement aura lieu du <strong>{formatDate(logistics.startDate)}</strong> au <strong>{formatDate(logistics.endDate)}</strong>.
      </p>

      <h3 style={styles.h3}>Article 2 : Détails Logistiques</h3>
      <div style={{ display: 'flex', gap: '40px', fontSize: '10px', marginBottom: '10px' }}>
        <div><span style={{opacity: 0.6}}>Mise en place :</span> <strong>{logistics.checkInTime || '10:00'}</strong></div>
        <div><span style={{opacity: 0.6}}>Libération :</span> <strong>{logistics.checkOutTime || '00:00'}</strong></div>
      </div>

      {/* --- FINANCIALS --- */}
      <h3 style={styles.h3}>Article 3 : Conditions Financières</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Désignation</th>
            <th style={{...styles.th, textAlign: 'center'}}>Qté</th>
            <th style={{...styles.th, textAlign: 'right'}}>P.U (HT)</th>
            <th style={{...styles.th, textAlign: 'right'}}>Total (HT)</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc, i) => (
            <tr key={i}>
              <td style={styles.td}>{svc.description || 'Prestation...'}</td>
              <td style={{...styles.td, textAlign: 'center'}}>{svc.quantity}</td>
              <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(svc.rate)}</td>
              <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(svc.amount)}</td>
            </tr>
          ))}
          {services.length === 0 && <tr><td colSpan="4" style={{...styles.td, textAlign: 'center', fontStyle: 'italic'}}>Aucun service ajouté</td></tr>}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
        <div style={{ width: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Total HT :</span> <strong>{formatCurrency(financials.amountHT)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>TVA ({financials.vatRate}%):</span> <span>{formatCurrency(financials.taxAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Timbre Fiscal :</span> <span>{formatCurrency(financials.stampDuty)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '2px solid #000', paddingTop: '5px', fontSize: '12px', fontWeight: 'bold' }}>
            <span>NET À PAYER :</span> <span style={{color: s.branding.primary}}>{formatCurrency(financials.totalTTC)}</span>
          </div>
          {(data?.paymentTerms?.depositAmount > 0) && (
            <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '5px', color: '#666' }}>
              Dont avance : {formatCurrency(data.paymentTerms.depositAmount)}
            </div>
          )}
        </div>
      </div>

      {/* --- LEGAL --- */}
      <h3 style={styles.h3}>Article 4 : Dispositions Diverses</h3>
      <p style={styles.p}>
        <strong>Juridiction :</strong> En cas de litige, seuls les tribunaux de <strong>{legal.jurisdiction || 'Tunis'}</strong> seront compétents.
        <br/>
        {legal.specialConditions && <><strong>Conditions Spéciales :</strong> {legal.specialConditions}</>}
      </p>

      {/* --- SIGNATURES --- */}
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', breakInside: 'avoid' }}>
        <div style={{ width: '45%' }}>
          <p style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', marginBottom: '5px' }}>Pour Le Prestataire</p>
          <div style={styles.signatureBox}></div>
        </div>
        <div style={{ width: '45%' }}>
          <p style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', marginBottom: '5px' }}>Pour {partyLabel}</p>
          <div style={styles.signatureBox}></div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div style={{ position: 'absolute', bottom: '30px', left: '60px', right: '60px', textAlign: 'center', fontSize: '8px', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
        {s.company.displayName} - MF: {s.company.matriculeFiscale} - Adresse: {s.company.address}
        {s.company.rib && <span> - RIB: {s.company.rib}</span>}
      </div>

    </div>
  );
};

export default LiveContractPreview;