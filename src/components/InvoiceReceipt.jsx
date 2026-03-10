import React, { useRef } from 'react'
import { X, Download, Share2, Mail, MessageCircle, Printer } from 'lucide-react'
import { printReceipt } from '../utils/printReceipt'

const InvoiceReceipt = ({ invoice, storeInfo, onClose }) => {
  const receiptRef = useRef(null)

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePrint = () => {
    if (receiptRef.current) {
      printReceipt(receiptRef.current, storeInfo?.name || 'Awosel OS')
    }
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF
    // For now, we'll use the browser's print to PDF functionality
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups to download receipt')
        return
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice Receipt - ${invoice.invoiceNumber || 'N/A'}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
              }
              body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                color: #1e40af;
              }
              .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              .info-box {
                flex: 1;
              }
              .info-box h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #666;
                text-transform: uppercase;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f3f4f6;
                font-weight: bold;
              }
              .text-right {
                text-align: right;
              }
              .totals {
                margin-top: 20px;
                margin-left: auto;
                width: 300px;
              }
              .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
              }
              .totals-row.total {
                font-weight: bold;
                font-size: 16px;
                border-top: 2px solid #333;
                padding-top: 10px;
                margin-top: 10px;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 10px;
                color: #666;
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    }
  }

  const handleShareWhatsApp = () => {
    const receiptText = generateReceiptText()
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(receiptText)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleShareEmail = () => {
    const subject = `Invoice Receipt - ${invoice.invoiceNumber || 'N/A'}`
    const body = generateReceiptText()
    const emailUrl = `mailto:${invoice.customer?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }

  const generateReceiptText = () => {
    const storeName = storeInfo?.name || 'Awosel OS'
    const branchName = storeInfo?.branch || ''
    const storeAddress = storeInfo?.address || ''
    const storePhone = storeInfo?.phone || ''
    
    let text = `*${storeName}*\n`
    if (branchName) text += `${branchName}\n`
    if (storeAddress) text += `${storeAddress}\n`
    if (storePhone) text += `Phone: ${storePhone}\n`
    text += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
    text += `*INVOICE RECEIPT*\n\n`
    text += `Invoice #: ${invoice.invoiceNumber || 'N/A'}\n`
    text += `Date: ${formatDate(invoice.date)}\n`
    text += `Due Date: ${formatDate(invoice.dueDate)}\n`
    text += `Status: ${(invoice.status || 'draft').toUpperCase()}\n\n`
    
    text += `*Customer Details:*\n`
    text += `Name: ${invoice.customer?.name || 'N/A'}\n`
    if (invoice.customer?.email) text += `Email: ${invoice.customer.email}\n`
    if (invoice.customer?.phone) text += `Phone: ${invoice.customer.phone}\n`
    if (invoice.customer?.address) text += `Address: ${invoice.customer.address}\n`
    text += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
    
    text += `*Items:*\n\n`
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item, index) => {
        text += `${index + 1}. ${item.description || 'N/A'}\n`
        text += `   Qty: ${item.quantity || 0} x ₵${(item.price || 0).toFixed(2)} = ₵${(item.total || 0).toFixed(2)}\n\n`
      })
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`
    text += `Subtotal: ₵${(invoice.subtotal || 0).toFixed(2)}\n`
    if ((invoice.discount || 0) > 0) {
      text += `Discount: -₵${(invoice.discount || 0).toFixed(2)}\n`
    }
    text += `Tax: ₵${(invoice.tax || 0).toFixed(2)}\n`
    text += `*Total: ₵${(invoice.total || 0).toFixed(2)}*\n`
    text += `Paid: ₵${(invoice.paid || 0).toFixed(2)}\n`
    text += `Balance: ₵${(invoice.balance || 0).toFixed(2)}\n\n`
    
    if (invoice.notes) {
      text += `Notes: ${invoice.notes}\n\n`
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━\n`
    text += `Thank you for your business!`
    
    return text
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Receipt size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Invoice Receipt</h2>
              <p className="text-blue-100 text-sm">{invoice.invoiceNumber || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={receiptRef} className="bg-white p-8 border-2 border-gray-200 rounded-lg">
            {/* Store Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-primary-500 mb-1">
                {storeInfo?.name || 'Awosel OS'}
              </h1>
              {storeInfo?.branch && (
                <p className="text-gray-800 font-semibold text-sm mb-1">{storeInfo.branch}</p>
              )}
              {storeInfo?.address && (
                <p className="text-gray-600 text-sm mb-1">{storeInfo.address}</p>
              )}
              {storeInfo?.phone && (
                <p className="text-gray-600 text-sm mb-1">Phone: {storeInfo.phone}</p>
              )}
              {storeInfo?.email && (
                <p className="text-gray-600 text-sm mb-1">Email: {storeInfo.email}</p>
              )}
              {storeInfo?.taxId && (
                <p className="text-gray-600 text-sm">Tax ID: {storeInfo.taxId}</p>
              )}
            </div>

            {/* Invoice Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">INVOICE RECEIPT</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                  <p className="font-semibold text-gray-900">{invoice.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {(invoice.status || 'draft').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
              <p className="font-bold text-gray-900">{invoice.customer?.name || 'N/A'}</p>
              {invoice.customer?.email && (
                <p className="text-sm text-gray-600">Email: {invoice.customer.email}</p>
              )}
              {invoice.customer?.phone && (
                <p className="text-sm text-gray-600">Phone: {invoice.customer.phone}</p>
              )}
              {invoice.customer?.address && (
                <p className="text-sm text-gray-600">Address: {invoice.customer.address}</p>
              )}
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 border-b">Description</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 border-b">Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 border-b">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 text-gray-900">{item.description || 'N/A'}</td>
                        <td className="py-3 px-4 text-center text-gray-900">{item.quantity || 0}</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          ₵{(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ₵{(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-500">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mb-8">
              <div className="ml-auto w-80">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ₵{(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {(invoice.discount || 0) > 0 && (
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">
                      -₵{(invoice.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700">Tax:</span>
                  <span className="font-semibold text-gray-900">
                    ₵{(invoice.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                  <span className="font-bold text-lg text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ₵{(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b mt-2">
                  <span className="text-gray-700">Paid:</span>
                  <span className="font-semibold text-green-600">
                    ₵{(invoice.paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Balance:</span>
                  <span className={`font-bold ${(invoice.balance || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    ₵{(invoice.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                <p className="text-sm text-gray-700">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-6 border-t-2 border-gray-300">
              <p className="text-xs text-gray-500">Thank you for your business!</p>
              <p className="text-xs text-gray-500 mt-2">
                This is a computer-generated receipt. No signature required.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t bg-gray-50 p-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 btn-primary flex items-center justify-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          >
            <Printer size={18} className="mr-2" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 btn-primary flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 btn-primary flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <MessageCircle size={18} className="mr-2" />
            Share WhatsApp
          </button>
          <button
            onClick={handleShareEmail}
            className="flex-1 btn-primary flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={!invoice.customer?.email}
          >
            <Mail size={18} className="mr-2" />
            Email Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

// Receipt icon component
const Receipt = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

export default InvoiceReceipt

