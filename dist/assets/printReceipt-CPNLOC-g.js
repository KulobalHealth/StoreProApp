const w=(e,d="Awosel OS")=>{f(e,d)},t="print-receipt-content",a="print-receipt-styles",f=(e,d="Awosel OS")=>{if(!e){console.error("No receipt element provided"),alert("Unable to print receipt - receipt content not found");return}const i=e.cloneNode(!0);if(!i.textContent||i.textContent.trim()===""){console.error("Receipt content is empty"),alert("Receipt content is empty. Cannot print.");return}const y=`
    @page { size: 55mm auto; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; width: 55mm !important; height: auto !important; }
      body > *:not(#${t}) { display: none !important; visibility: hidden !important; }
      #${t} { display: block !important; visibility: visible !important; width: 55mm !important; margin: 0 !important; padding: 2mm !important; position: relative !important; }
    }
    @media screen {
      #${t} { position: absolute; left: -9999px; top: 0; }
    }
    #${t} { font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; color: #000; background: #fff; }
    #${t} .receipt-container { width: 100%; max-width: 55mm; }
    #${t} h1, #${t} h2, #${t} h3, #${t} table { page-break-inside: avoid; }
    #${t} * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  `,p=document.getElementById(t);p&&p.remove();const m=document.getElementById(a);m&&m.remove();const o=document.createElement("div");o.id=t,o.appendChild(i),document.body.appendChild(o);const r=document.createElement("style");r.id=a,r.textContent=y,document.head.appendChild(r);const c=()=>{const n=document.getElementById(t),u=document.getElementById(a);n&&n.remove(),u&&u.remove(),window.removeEventListener("beforeprint",s),window.removeEventListener("afterprint",l)},s=()=>{},l=()=>c();window.addEventListener("beforeprint",s),window.addEventListener("afterprint",l),setTimeout(()=>{window.focus();try{window.print()}catch(n){console.error("Print error:",n)}setTimeout(()=>{document.getElementById(t)&&c()},5e3)},150)};export{w as a,f as p};
