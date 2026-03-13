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
      padding: '4px 6px',
      fontFamily: 'monospace',
      fontSize: '11px',
      lineHeight: '1.2',
      backgroundColor: 'white'
    }}>
      {/* Store Header */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '1px' }}>
          {storeInfo.name || 'Awosel OS Store'}
        </div>
        {storeInfo.branch && (
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '1px' }}>
            {storeInfo.branch}
          </div>
        )}
        {storeInfo.address && (
          <div style={{ fontSize: '9px' }}>
            {storeInfo.address}
          </div>
        )}
        {storeInfo.phone && (
          <div style={{ fontSize: '9px' }}>
            {storeInfo.phone}
          </div>
        )}
        {storeInfo.taxId && (
          <div style={{ fontSize: '9px' }}>
            Tax ID: {storeInfo.taxId}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

      {/* Transaction Info */}
      <div style={{ marginBottom: '3px', fontSize: '10px' }}>
        <div>Receipt #: {transaction.receiptNumber}</div>
        <div>Date: {formatDate(transaction.date)}</div>
        {transaction.cashier && <div>Cashier: {transaction.cashier}</div>}
        {transaction.customer && <div>Customer: {transaction.customer}</div>}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

      {/* Items */}
      <div style={{ marginBottom: '3px' }}>
        {transaction.items.map((item, index) => (
          <div key={index} style={{ marginBottom: '3px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{item.itemName}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>{item.qty} {item.unitLabel || 'pc'} x ₵{item.unitPrice.toFixed(2)}</span>
              <span>₵{item.extPrice.toFixed(2)}</span>
            </div>
            {item.discount > 0 && (
              <div style={{ fontSize: '9px', color: '#666', marginLeft: '8px' }}>
                Disc: -₵{item.discount.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

      {/* Totals */}
      <div style={{ marginBottom: '3px', fontSize: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
          <span>Subtotal:</span>
          <span>₵{transaction.subtotal.toFixed(2)}</span>
        </div>
        {transaction.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px', color: '#666' }}>
            <span>Discount:</span>
            <span>-₵{transaction.discount.toFixed(2)}</span>
          </div>
        )}
        {transaction.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>Tax:</span>
            <span>₵{transaction.tax.toFixed(2)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid #000', margin: '2px 0' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
          <span>TOTAL:</span>
          <span>₵{transaction.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

      {/* Payment */}
      <div style={{ marginBottom: '3px', fontSize: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
          <span>Paid ({transaction.paymentMethod}):</span>
          <span>₵{transaction.amountPaid.toFixed(2)}</span>
        </div>
        {transaction.mobileMoneyProvider && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>{transaction.mobileMoneyProvider}:</span>
            <span>{transaction.mobileMoneyNumber || ''}</span>
          </div>
        )}
        {transaction.giftCardCode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>Gift Card:</span>
            <span>{transaction.giftCardCode}</span>
          </div>
        )}
        {transaction.change > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Change:</span>
            <span>₵{transaction.change.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '3px' }}>
        <div>{storeInfo.footer || 'Thank you for your business!'}</div>
        {storeInfo.website && <div style={{ marginTop: '2px' }}>{storeInfo.website}</div>}
      </div>

      {/* Barcode (if enabled) */}
      {storeInfo.showBarcode && transaction.receiptNumber && (
        <div style={{ textAlign: 'center', marginTop: '4px' }}>
          <div style={{ fontSize: '8px' }}>{transaction.receiptNumber}</div>
        </div>
      )}
    </div>
  )
}

export default Receipt

