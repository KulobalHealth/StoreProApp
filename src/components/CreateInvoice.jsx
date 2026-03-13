import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  X, 
  Save, 
  Plus,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  DollarSign,
  Percent
} from 'lucide-react'

const CreateInvoice = ({ isOpen, onClose, onSave, editingInvoice = null }) => {
  const [invoice, setInvoice] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0, total: 0 }],
    tax: 12,
    discount: 0,
    notes: '',
    status: 'draft'
  })

  // Initialize form when editing
  useEffect(() => {
    if (editingInvoice) {
      setInvoice({
        customer: { ...editingInvoice.customer },
        date: editingInvoice.date,
        dueDate: editingInvoice.dueDate,
        items: editingInvoice.items.map(item => ({ ...item })),
        tax: 12,
        discount: editingInvoice.discount,
        notes: editingInvoice.notes,
        status: editingInvoice.status
      })
    } else if (isOpen) {
      // Reset form when opening for new invoice
      setInvoice({
        customer: {
          name: '',
          email: '',
          phone: '',
          address: ''
        },
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        items: [{ description: '', quantity: 1, price: 0, total: 0 }],
        tax: 12,
        discount: 0,
        notes: '',
        status: 'draft'
      })
    }
  }, [isOpen, editingInvoice])

  const calculateTotals = (items, tax, discount) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const taxAmount = (subtotal - discount) * (tax / 100)
    const total = subtotal - discount + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, price: 0, total: 0 }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = invoice.items.filter((_, i) => i !== index)
    setInvoice({ ...invoice, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    }
    newItems[index].total = newItems[index].quantity * newItems[index].price
    setInvoice({ ...invoice, items: newItems })
  }

  const handleSave = () => {
    if (!invoice.customer.name || !invoice.dueDate) {
      alert('Please fill in all required fields (Customer Name, Due Date)')
      return
    }

    if (invoice.items.length === 0 || invoice.items.some(item => !item.description || item.price <= 0)) {
      alert('Please add at least one valid item with description and price')
      return
    }

    const totals = calculateTotals(invoice.items, invoice.tax, invoice.discount)
    const invoiceData = {
      ...invoice,
      ...totals,
      subtotal: totals.subtotal,
      tax: totals.taxAmount,
      total: totals.total
    }

    onSave(invoiceData)
    onClose()
  }

  const totals = calculateTotals(invoice.items, invoice.tax, invoice.discount)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-900 p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-primary-500 p-2 rounded-lg mr-3">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {editingInvoice ? 'Update invoice information' : 'Add a new invoice to your system'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Customer Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2 text-primary-600" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoice.customer.name}
                  onChange={(e) => setInvoice({
                    ...invoice,
                    customer: { ...invoice.customer, name: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="Customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Mail size={16} className="mr-2 text-primary-600" />
                  Email
                </label>
                <input
                  type="email"
                  value={invoice.customer.email}
                  onChange={(e) => setInvoice({
                    ...invoice,
                    customer: { ...invoice.customer, email: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Phone size={16} className="mr-2 text-primary-600" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={invoice.customer.phone}
                  onChange={(e) => setInvoice({
                    ...invoice,
                    customer: { ...invoice.customer, phone: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <MapPin size={16} className="mr-2 text-primary-600" />
                  Address
                </label>
                <input
                  type="text"
                  value={invoice.customer.address}
                  onChange={(e) => setInvoice({
                    ...invoice,
                    customer: { ...invoice.customer, address: e.target.value }
                  })}
                  className="input-field w-full"
                  placeholder="Customer address"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-primary-600" />
              Invoice Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Date</label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Percent size={16} className="mr-2 text-primary-600" />
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={invoice.tax}
                  onChange={(e) => setInvoice({ ...invoice, tax: parseFloat(e.target.value) || 0 })}
                  className="input-field w-full"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package size={20} className="mr-2 text-primary-600" />
                Invoice Items
              </h4>
              <button
                onClick={handleAddItem}
                className="btn-secondary flex items-center text-sm"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price (₵)</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total (₵)</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="input-field w-full"
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="input-field w-full text-center"
                          min="1"
                          step="1"
                          required
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="input-field w-full text-right"
                          min="0"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">
                          ₵{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {invoice.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Remove item"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mb-6 bg-gradient-to-br from-gray-50 to-primary-50 p-5 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <DollarSign size={16} className="mr-2 text-primary-600" />
                  Discount (₵)
                </label>
                <input
                  type="number"
                  value={invoice.discount}
                  onChange={(e) => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                  className="input-field w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-semibold text-gray-900">₵{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-semibold text-red-600">-₵{invoice.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax ({invoice.tax}%):</span>
                  <span className="text-sm font-semibold text-gray-900">₵{totals.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-base font-bold text-gray-900">Total:</span>
                  <span className="text-base font-bold text-primary-600">₵{totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={invoice.notes}
              onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
              className="input-field w-full"
              rows="3"
              placeholder="Additional notes or terms..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 mt-6 border-t">
            <button 
              onClick={onClose} 
              className="btn-secondary flex-1 flex items-center justify-center"
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <Save size={18} className="mr-2" />
              {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateInvoice

