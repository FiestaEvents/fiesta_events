import React from 'react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const LiveContractPreview = ({ settings, data }) => {
  
  // 1. Settings & Context Defaults
  const s = {
    branding: { 
      primary: settings?.branding?.colors?.primary || '#F18237',
      logo: settings?.branding?.logo 
    },
    company: { 
      displayName: settings?.companyInfo?.displayName || 'VOTRE SOCIÉTÉ',
      legalName: settings?.companyInfo?.legalName || '', 
      matriculeFiscale: settings?.companyInfo?.matriculeFiscale || '', 
      address: settings?.companyInfo?.address || '', 
    }
  };

  const isPartner = data?.contractType === 'partner';
  const services = data?.services || [];
  const financials = data?.financials || {};
  const logistics = data?.logistics || {};

  // 2. Dynamic Text Labels
  const titles = {
    header: isPartner ? 'ACCORD DE PARTENARIAT' : 'CONTRAT DE PRESTATION',
    party2Label: isPartner ? 'Le Partenaire' : 'Le Client',
    financialSection: isPartner ? 'Article 3 : Rémunération & Conditions' : 'Article 3 : Conditions Financières'
  };

  // 3. A4 Styles
  const styles = {
    page: {
      width: '794px', // A4 Width
      minHeight: '1123px', // A4 Height
      backgroundColor: 'white',
      padding: '50px 60px',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '11px',
      color: '#000',
      lineHeight: '1.6',
      margin: '0 auto',
      position: 'relative',
      boxShadow: '0 0 10px rgba(0,0,0,0.05)'
    },
    header: { display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${s.branding.primary}`, paddingBottom: '20px', marginBottom: '30px' },
    h1: { fontSize: '18px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' },
    h3: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '25px', marginBottom: '10px' },
    p: { marginBottom: '8px', textAlign: 'justify' },
    bold: { fontWeight: 'bold' },
    // Table (Client Only)
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '10px' },
    th: { borderBottom: '1px solid #000', textAlign: 'left', padding: '8px 5px', fontWeight: 'bold', backgroundColor: '#f9fafb' },
    td: { borderBottom: '1px solid #eee', padding: '8px 5px' },
    // Partner List
    listContainer: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px solid #eee', marginTop: '10px' },
    listItem: { marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }
  };

  return (
    <div style={styles.page} id="contract-preview">
      
      {/* --- HEADER --- */}
      <div style={styles.header}>
        <div>
           {s.branding.logo?.url ? (
            <img src={s.branding.logo.url} alt="Logo" style={{height: 50, marginBottom: 10}} />
           ) : (
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: s.branding.primary, margin: 0 }}>{s.company.displayName}</h2>
           )}
           <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
             {s.company.legalName}<br/>
             {s.company.address}<br/>
             MF: {s.company.matriculeFiscale}
           </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={styles.h1}>{titles.header}</div>
           <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>RÉF: {data?.contractNumber || 'BROUILLON'}</div>
           <div style={{ fontSize: '10px' }}>Fait à Tunis, le {formatDate(new Date())}</div>
        </div>
      </div>

      {/* --- PARTIES --- */}
      <div style={{ marginBottom: '20px' }}>
        <p style={styles.p}><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
        
        {/* Us */}
        <div style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <span style={styles.bold}>La Société {s.company.legalName}</span>, 
          immatriculée sous le M.F {s.company.matriculeFiscale}, 
          sise à {s.company.address}.<br/>
          Représentée par son gérant légal.<br/>
          Ci-après dénommée <strong>« {isPartner ? 'Le Donneur d\'Ordre' : 'Le Prestataire'} »</strong> d'une part.
        </div>

        {/* Them */}
        <div style={{ paddingLeft: '20px' }}>
          <span style={styles.bold}>{data?.party?.name || '____________________'}</span>
          {data?.party?.identifier ? `, identifié(e) par ${data.party.type === 'company' ? 'M.F' : 'CIN'} N° ${data.party.identifier}` : ''},
          {data?.party?.address ? ` demeurant à ${data.party.address}` : ''}.<br/>
          {data?.party?.representative ? `Représenté(e) par ${data.party.representative}.` : ''}<br/>
          Ci-après dénommé(e) <strong>« {titles.party2Label} »</strong> d'autre part.
        </div>
      </div>

      {/* --- OBJECT --- */}
      <div style={styles.h3}>Article 1 : Objet du Contrat</div>
      <p style={styles.p}>
        Le présent contrat a pour objet de définir les conditions de collaboration pour l'événement <strong>« {data?.title || '...'} »</strong> 
        qui se déroulera du <strong>{formatDate(logistics.startDate)}</strong> au <strong>{formatDate(logistics.endDate)}</strong>.
      </p>

      {/* --- FINANCIALS (The Logic Split) --- */}
      <div style={styles.h3}>{titles.financialSection}</div>

      {isPartner ? (
        // === PARTNER VIEW (Compensation Clause - No Invoice Look) ===
        <div>
          <p style={styles.p}>
            En contrepartie de la bonne exécution des prestations, le Donneur d'Ordre s'engage à rémunérer le Partenaire selon les tarifs convenus suivants :
          </p>
          <div style={styles.listContainer}>
            {services.map((svc, i) => (
              <div key={i} style={styles.listItem}>
                <span><strong>• {svc.description}</strong> {svc.quantity > 1 ? `(x${svc.quantity})` : ''}</span>
                <span>
                  {svc.rate > 0 ? formatCurrency(svc.amount) : 'Tarif à définir'}
                </span>
              </div>
            ))}
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc', fontWeight: 'bold', textAlign: 'right' }}>
              Total Estimé : {formatCurrency(financials.totalTTC)} TTC
            </div>
          </div>
          <p style={{...styles.p, fontSize: '10px', fontStyle: 'italic', marginTop: '10px'}}>
            * Le paiement sera effectué sur présentation d'une facture conforme ou note d'honoraires après service fait.
            {data.paymentTerms?.depositAmount > 0 && ` Une avance de ${formatCurrency(data.paymentTerms.depositAmount)} a été convenue.`}
          </p>
        </div>
      ) : (
        // === CLIENT VIEW (Schedule of Services - Invoice Look) ===
        <div>
          <p style={styles.p}>
            Le Client s'engage à régler le montant global détaillé ci-après pour les services fournis :
          </p>
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
                  <td style={styles.td}>{svc.description}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{svc.quantity}</td>
                  <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(svc.rate)}</td>
                  <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(svc.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Client Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <div style={{ width: '220px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Total HT :</span> <strong>{formatCurrency(financials.amountHT)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: '#666' }}>
                <span>TVA ({financials.vatRate}%):</span> <span>{formatCurrency(financials.taxAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '10px', color: '#666' }}>
                <span>Timbre Fiscal :</span> <span>{formatCurrency(financials.stampDuty)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '5px', marginTop: '5px', fontWeight: 'bold' }}>
                <span>NET À PAYER :</span> <span style={{color: s.branding.primary}}>{formatCurrency(financials.totalTTC)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LEGAL & JURISDICTION --- */}
      <div style={styles.h3}>Article 4 : Juridiction & Litiges</div>
      <p style={styles.p}>
        Le présent contrat est régi par la loi tunisienne. 
        En cas de litige, et à défaut d'accord amiable, compétence exclusive est attribuée au <strong>{data?.legal?.jurisdiction || 'Tribunal de Tunis'}</strong>.
      </p>
      {data?.legal?.specialConditions && (
        <>
          <div style={styles.h3}>Article 5 : Conditions Particulières</div>
          <p style={styles.p}>{data.legal.specialConditions}</p>
        </>
      )}

      {/* --- SIGNATURES --- */}
      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', breakInside: 'avoid' }}>
        <div style={{ width: '45%' }}>
          <p style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '40px', borderBottom: '1px solid #eee' }}>
            POUR {s.company.displayName}
          </p>
        </div>
        <div style={{ width: '45%' }}>
          <p style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '40px', borderBottom: '1px solid #eee' }}>
            POUR {titles.party2Label.toUpperCase()}
          </p>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', textAlign: 'center', fontSize: '8px', color: '#999', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
        {s.company.legalName} - MF: {s.company.matriculeFiscale} - {s.company.address}
      </div>

    </div>
  );
};

export default LiveContractPreview;