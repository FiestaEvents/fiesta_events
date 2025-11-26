import React from 'react';

// Helper for Tunisian Currency (3 decimals)
const formatTND = (amount) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3
  }).format(amount || 0);
};

const LiveContractPreview = ({ settings, data }) => {
  
  // 1. Defaults tailored for Tunisia
  const defaults = {
    branding: { 
      color: '#F18237', // Orange accent
      fontBody: 'Arial, sans-serif',
    },
    companyInfo: { 
      displayName: 'VOTRE SOCIÉTÉ', 
      legalName: 'NOM LÉGAL DE LA SOCIÉTÉ', 
      matriculeFiscale: '0000000/A/M/000', 
      address: 'Adresse de la société, Tunisie', 
      rib: '00 000 000 0000000000 00',
      phone: '+216 00 000 000'
    },
  };

  const company = { ...defaults.companyInfo, ...settings?.companyInfo };
  const primaryColor = settings?.branding?.colors?.primary || defaults.branding.color;

  // 2. Data Accessors
  const party = data?.party || {};
  const logistics = data?.logistics || {};
  const financials = data?.financials || {};
  const legal = data?.legal || {};
  const contractDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // 3. Styles (Inline for PDF generation compatibility)
  const s = {
    page: {
      width: '794px', // A4 pixel width
      minHeight: '1123px',
      backgroundColor: 'white',
      padding: '60px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: '11pt',
      color: '#000',
      lineHeight: '1.4',
      margin: '0 auto',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'relative'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '40px',
      borderBottom: `2px solid ${primaryColor}`,
      paddingBottom: '20px'
    },
    title: {
      textAlign: 'center',
      fontSize: '18pt',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: '30px',
      letterSpacing: '1px'
    },
    sectionTitle: {
      fontSize: '11pt',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#333',
      borderBottom: '1px solid #ddd',
      paddingBottom: '5px',
      marginTop: '25px',
      marginBottom: '10px'
    },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    label: { fontWeight: 'bold', width: '150px' },
    value: { flex: 1 },
    textJustify: { textAlign: 'justify' }
  };

  return (
    <div style={s.page} id="contract-preview">
      
      {/* --- HEADER --- */}
      <div style={s.header}>
        <div>
           {/* Logo placeholder or Company Name */}
           <h2 style={{ color: primaryColor, fontWeight: '900', fontSize: '16pt', textTransform: 'uppercase', margin: 0 }}>
             {company.displayName}
           </h2>
           <div style={{ fontSize: '9pt', marginTop: '5px', color: '#555' }}>
             <p style={{margin: 0}}>{company.address}</p>
             <p style={{margin: 0}}>MF: {company.matriculeFiscale}</p>
             <p style={{margin: 0}}>Tél: {company.phone}</p>
           </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10pt' }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>Réf: {data?.contractNumber || 'DRAFT-001'}</p>
          <p style={{ margin: 0 }}>Tunis, le {contractDate}</p>
        </div>
      </div>

      {/* --- TITLE --- */}
      <h1 style={s.title}>
        {data?.contractType === 'partner' ? 'CONTRAT DE PARTENARIAT' : 'CONTRAT DE PRESTATION'}
      </h1>

      {/* --- ENTRE LES SOUSSIGNÉS --- */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ marginBottom: '15px' }}><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
        
        {/* FIRST PARTY (US) */}
        <div style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <span style={{ fontWeight: 'bold' }}>La Société {company.legalName}</span>, 
          immatriculée sous le M.F N° {company.matriculeFiscale}, 
          dont le siège social est situé à {company.address},
          <br/>Ci-après dénommée <strong>« Le Prestataire »</strong> d'une part.
        </div>

        {/* SECOND PARTY (THEM) */}
        <div style={{ paddingLeft: '20px' }}>
          <span style={{ fontWeight: 'bold' }}>
            {party.type === 'company' ? `La Société ${party.name || '___________'}` : `Mr/Mme ${party.name || '___________'}`}
          </span>,
          {party.type === 'company' 
            ? ` immatriculée sous le M.F N° ${party.identifier || '___________'}` 
            : ` titulaire de la CIN N° ${party.identifier || '___________'}`
          },
          dont l'adresse est située à {party.address || '______________________'},
          <br/>Ci-après dénommé(e) <strong>« Le Client »</strong> d'autre part.
        </div>
      </div>

      <p style={{ textAlign: 'center', fontStyle: 'italic', margin: '20px 0' }}>
        Il a été convenu et arrêté ce qui suit :
      </p>

      {/* --- CONTENT --- */}
      
      {/* ARTICLE 1 : OBJET */}
      <div style={s.sectionTitle}>ARTICLE 1 : OBJET DU CONTRAT</div>
      <p style={s.textJustify}>
        Le présent contrat a pour objet la prestation de services suivante : <strong>{data?.title || 'Organisation d\'événement'}</strong>. 
        L'événement est prévu du <strong>{logistics.startDate ? new Date(logistics.startDate).toLocaleDateString('fr-FR') : '...'}</strong> au <strong>{logistics.endDate ? new Date(logistics.endDate).toLocaleDateString('fr-FR') : '...'}</strong>.
      </p>

      {/* ARTICLE 2 : SERVICES & LOGISTIQUE */}
      <div style={s.sectionTitle}>ARTICLE 2 : DÉTAILS DE LA PRESTATION</div>
      <div style={{ fontSize: '10pt', marginLeft: '10px' }}>
        <div style={s.row}><span style={s.label}>Date :</span> <span>{logistics.startDate || '...'}</span></div>
        <div style={s.row}><span style={s.label}>Heure de mise en place :</span> <span>{logistics.checkInTime || '10:00'}</span></div>
        <div style={s.row}><span style={s.label}>Heure de fin :</span> <span>{logistics.checkOutTime || '00:00'}</span></div>
      </div>
      
      {/* ARTICLE 3 : CONDITIONS FINANCIERES */}
      <div style={s.sectionTitle}>ARTICLE 3 : CONDITIONS FINANCIÈRES</div>
      <p style={s.textJustify}>
        En contrepartie des services décrits ci-dessus, le Client s'engage à payer la somme détaillée ci-après.
      </p>

      {/* ARTICLE 4 : PAIEMENT */}
      <div style={s.sectionTitle}>ARTICLE 4 : MODALITÉS DE PAIEMENT</div>
      <p style={s.textJustify}>
        Le règlement s'effectuera par chèque ou virement bancaire.
        {financials.depositAmount > 0 && ` Une avance de ${formatTND(financials.depositAmount)} est exigée à la signature.`}
        {company.rib && <><br/><strong>RIB : {company.rib}</strong></>}
      </p>

      {/* ARTICLE 5 : JURIDICTION */}
      <div style={s.sectionTitle}>ARTICLE 5 : JURIDICTION</div>
      <p style={s.textJustify}>
        Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera de la compétence exclusive du {legal.jurisdiction || 'Tribunal de Tunis'}.
      </p>

      {/* --- SIGNATURES --- */}
      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', breakInside: 'avoid' }}>
        <div style={{ width: '45%' }}>
          <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '50px' }}>POUR {company.displayName}</p>
          <p style={{ fontSize: '9pt', color: '#888' }}>(Signature et Cachet)</p>
        </div>
        <div style={{ width: '45%' }}>
          <p style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '50px' }}>POUR LE CLIENT</p>
          <p style={{ fontSize: '9pt', color: '#888' }}>(Lu et approuvé, Bon pour accord)</p>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div style={{ position: 'absolute', bottom: '40px', left: '60px', right: '60px', textAlign: 'center', fontSize: '8pt', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        {company.legalName} - MF: {company.matriculeFiscale} - Adresse: {company.address}
      </div>

    </div>
  );
};

export default LiveContractPreview;