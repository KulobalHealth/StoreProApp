// Browser print for receipts
export const printReceipt = (receiptElement, storeName = 'Awosel OS') => {
  printReceiptDirect(receiptElement, storeName)
}

const printContainerId = 'print-receipt-content'
const printStylesId = 'print-receipt-styles'

export const printReceiptDirect = (receiptElement, storeName = 'Awosel OS') => {
  if (!receiptElement) {
    console.error('No receipt element provided')
    alert('Unable to print receipt - receipt content not found')
    return
  }

  // Use cloneNode (deep) instead of innerHTML to prevent XSS from unsanitized content
  const clonedContent = receiptElement.cloneNode(true)
  if (!clonedContent.textContent || clonedContent.textContent.trim() === '') {
    console.error('Receipt content is empty')
    alert('Receipt content is empty. Cannot print.')
    return
  }

  const printStyles = `
    @page { size: 55mm auto; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; width: 55mm !important; height: auto !important; }
      body > *:not(#${printContainerId}) { display: none !important; visibility: hidden !important; }
      #${printContainerId} { display: block !important; visibility: visible !important; width: 55mm !important; margin: 0 !important; padding: 2mm !important; position: relative !important; }
    }
    @media screen {
      #${printContainerId} { position: absolute; left: -9999px; top: 0; }
    }
    #${printContainerId} { font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; color: #000; background: #fff; }
    #${printContainerId} .receipt-container { width: 100%; max-width: 55mm; }
    #${printContainerId} h1, #${printContainerId} h2, #${printContainerId} h3, #${printContainerId} table { page-break-inside: avoid; }
    #${printContainerId} * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  `

  const existingPrintContent = document.getElementById(printContainerId)
  if (existingPrintContent) existingPrintContent.remove()
  const existingPrintStyles = document.getElementById(printStylesId)
  if (existingPrintStyles) existingPrintStyles.remove()

  const printContainer = document.createElement('div')
  printContainer.id = printContainerId
  // Append cloned DOM nodes instead of using innerHTML (XSS-safe)
  printContainer.appendChild(clonedContent)
  document.body.appendChild(printContainer)

  const styleElement = document.createElement('style')
  styleElement.id = printStylesId
  styleElement.textContent = printStyles
  document.head.appendChild(styleElement)

  const cleanup = () => {
    const container = document.getElementById(printContainerId)
    const styles = document.getElementById(printStylesId)
    if (container) container.remove()
    if (styles) styles.remove()
    window.removeEventListener('beforeprint', beforePrintHandler)
    window.removeEventListener('afterprint', afterPrintHandler)
  }

  const beforePrintHandler = () => {}
  const afterPrintHandler = () => cleanup()

  window.addEventListener('beforeprint', beforePrintHandler)
  window.addEventListener('afterprint', afterPrintHandler)

  setTimeout(() => {
    window.focus()
    try { window.print() } catch (e) { console.error('Print error:', e) }
    setTimeout(() => { if (document.getElementById(printContainerId)) cleanup() }, 5000)
  }, 150)
}
