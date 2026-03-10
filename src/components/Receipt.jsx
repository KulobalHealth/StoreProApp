import React from 'react'

const Receipt = ({ transaction, storeInfo, onClose }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="receipt-container" style={{ 
      width: '55mm', 
      maxWidth: '55mm',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.4',
      backgroundColor: 'white'
    }}>
      {/* Store Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>
          {storeInfo.name || 'Awosel OS Store'}
        </div>
        {storeInfo.branch && (
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>
            {storeInfo.branch}
          </div>
        )}
        <div style={{ fontSize: '10px' }}>
          {storeInfo.address || ''}
        </div>
        {storeInfo.phone && (
          <div style={{ fontSize: '10px' }}>
            {storeInfo.phone}
          </div>
        )}
        {storeInfo.taxId && (
          <div style={{ fontSize: '10px' }}>
            Tax ID: {storeInfo.taxId}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '10px 0', paddingTop: '10px' }}></div>

      {/* Transaction Info */}
      <div style={{ marginBottom: '10px' }}>
        <div>Receipt #: {transaction.receiptNumber}</div>
        <div>Date: {formatDate(transaction.date)}</div>
        {transaction.cashier && <div>Cashier: {transaction.cashier}</div>}
        {transaction.customer && <div>Customer: {transaction.customer}</div>}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Items */}
      <div style={{ marginBottom: '10px' }}>
        {transaction.items.map((item, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontWeight: 'bold' }}>{item.itemName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
              <span>{item.qty} {item.unitLabel || 'pc'} x ₵{item.unitPrice.toFixed(2)}</span>
              <span>₵{item.extPrice.toFixed(2)}</span>
            </div>
            {item.discount > 0 && (
              <div style={{ fontSize: '10px', color: '#666', marginLeft: '10px' }}>
                Discount: -₵{item.discount.toFixed(2)}
              </div>
            )}
            {item.department && (
              <div style={{ fontSize: '9px', color: '#666' }}>
                {item.department}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Totals */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Subtotal:</span>
          <span>₵{transaction.subtotal.toFixed(2)}</span>
        </div>
        {transaction.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#666' }}>
            <span>Discount:</span>
            <span>-₵{transaction.discount.toFixed(2)}</span>
          </div>
        )}
        {transaction.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tax:</span>
            <span>₵{transaction.tax.toFixed(2)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid #000', margin: '5px 0', paddingTop: '5px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>
          <span>TOTAL:</span>
          <span>₵{transaction.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Payment */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Payment Method:</span>
          <span>{transaction.paymentMethod}</span>
        </div>
        {transaction.mobileMoneyProvider && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Provider:</span>
            <span>{transaction.mobileMoneyProvider}</span>
          </div>
        )}
        {transaction.mobileMoneyNumber && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Mobile Money #:</span>
            <span>{transaction.mobileMoneyNumber}</span>
          </div>
        )}
        {transaction.giftCardCode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Gift Card Code:</span>
            <span style={{ fontFamily: 'monospace' }}>{transaction.giftCardCode}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Amount Paid:</span>
          <span>₵{transaction.amountPaid.toFixed(2)}</span>
        </div>
        {transaction.change > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Change:</span>
            <span>₵{transaction.change.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px' }}>
        <div style={{ marginBottom: '5px' }}>
          {storeInfo.footer || 'Thank you for your business!'}
        </div>
        <div style={{ marginTop: '10px' }}>
          {storeInfo.website && <div>{storeInfo.website}</div>}
        </div>
      </div>

      {/* Barcode (if enabled) */}
      {storeInfo.showBarcode && transaction.receiptNumber && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <div style={{ fontSize: '9px', marginBottom: '5px' }}>{transaction.receiptNumber}</div>
          {/* In a real app, you'd render an actual barcode here */}
          <div style={{ border: '1px solid #000', padding: '5px', display: 'inline-block' }}>
            ▓▓▓ ░░░ ▓▓▓ ░░░ ▓▓▓
          </div>
        </div>
      )}
    </div>
  )
}

export default Receipt

