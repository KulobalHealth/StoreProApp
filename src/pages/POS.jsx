import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronDown, User, Search, Edit, RotateCcw, DollarSign, Plus, Minus, Trash2, Check, Printer, Mail, Save, Download, Clock, RotateCw, CheckCircle, ShoppingBag, Percent, Receipt as ReceiptIcon, CreditCard, Settings, FileText, AlertCircle, Loader2, AlertTriangle, Info, XCircle } from 'lucide-react'
import Receipt from '../components/Receipt'
import { printReceiptDirect } from '../utils/printReceipt'
import { listCustomers, listProducts, listProductsByBranch, listHeldSales, createSale, createHeldSale, deleteHeldSale } from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId, getActiveBranch as getActiveBranchUtil } from '../utils/branch'

// Common units of measure
const UNITS_OF_MEASURE = [
  { value: 'piece', label: 'Piece', abbreviation: 'pc' },
  { value: 'pack', label: 'Pack', abbreviation: 'pack' },
  { value: 'box', label: 'Box', abbreviation: 'box' },
  { value: 'carton', label: 'Carton', abbreviation: 'ctn' },
  { value: 'quarter', label: 'Quarter', abbreviation: '1/4' },
  { value: 'half', label: 'Half', abbreviation: '1/2' },
  { value: 'dozen', label: 'Dozen', abbreviation: 'dz' },
  { value: 'kg', label: 'Kilogram', abbreviation: 'kg' },
  { value: 'g', label: 'Gram', abbreviation: 'g' },
  { value: 'lb', label: 'Pound', abbreviation: 'lb' },
  { value: 'oz', label: 'Ounce', abbreviation: 'oz' },
  { value: 'liter', label: 'Liter', abbreviation: 'L' },
  { value: 'ml', label: 'Milliliter', abbreviation: 'ml' },
  { value: 'meter', label: 'Meter', abbreviation: 'm' },
  { value: 'cm', label: 'Centimeter', abbreviation: 'cm' },
]


// Map API product to POS product shape
function mapApiProductToPOS(p) {
  const baseUnit = p.base_unit || 'piece'
  const price = Number(p.selling_price) ?? Number(p.price) ?? 0
  const units = (p.units && p.units.length > 0)
    ? p.units.map(u => ({
        uuid: u.uuid || null,
        unit: u.unit_name || u.unit || baseUnit,
        conversion: Number(u.conversion_quantity) ?? Number(u.conversion) ?? 1,
        price: Number(u.unit_price) ?? Number(u.price) ?? price
      }))
    : [{ uuid: null, unit: baseUnit, conversion: 1, price }]
  return {
    id: p.id,
    uuid: p.uuid || p.id,
    itemNumber: p.sku || String(p.id),
    department: p.category || 'General',
    itemName: p.name || 'Unknown',
    price,
    stock: Number(p.quantity) || Number(p.stock) || 0,
    barcode: p.barcode || '',
    baseUnit,
    units
  }
}

const POS = () => {
  const [items, setItems] = useState([])
  const [selectedPayment, setSelectedPayment] = useState('Cash')
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('')
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('MTN')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [cartDiscount, setCartDiscount] = useState({ type: 'percentage', value: 0 })
  const [amountPaid, setAmountPaid] = useState(0)
  const [customer, setCustomer] = useState(null)
  const [receiptNumber, setReceiptNumber] = useState(`RCP-${Date.now()}`)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [heldSales, setHeldSales] = useState([])
  const [showHeldSalesModal, setShowHeldSalesModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successTransaction, setSuccessTransaction] = useState(null)
  const [savingState, setSavingState] = useState(null) // null | 'save' | 'print' | 'email'
  const [showIWantToMenu, setShowIWantToMenu] = useState(false)
  const [productsFromApi, setProductsFromApi] = useState([])
  const [allProducts, setAllProducts] = useState([]) // full product list cached in memory
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [customersFromApi, setCustomersFromApi] = useState([])
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [alertQueue, setAlertQueue] = useState([]) // {id, type, title, message}
  const [removeConfirm, setRemoveConfirm] = useState(null) // { id, name } of item pending removal
  const alertTimerRef = useRef(null)
  const receiptRef = useRef(null)
  const searchInputRef = useRef(null)
  const iWantToMenuRef = useRef(null)
  const cartDiscountRef = useRef(null)
  const selectedCustomerIdRef = useRef(null)
  // Auto-refocus search bar when it loses focus (unless a modal is open)
  const anyModalOpen = showEditModal || showDiscountModal || showUnitModal || showReceiptModal || showHeldSalesModal || showSuccessModal || !!removeConfirm

  useEffect(() => {
    const input = searchInputRef.current
    if (!input) return
    const handleBlur = () => {
      setTimeout(() => {
        if (!anyModalOpen && searchInputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'SELECT') {
          searchInputRef.current.focus()
        }
      }, 100)
    }
    input.addEventListener('blur', handleBlur)
    return () => input.removeEventListener('blur', handleBlur)
  }, [anyModalOpen])

  // Refocus search bar when all modals close
  useEffect(() => {
    if (!anyModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 150)
    }
  }, [anyModalOpen])

  // Keep ref in sync with selected customer so save always has current value
  useEffect(() => {
    selectedCustomerIdRef.current = (customer && customer.id != null && Number(customer.id) > 0) ? Number(customer.id) : null
  }, [customer])

  // Alert helper — pushes a styled toast notification
  const showAlert = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random()
    setAlertQueue(prev => [...prev.slice(-4), { id, type, title, message }]) // keep max 5
    setTimeout(() => {
      setAlertQueue(prev => prev.filter(a => a.id !== id))
    }, type === 'error' ? 5000 : 3500)
  }, [])
  const dismissAlert = useCallback((id) => {
    setAlertQueue(prev => prev.filter(a => a.id !== id))
  }, [])

  // Load customers from API for POS
  useEffect(() => {
    const branchId = getSessionBranchId()
    if (!branchId) return
    listCustomers(branchId)
      .then(data => setCustomersFromApi(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => setCustomersFromApi([]))
  }, [])

  // Get active branch
  const getActiveBranch = getActiveBranchUtil

  // Fetch ALL products once on mount and cache them in memory for instant search
  useEffect(() => {
    const branchId = getSessionBranchId()
    setProductsLoading(true)
    setProductsError('')
    listProductsByBranch(branchId)
      .then(res => {
        const data = res?.data || res
        const list = Array.isArray(data) ? data : []
        const mapped = list.map(mapApiProductToPOS)
        setAllProducts(mapped)
        setProductsFromApi(mapped)
      })
      .catch(err => {
        const msg = err.message || 'Could not load products'
        // If backend blocks sales role, show a helpful message
        if (msg.toLowerCase().includes('access denied') || msg.toLowerCase().includes('required role')) {
          setProductsError('Your account does not have permission to load products. Please ask an admin to grant POS access to the "sales" role on the backend.')
        } else {
          setProductsError(msg)
        }
        setAllProducts([])
        setProductsFromApi([])
      })
      .finally(() => setProductsLoading(false))
  }, [])

  // Instant client-side filtering — no debounce, no API calls
  useEffect(() => {
    if (!itemSearch || !itemSearch.trim()) {
      setProductsFromApi(allProducts)
      return
    }
    const q = itemSearch.toLowerCase().trim()
    const filtered = allProducts.filter(p =>
      (p.itemName || '').toLowerCase().includes(q) ||
      (p.itemNumber || '').toLowerCase().includes(q) ||
      (p.barcode || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q)
    )
    setProductsFromApi(filtered)
  }, [itemSearch, allProducts])

  // Load held sales from localStorage on mount with comprehensive error handling
  // Load held sales from API (DB)
  useEffect(() => {
    listHeldSales()
      .then(data => {
        const list = Array.isArray(data) ? data : []
        const valid = list.filter(sale =>
          sale && sale.id && Array.isArray(sale.items) && typeof sale.total === 'number'
        )
        setHeldSales(valid)
      })
      .catch(() => setHeldSales([]))
  }, [])

  // Close "I Want to" menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (iWantToMenuRef.current && !iWantToMenuRef.current.contains(event.target)) {
        setShowIWantToMenu(false)
      }
    }

    if (showIWantToMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showIWantToMenu])

  // Held sales are persisted in DB via API; no localStorage sync

  // Store information — pull org name & branch from localStorage
  const storeInfo = React.useMemo(() => {
    let orgName = 'Awosel OS Store'
    let branchName = ''
    let branchLocation = ''
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user?.organization?.name) orgName = user.organization.name
    } catch { /* ignore */ }
    try {
      const branch = JSON.parse(localStorage.getItem('awosel_active_branch') || '{}')
      if (branch?.name) branchName = branch.name
      if (branch?.location) branchLocation = branch.location
    } catch { /* ignore */ }
    return {
      name: orgName,
      branch: branchName,
      address: branchLocation || branchName || 'Accra',
      phone: '',
      taxId: '',
      footer: 'Thank you for your business!',
      showBarcode: true
    }
  }, [])

  // Products are already fetched & filtered from the API based on search
  const filteredProducts = productsFromApi

  // Filter customers for POS search dropdown
  const filteredCustomersForPOS = React.useMemo(() => {
    if (!customerSearch || !customerSearch.trim()) return customersFromApi.slice(0, 10)
    const term = customerSearch.toLowerCase().trim()
    return customersFromApi.filter(c => {
      if (!c) return false
      return (
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
      )
    }).slice(0, 10)
  }, [customerSearch, customersFromApi])

  // Calculate totals with safety checks
  const itemSubtotal = React.useMemo(() => {
    try {
      return items.reduce((sum, item) => {
        if (!item || typeof item.unitPrice !== 'number' || typeof item.qty !== 'number') {
          console.warn('Invalid item data:', item)
          return sum
        }
        const itemTotal = (item.unitPrice * item.qty) - (item.discount || 0)
        return sum + (isNaN(itemTotal) ? 0 : itemTotal)
      }, 0)
    } catch (error) {
      console.error('Error calculating subtotal:', error)
      return 0
    }
  }, [items])

  const cartDiscountAmount = React.useMemo(() => {
    try {
      if (!cartDiscount || typeof cartDiscount.value !== 'number') return 0
      const discount = cartDiscount.type === 'percentage' 
        ? (itemSubtotal * Math.min(100, Math.max(0, cartDiscount.value))) / 100
        : Math.max(0, cartDiscount.value)
      return Math.min(discount, itemSubtotal) // Can't discount more than subtotal
    } catch (error) {
      console.error('Error calculating cart discount:', error)
      return 0
    }
  }, [cartDiscount, itemSubtotal])

  const subtotal = Math.max(0, itemSubtotal - cartDiscountAmount)
  const taxRatePercent = (() => {
    try {
      const v = localStorage.getItem('awosel_tax_rate')
      if (v === null || v === '') return 0
      const n = parseFloat(v)
      return Number.isFinite(n) && n >= 0 ? n : 0
    } catch {
      return 0
    }
  })()
  const tax = subtotal * (taxRatePercent / 100)
  const total = subtotal + tax
  const amountDue = Math.max(0, total - (amountPaid || 0))
  const change = Math.max(0, (amountPaid || 0) - total)

  // Add item to cart with comprehensive validation
  const handleAddItem = React.useCallback((product, selectedUnit = null) => {
    try {
      // Validate product
      if (!product || !product.id) {
        console.error('Invalid product:', product)
        showAlert('error', 'Invalid product selected')
        return
      }

      // If product has multiple units, show unit selection modal
      if (product.units && product.units.length > 1 && !selectedUnit) {
        setPendingProduct(product)
        setShowUnitModal(true)
        return
      }

      // Determine unit and price with fallbacks
      const unit = selectedUnit || (product.units?.[0] || { unit: 'piece', conversion: 1, price: product.price })
      const unitPrice = typeof unit.price === 'number' ? unit.price : (typeof product.price === 'number' ? product.price : 0)
      const unitLabel = UNITS_OF_MEASURE.find(u => u.value === unit.unit)?.abbreviation || unit.unit || 'pc'

      // Stock check
      const productStock = typeof product.stock === 'number' ? product.stock : 0
      if (productStock <= 0) {
        showAlert('error', `"${product.itemName || product.name}" is out of stock.`, 'Out of Stock')
        return
      }

      // Check if item already exists in cart
      const existingItem = items.find(item => 
        item && item.id === product.id && item.unit === unit.unit
      )
      
      if (existingItem) {
        handleQtyChange(product.id, 1, unit.unit)
      } else {
        // Validate all required fields before adding
        const newItem = {
          id: product.id,
          uuid: product.uuid || product.id,
          itemNumber: product.itemNumber || '',
          department: product.department || 'General',
          itemName: product.itemName || 'Unknown Item',
          qty: 1,
          unit: unit.unit || 'piece',
          unitUuid: unit.uuid || null,
          unitLabel: unitLabel,
          unitPrice: unitPrice,
          baseUnitPrice: typeof product.price === 'number' ? product.price : unitPrice,
          conversion: typeof unit.conversion === 'number' ? unit.conversion : 1,
          extPrice: unitPrice,
          discount: 0
        }
        setItems(prevItems => [...prevItems, newItem])
      }
      setItemSearch('')
      setPendingProduct(null)
    } catch (error) {
      console.error('Error adding item to cart:', error)
      showAlert('error', 'Failed to add item to cart. Please try again.')
    }
  }, [items])

  // Handle unit selection from modal
  const handleUnitSelected = (unit) => {
    if (pendingProduct) {
      handleAddItem(pendingProduct, unit)
      setShowUnitModal(false)
    }
  }

  // Handle Enter key in search - removed to avoid dependency issues
  // Enter key handling is now done directly in the input's onKeyPress

  const handleQtyChange = React.useCallback((id, change, unit = null) => {
    try {
      if (typeof id === 'undefined' || typeof change !== 'number') {
        console.error('Invalid parameters for handleQtyChange:', { id, change, unit })
        return
      }

      setItems(prevItems => prevItems.map(item => {
        if (!item || item.id !== id || (unit && item.unit !== unit)) {
          return item
        }
        
        const newQty = Math.max(0.25, (item.qty || 1) + change) // Allow fractional quantities
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0
        const discount = typeof item.discount === 'number' ? item.discount : 0
        const newExtPrice = Math.max(0, (unitPrice * newQty) - discount)
        
        return { 
          ...item, 
          qty: newQty, 
          extPrice: newExtPrice 
        }
      }))
    } catch (error) {
      console.error('Error changing quantity:', error)
      showAlert('error', 'Failed to update quantity. Please try again.')
    }
  }, [])

  const handleRemoveItem = React.useCallback((id) => {
    try {
      if (typeof id === 'undefined') {
        console.error('Invalid item ID for removal')
        return
      }
      setItems(prevItems => prevItems.filter(item => item && item.id !== id))
      setSelectedItem(prevSelected => 
        prevSelected && prevSelected.id === id ? null : prevSelected
      )
    } catch (error) {
      console.error('Error removing item:', error)
      showAlert('error', 'Failed to remove item. Please try again.')
    }
  }, [])

  const handleEditItem = () => {
    if (selectedItem) {
      setShowEditModal(true)
    }
  }

  const handleUpdateItem = (updatedItem) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ))
    setSelectedItem(updatedItem)
    setShowEditModal(false)
  }

  const handleApplyItemDiscount = () => {
    if (selectedItem) {
      setShowDiscountModal(true)
    }
  }

  const handleApplyDiscount = (discountType, discountValue) => {
    if (selectedItem) {
      const discountAmount = discountType === 'percentage'
        ? (selectedItem.unitPrice * selectedItem.qty * discountValue) / 100
        : discountValue

      const updatedItem = {
        ...selectedItem,
        discount: Math.min(discountAmount, selectedItem.unitPrice * selectedItem.qty),
        extPrice: (selectedItem.unitPrice * selectedItem.qty) - Math.min(discountAmount, selectedItem.unitPrice * selectedItem.qty)
      }
      handleUpdateItem(updatedItem)
      setShowDiscountModal(false)
    }
  }

  const handleReturnItem = () => {
    if (selectedItem && window.confirm(`Return ${selectedItem.itemName}?`)) {
      // In a real app, this would create a return transaction
      handleRemoveItem(selectedItem.id)
      showAlert('success', 'Item returned successfully')
    }
  }

  const handleSaveTransaction = async (print = false, email = false) => {
    if (savingState) return // prevent double-clicks while saving
    try {
      // Validation checks
      if (!Array.isArray(items) || items.length === 0) {
        showAlert('warning', 'Cannot save empty transaction', 'Empty Cart')
        return
      }

      // Validate all items have required data
      const invalidItem = items.find(item => 
        !item || 
        typeof item.unitPrice !== 'number' || 
        typeof item.qty !== 'number' ||
        item.unitPrice < 0 ||
        item.qty <= 0
      )
      
      if (invalidItem) {
        console.error('Invalid item in cart:', invalidItem)
        showAlert('error', 'Cart contains invalid items. Please review and try again.', 'Invalid Items')
        return
      }

      // Payment validation
      if (!selectedPayment) {
        showAlert('warning', 'Please select a payment method', 'Payment Required')
        return
      }

      if (amountDue > 0.01) {
        showAlert('warning', `Please complete payment. Amount due: ₵${amountDue.toFixed(2)}`, 'Incomplete Payment')
        return
      }

      // Validate total is positive
      if (total < 0) {
        showAlert('error', 'Invalid transaction total. Please check discounts.', 'Invalid Total')
        return
      }

      // Create transaction object with validated data
      const transaction = {
        receiptNumber: receiptNumber || `RCP-${Date.now()}`,
        date: new Date().toISOString(),
        timestamp: Date.now(),
        cashier: cashierName,
        customer: customer?.name || null,
        items: items.map(item => ({
          itemNumber: item.itemNumber || '',
          department: item.department || '',
          itemName: item.itemName || 'Unknown',
          qty: typeof item.qty === 'number' ? item.qty : 0,
          unit: item.unit || 'piece',
          unitLabel: item.unitLabel || 'pc',
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
          extPrice: typeof item.extPrice === 'number' ? item.extPrice : 0,
          discount: typeof item.discount === 'number' ? item.discount : 0
        })),
        subtotal: typeof subtotal === 'number' ? subtotal : 0,
        discount: typeof cartDiscountAmount === 'number' ? cartDiscountAmount : 0,
        tax: typeof tax === 'number' ? tax : 0,
        total: typeof total === 'number' ? total : 0,
        paymentMethod: selectedPayment,
        amountPaid: typeof amountPaid === 'number' ? amountPaid : 0,
        change: typeof change === 'number' ? change : 0,
        mobileMoneyNumber: selectedPayment === 'Mobile Money' ? (mobileMoneyNumber || null) : null,
        mobileMoneyProvider: selectedPayment === 'Mobile Money' ? (mobileMoneyProvider || null) : null,
        giftCardCode: selectedPayment === 'Gift' ? (giftCardCode || null) : null
      }

      // Save to backend (deducts stock); use ref so we always have current selected customer
      const customerId = selectedCustomerIdRef.current
      const salePayload = {
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
        customer_id: customerId || null,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        tax: transaction.tax,
        total: transaction.total,
        payment_method: transaction.paymentMethod,
        amount_paid: transaction.amountPaid,
        change_amount: transaction.change,
        items: items.map(item => ({
          product_id: item.uuid || item.id,
          quantity: item.qty,
          product_unit: item.unitUuid || null
        }))
      }
      setSavingState(print ? 'print' : email ? 'email' : 'save')
      await createSale(salePayload)

      // Save transaction with error handling (local copy)
      try {
        const transactionKey = `transaction_${transaction.timestamp}`
        localStorage.setItem(transactionKey, JSON.stringify(transaction))
        
        // Maintain transaction history (keep last 100)
        const historyKey = 'transaction_history'
        let history = []
        try {
          const savedHistory = localStorage.getItem(historyKey)
          history = savedHistory ? JSON.parse(savedHistory) : []
        } catch (e) {
          console.warn('Could not load transaction history:', e)
        }
        history.unshift(transaction)
        history = history.slice(0, 100) // Keep only last 100 transactions
        localStorage.setItem(historyKey, JSON.stringify(history))
      } catch (storageError) {
        console.error('Error saving transaction to storage:', storageError)
        // Continue even if storage fails
      }

      if (print) {
        // Show receipt dialog instead of printing directly
        setShowReceiptModal(true)
        return
      }

      if (email && customer?.email) {
        // In real app, send email
        console.log('Emailing receipt to:', customer.email)
      }

      // Show success modal
      setSuccessTransaction({
        ...transaction,
        action: email ? 'saved and emailed' : 'saved'
      })
      setShowSuccessModal(true)

      // Reset after save (if not printing)
      setItems([])
      setSelectedItem(null)
      setAmountPaid(0)
      setMobileMoneyNumber('')
      setMobileMoneyProvider('MTN')
      setGiftCardCode('')
      setCartDiscount({ type: 'percentage', value: 0 })
      setCustomer(null)
      setCustomerSearch('')
      setReceiptNumber(`RCP-${Date.now()}`)
    } catch (error) {
      console.error('Error saving transaction:', error)
      showAlert('error', `Failed to save transaction: ${error.message || 'Unknown error'}. Please try again.`, 'Save Failed')
    } finally {
      setSavingState(null)
    }
  }

  const handlePrintReceipt = async () => {
    try {
      // Prepare transaction data
      const transaction = {
        receiptNumber,
        date: new Date(),
        timestamp: Date.now(),
        cashier: cashierName,
        customer: customer?.name || null,
        items: items.map(item => ({
          itemNumber: item.itemNumber,
          department: item.department,
          itemName: item.itemName,
          qty: item.qty,
          unit: item.unit || 'piece',
          unitLabel: item.unitLabel || 'pc',
          unitPrice: item.unitPrice,
          extPrice: item.extPrice,
          discount: item.discount || 0
        })),
        subtotal,
        discount: cartDiscountAmount,
        tax,
        total,
        paymentMethod: selectedPayment,
        amountPaid,
        change,
        mobileMoneyNumber: selectedPayment === 'Mobile Money' ? mobileMoneyNumber : null,
        mobileMoneyProvider: selectedPayment === 'Mobile Money' ? mobileMoneyProvider : null,
        giftCardCode: selectedPayment === 'Gift' ? giftCardCode : null
      }

      // Save to backend first (deducts stock); use ref so we always have current selected customer
      const customerId = selectedCustomerIdRef.current
      const salePayload = {
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
        customer_id: customerId || null,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        tax: transaction.tax,
        total: transaction.total,
        payment_method: transaction.paymentMethod,
        amount_paid: transaction.amountPaid,
        change_amount: transaction.change,
        items: items.map(item => ({
          product_id: item.uuid || item.id,
          quantity: item.qty,
          product_unit: item.unitUuid || null
        }))
      }
      await createSale(salePayload)

      // Save transaction to localStorage before printing
      try {
        const transactionKey = `transaction_${transaction.timestamp}`
        localStorage.setItem(transactionKey, JSON.stringify(transaction))
        
        // Update transaction history
        const historyKey = 'transaction_history'
        let history = []
        try {
          const savedHistory = localStorage.getItem(historyKey)
          history = savedHistory ? JSON.parse(savedHistory) : []
        } catch (e) {
          console.warn('Could not load transaction history:', e)
        }
        history.unshift(transaction)
        history = history.slice(0, 100)
        localStorage.setItem(historyKey, JSON.stringify(history))
      } catch (storageError) {
        console.error('Error saving transaction:', storageError)
      }

      // Trigger print using system printer
      setTimeout(() => {
        if (receiptRef.current) {
          printReceiptDirect(receiptRef.current)
        } else {
          console.error('Receipt reference not found')
          showAlert('error', 'Unable to print - receipt content not ready', 'Print Error')
        }
      }, 100)
      
      // Close receipt modal and show success modal
      setTimeout(() => {
        setShowReceiptModal(false)
        setSuccessTransaction({
          ...transaction,
          action: 'saved and printed'
        })
        setShowSuccessModal(true)
        
        // Reset after printing
        setItems([])
        setSelectedItem(null)
        setAmountPaid(0)
        setMobileMoneyNumber('')
        setMobileMoneyProvider('MTN')
        setGiftCardCode('')
        setCartDiscount({ type: 'percentage', value: 0 })
        setCustomer(null)
        setCustomerSearch('')
        setReceiptNumber(`RCP-${Date.now()}`)
      }, 500)
    } catch (error) {
      console.error('Error printing receipt:', error)
      showAlert('error', 'Failed to print receipt. Please try again.', 'Print Error')
    }
  }

  const handlePutOnHold = React.useCallback(() => {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        showAlert('warning', 'No items to put on hold', 'Empty Cart')
        return
      }

      // Check held sales limit
      if (heldSales.length >= 20) {
        showAlert('warning', 'Maximum held sales limit reached (20). Please complete or delete some held sales first.', 'Limit Reached')
        return
      }

      const holdId = `HOLD-${Date.now()}`
      const totalQty = items.reduce((sum, item) => {
        const qty = typeof item.qty === 'number' ? item.qty : 0
        return sum + qty
      }, 0)

      const heldSale = {
        id: holdId,
        timestamp: new Date().toISOString(),
        createdAt: Date.now(),
        items: items.map(item => ({ ...item })),
        customer: customer ? { ...customer } : null,
        cartDiscount: cartDiscount ? { ...cartDiscount } : { type: 'percentage', value: 0 },
        selectedPayment: selectedPayment || 'Cash',
        amountPaid: typeof amountPaid === 'number' ? amountPaid : 0,
        mobileMoneyNumber: mobileMoneyNumber || '',
        mobileMoneyProvider: mobileMoneyProvider || 'MTN',
        giftCardCode: giftCardCode || '',
        subtotal: typeof subtotal === 'number' ? subtotal : 0,
        tax: typeof tax === 'number' ? tax : 0,
        total: typeof total === 'number' ? total : 0,
        itemCount: items.length,
        totalQty: totalQty
      }

      createHeldSale(heldSale)
        .then(() => {
          setHeldSales(prev => [...prev, heldSale])
          setItems([])
          setSelectedItem(null)
          setAmountPaid(0)
          setMobileMoneyNumber('')
          setMobileMoneyProvider('MTN')
          setGiftCardCode('')
          setCartDiscount({ type: 'percentage', value: 0 })
          setCustomer(null)
          setCustomerSearch('')
          setReceiptNumber(`RCP-${Date.now()}`)
          showAlert('success', `Sale placed on hold (${holdId})`)
        })
        .catch(err => {
          console.error('Error putting sale on hold:', err)
          showAlert('error', 'Failed to put sale on hold. Please try again.')
        })
    } catch (error) {
      console.error('Error putting sale on hold:', error)
      showAlert('error', 'Failed to put sale on hold. Please try again.')
    }
  }, [items, heldSales, customer, cartDiscount, selectedPayment, amountPaid, mobileMoneyNumber, mobileMoneyProvider, giftCardCode, subtotal, tax, total])

  const handleRecallHeldSale = React.useCallback((heldSale) => {
    if (!heldSale) {
      showAlert('error', 'Cannot recall invalid held sale')
      return
    }
    if (items.length > 0) {
      if (!window.confirm('You have items in your cart. Recalling this held sale will replace them. Continue?')) {
        return
      }
    }
    if (!Array.isArray(heldSale.items)) {
      showAlert('error', 'Invalid held sale data')
      return
    }

    const validItems = heldSale.items.filter(item =>
      item && typeof item.unitPrice === 'number' && typeof item.qty === 'number'
    )
    if (validItems.length === 0) {
      showAlert('error', 'Held sale contains no valid items')
      return
    }

    setItems(validItems.map(item => ({ ...item })))
    if (heldSale.customer) {
      setCustomer(heldSale.customer)
      setCustomerSearch(heldSale.customer.name || heldSale.customer.phone || '')
    } else {
      setCustomer(null)
      setCustomerSearch('')
    }
    setCartDiscount(heldSale.cartDiscount || { type: 'percentage', value: 0 })
    setSelectedPayment(heldSale.selectedPayment || 'Cash')
    setAmountPaid(heldSale.amountPaid || 0)
    setMobileMoneyNumber(heldSale.mobileMoneyNumber || '')
    setMobileMoneyProvider(heldSale.mobileMoneyProvider || 'MTN')
    setGiftCardCode(heldSale.giftCardCode || '')
    setShowHeldSalesModal(false)

    // Delete from DB when retrieved
    const holdId = heldSale.id
    if (holdId) {
      deleteHeldSale(holdId)
        .then(() => setHeldSales(prev => prev.filter(s => s.id !== holdId)))
        .catch(() => setHeldSales(prev => prev.filter(s => s.id !== holdId)))
    }
    showAlert('success', 'Held sale recalled successfully')
  }, [items.length])

  const handleDeleteHeldSale = (holdId) => {
    if (!holdId || !window.confirm('Are you sure you want to delete this held sale?')) return
    deleteHeldSale(holdId)
      .then(() => {
        setHeldSales(prev => prev.filter(s => s.id !== holdId))
        showAlert('success', 'Held sale deleted')
      })
      .catch(() => showAlert('error', 'Failed to delete held sale.'))
  }

  // "I Want to" menu handlers
  const handleIWantToAction = (action) => {
    setShowIWantToMenu(false)
    
    switch (action) {
      case 'viewHeldSales':
        setShowHeldSalesModal(true)
        break
      case 'applyCartDiscount':
        if (items.length === 0) {
          showAlert('warning', 'No items in cart to apply discount', 'Empty Cart')
          return
        }
        // Scroll to and focus on cart discount input
        setTimeout(() => {
          if (cartDiscountRef.current) {
            cartDiscountRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(() => {
              const input = cartDiscountRef.current?.querySelector('input[type="number"]')
              if (input) {
                input.focus()
                input.select()
              }
            }, 300)
          }
        }, 100)
        break
      case 'voidTransaction':
        handleCancel()
        break
      case 'openCashDrawer':
        // In real app, this would trigger cash drawer hardware
        showAlert('info', 'Cash drawer opened')
        break
      case 'lookupCustomer':
        // Focus on customer search field
        setTimeout(() => {
          const customerInput = document.querySelector('input[placeholder*="customer"]')
          if (customerInput) {
            customerInput.focus()
            customerInput.select()
          }
        }, 100)
        break
      case 'viewReceipt':
        if (items.length === 0) {
          showAlert('warning', 'No transaction to view receipt')
          return
        }
        setShowReceiptModal(true)
        break
      case 'applyItemDiscount':
        if (!selectedItem) {
          showAlert('warning', 'Please select an item first')
          return
        }
        handleApplyItemDiscount()
        break
      case 'clearCart':
        if (items.length === 0) {
          showAlert('info', 'Cart is already empty')
          return
        }
        if (window.confirm('Clear all items from cart?')) {
          setItems([])
          setSelectedItem(null)
          setCartDiscount({ type: 'percentage', value: 0 })
          setAmountPaid(0)
          setCustomer(null)
          setCustomerSearch('')
        }
        break
      default:
        break
    }
  }

  const handleCancel = React.useCallback(() => {
    try {
      if (items.length > 0 && !window.confirm('Cancel this transaction? All items will be removed.')) {
        return
      }
      setItems([])
      setSelectedItem(null)
      setAmountPaid(0)
      setMobileMoneyNumber('')
      setMobileMoneyProvider('MTN')
      setGiftCardCode('')
      setCartDiscount({ type: 'percentage', value: 0 })
      setCustomer(null)
      setCustomerSearch('')
      setReceiptNumber(`RCP-${Date.now()}`)
    } catch (error) {
      console.error('Error canceling transaction:', error)
      // Force reset even if error occurs
      setItems([])
      setSelectedItem(null)
    }
  }, [items.length])

  const handleRowClick = (item) => {
    setSelectedItem(item)
  }

  // Get logged-in user's name for cashier
  const cashierName = React.useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      return u.name || u.full_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email || ''
    } catch { return '' }
  }, [])

  // Prepare transaction data for receipt
  const transactionData = {
    receiptNumber,
    date: new Date(),
    cashier: cashierName,
    customer: customer?.name || null,
    items: items.map(item => ({
      itemNumber: item.itemNumber,
      department: item.department,
      itemName: item.itemName,
      qty: item.qty,
      unit: item.unit || 'piece',
      unitLabel: item.unitLabel || 'pc',
      unitPrice: item.unitPrice,
      extPrice: item.extPrice,
      discount: item.discount || 0
    })),
    subtotal,
    discount: cartDiscountAmount,
    tax,
    total,
    paymentMethod: selectedPayment,
    amountPaid,
    change
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Full-page saving overlay */}
      {savingState && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 size={48} className="animate-spin text-green-600" />
            <p className="text-lg font-semibold text-gray-800">
              {savingState === 'print' ? 'Saving & Printing...' : savingState === 'email' ? 'Saving & Emailing...' : 'Saving Transaction...'}
            </p>
            <p className="text-sm text-gray-500">Please wait, do not close this page.</p>
          </div>
        </div>
      )}

      {/* Alert Notifications */}
      {alertQueue.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] flex flex-col gap-3 w-full max-w-md px-4">
          {alertQueue.map((alert) => {
            const config = {
              error:   { bg: 'bg-red-50 border-red-300',    text: 'text-red-800',    icon: <XCircle size={20} className="text-red-500 shrink-0" /> },
              warning: { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800',  icon: <AlertTriangle size={20} className="text-amber-500 shrink-0" /> },
              success: { bg: 'bg-green-50 border-green-300', text: 'text-green-800',  icon: <CheckCircle size={20} className="text-green-500 shrink-0" /> },
              info:    { bg: 'bg-primary-50 border-primary-300',   text: 'text-primary-800',   icon: <Info size={20} className="text-primary-500 shrink-0" /> },
            }[alert.type] || { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-800', icon: <Info size={20} className="text-gray-500 shrink-0" /> }
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-[slideDown_0.3s_ease-out] ${config.bg}`}
              >
                {config.icon}
                <div className="flex-1 min-w-0">
                  {alert.title && <p className={`font-semibold text-sm ${config.text}`}>{alert.title}</p>}
                  <p className={`text-sm ${config.text} ${alert.title ? 'mt-0.5' : ''}`}>{alert.message}</p>
                </div>
                <button onClick={() => dismissAlert(alert.id)} className={`${config.text} hover:opacity-70 shrink-0 mt-0.5`}>
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Remove Item Confirmation Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-[slideDown_0.25s_ease-out]">
            <div className="bg-red-50 px-6 py-4 flex items-center gap-3 border-b border-red-100">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Remove Item</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-gray-700">
                Are you sure you want to remove <span className="font-semibold text-gray-900">"{removeConfirm.name}"</span> from the cart?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemoveItem(removeConfirm.id)
                  setRemoveConfirm(null)
                  showAlert('success', `"${removeConfirm.name}" removed from cart`)
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary-800 text-white px-6 py-1.5 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold">Sales Receipt</h1>
        <button onClick={handleCancel} className="p-1 hover:bg-primary-700 rounded">
          <X size={18} />
        </button>
      </div>

      {/* Top Controls Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="relative" ref={iWantToMenuRef}>
          <button 
            onClick={() => setShowIWantToMenu(!showIWantToMenu)}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <span>I Want to...</span>
            <ChevronDown size={18} className={showIWantToMenu ? 'rotate-180 transition-transform' : ''} />
          </button>
          
          {/* Dropdown Menu */}
          {showIWantToMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <button
                  onClick={() => handleIWantToAction('viewHeldSales')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors"
                >
                  <Clock size={18} className="text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">View Held Sales</div>
                    <div className="text-xs text-gray-500">Recall or manage held transactions</div>
                  </div>
                  {heldSales.length > 0 && (
                    <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-1 rounded">
                      {heldSales.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => handleIWantToAction('applyCartDiscount')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={items.length === 0}
                >
                  <Percent size={18} className="text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Apply Cart Discount</div>
                    <div className="text-xs text-gray-500">Add discount to entire cart</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleIWantToAction('applyItemDiscount')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedItem}
                >
                  <DollarSign size={18} className={selectedItem ? "text-gray-600" : "text-gray-400"} />
                  <div>
                    <div className={`font-medium ${selectedItem ? "text-gray-900" : "text-gray-400"}`}>Apply Item Discount</div>
                    <div className="text-xs text-gray-500">Discount selected item</div>
                  </div>
                </button>
                
                <div className="border-t my-1"></div>
                
                <button
                  onClick={() => handleIWantToAction('lookupCustomer')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors"
                >
                  <User size={18} className="text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Lookup Customer</div>
                    <div className="text-xs text-gray-500">Search for customer</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleIWantToAction('viewReceipt')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={items.length === 0}
                >
                  <ReceiptIcon size={18} className={items.length > 0 ? "text-gray-600" : "text-gray-400"} />
                  <div>
                    <div className={`font-medium ${items.length > 0 ? "text-gray-900" : "text-gray-400"}`}>View Receipt</div>
                    <div className="text-xs text-gray-500">Preview current transaction</div>
                  </div>
                </button>
                
                <div className="border-t my-1"></div>
                
                <button
                  onClick={() => handleIWantToAction('openCashDrawer')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors"
                >
                  <CreditCard size={18} className="text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Open Cash Drawer</div>
                    <div className="text-xs text-gray-500">Open physical cash drawer</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleIWantToAction('clearCart')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={items.length === 0}
                >
                  <Trash2 size={18} className={items.length > 0 ? "text-gray-600" : "text-gray-400"} />
                  <div>
                    <div className={`font-medium ${items.length > 0 ? "text-gray-900" : "text-gray-400"}`}>Clear Cart</div>
                    <div className="text-xs text-gray-500">Remove all items</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleIWantToAction('voidTransaction')}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={items.length === 0}
                >
                  <AlertCircle size={18} className={items.length > 0 ? "text-red-600" : "text-gray-400"} />
                  <div>
                    <div className={`font-medium ${items.length > 0 ? "text-red-600" : "text-gray-400"}`}>Void Transaction</div>
                    <div className="text-xs text-red-500">Cancel current sale</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          {productsError && (
            <div className="absolute -top-8 left-0 right-0 flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded text-red-700 text-sm z-10">
              <AlertCircle size={16} />
              {productsError}
            </div>
          )}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Scan or search for a product..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && filteredProducts.length > 0) {
                handleAddItem(filteredProducts[0])
              }
            }}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {/* Search Results Dropdown */}
          {itemSearch && itemSearch.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-auto">
              {productsLoading ? (
                <div className="px-4 py-3 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Searching products…
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 8).map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleAddItem(product)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                  >
                    <div className="font-medium">{product.itemName}</div>
                    <div className="text-sm text-gray-600">{product.department} - ₵{product.price.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-gray-400 text-sm">No products found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={customer ? 'Selected: ' + customer.name : 'Enter customer name or phone'}
              value={customer ? `${customer.name}${customer.phone ? ' · ' + customer.phone : ''}` : customerSearch}
              onChange={(e) => {
                setCustomer(null)
                setCustomerSearch(e.target.value)
                setCustomerDropdownOpen(true)
              }}
              onFocus={() => !customer && setCustomerDropdownOpen(true)}
              onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 180)}
              readOnly={!!customer}
              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {customer ? (
              <button
                type="button"
                onClick={() => {
                  setCustomer(null)
                  setCustomerSearch('')
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 text-xs font-medium max-w-[120px] truncate"
                title="Clear customer (Walk-in)"
              >
                {customer.name || 'Walk-in'}
              </button>
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            )}
            {customerDropdownOpen && (customerSearch.trim() || filteredCustomersForPOS.length > 0) && !customer && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-[100] max-h-52 overflow-auto"
              onMouseDown={(e) => e.preventDefault()}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setCustomer(null)
                  setCustomerSearch('')
                  setCustomerDropdownOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 border-b"
              >
                Walk-in (no customer)
              </button>
              {filteredCustomersForPOS.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCustomer({ id: Number(c.id), name: c.name || '', phone: c.phone || '', email: c.email || '' })
                    setCustomerSearch(c.name || '')
                    setCustomerDropdownOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-600">
                    {[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact'}
                  </div>
                </button>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Items Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Items Table */}
          <div className="flex-1 overflow-auto bg-white m-4 rounded-lg border border-gray-200">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">No items in cart</p>
                  <p className="text-sm">Search and add items to get started</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Item #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Item Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">Ext Price</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr 
                      key={`${item.id}-${index}`}
                      onClick={() => handleRowClick(item)}
                      className={`border-b cursor-pointer ${
                        selectedItem?.id === item.id 
                          ? 'bg-green-100' 
                          : 'bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-900">{item.itemNumber}</td>
                      <td className="px-4 py-3 text-gray-900">{item.department}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {item.itemName}
                        {item.discount > 0 && (
                          <span className="ml-2 text-xs text-green-600">(-₵{item.discount.toFixed(2)})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQtyChange(item.id, -1, item.unit)
                            }}
                            className="p-1 hover:bg-primary-200 rounded transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus size={16} className="text-primary-600" />
                          </button>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => {
                              e.stopPropagation()
                              const newQty = parseFloat(e.target.value) || 0.25
                              if (newQty > 0) {
                                const change = newQty - item.qty
                                handleQtyChange(item.id, change, item.unit)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            step="0.25"
                            min="0.25"
                          />
                          <span className="text-sm text-gray-600 ml-1">{item.unitLabel || 'pc'}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQtyChange(item.id, 1, item.unit)
                            }}
                            className="p-1 hover:bg-primary-200 rounded transition-colors"
                            title="Increase quantity"
                          >
                            <Plus size={16} className="text-primary-600" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">₵{item.extPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setRemoveConfirm({ id: item.id, name: item.itemName })
                          }}
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Item Action Buttons */}
          <div className="px-4 pb-4 flex gap-2 flex-wrap">
            <button 
              onClick={handleEditItem}
              disabled={!selectedItem}
              className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit size={18} />
              Edit
            </button>
            <button 
              onClick={handleReturnItem}
              disabled={!selectedItem}
              className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={18} />
              Return Item
            </button>
            <button 
              onClick={() => {
                if (selectedItem) {
                  const product = productsFromApi.find(p => p.id === selectedItem.id)
                  if (product?.units && product.units.length > 1) {
                    setPendingProduct(product)
                    setShowUnitModal(true)
                  } else {
                    handleApplyItemDiscount()
                  }
                }
              }}
              disabled={!selectedItem}
              className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign size={18} />
              Qty/Price/Discount
            </button>
            <button 
              onClick={() => selectedItem && handleQtyChange(selectedItem.id, 1)}
              disabled={!selectedItem}
              className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Qty+
            </button>
            <button 
              onClick={() => selectedItem && handleQtyChange(selectedItem.id, -1)}
              disabled={!selectedItem}
              className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={18} />
              Qty-
            </button>
            <button 
              onClick={() => selectedItem && setRemoveConfirm({ id: selectedItem.id, name: selectedItem.itemName })}
              disabled={!selectedItem}
              className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              Remove
            </button>
          </div>
        </div>

        {/* Right Side - Summary and Payment */}
        <div className="w-96 bg-white border-l flex flex-col overflow-y-auto min-h-0 shrink-0">
          {/* Transaction Summary */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>No. of Items Sold:</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Total Qty Sold:</span>
                <span className="font-semibold">{items.reduce((sum, item) => sum + item.qty, 0)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>SubTotal:</span>
                <span className="font-semibold">₵{subtotal.toFixed(2)}</span>
              </div>
              {cartDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cart Discount:</span>
                  <span className="font-semibold">-₵{cartDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span className="font-semibold">₵{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-yellow-700 bg-yellow-100 px-3 py-2 rounded border border-yellow-300">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">₵{total.toFixed(2)}</span>
              </div>
              {selectedPayment && amountPaid > 0 && (
                <div className="flex justify-between text-yellow-700 bg-yellow-100 px-3 py-2 rounded border border-yellow-300">
                  <span className="font-semibold">{selectedPayment}:</span>
                  <span className="font-bold text-lg">-₵{amountPaid.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Options */}
          <div className="p-6 border-b">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Method</h3>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Mobile Money', 'Check'].map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setSelectedPayment(method)
                      setAmountPaid(total)
                    }}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors relative ${
                      selectedPayment === method
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {method}
                    {selectedPayment === method && (
                      <Check className="absolute top-0.5 right-0.5 text-green-600" size={14} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Paid</span>
              <span className="text-gray-400 text-sm">₵</span>
              <input
                type="number"
                value={amountPaid === 0 ? '' : amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="flex-1 min-w-0 py-1.5 px-2 text-sm border-0 bg-transparent focus:outline-none focus:ring-0"
                step="0.01"
                min="0"
              />
            </div>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Amount Due:</span>
                <span className={`text-2xl font-bold ${amountDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  ₵{amountDue.toFixed(2)}
                </span>
              </div>
              {change > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Change:</span>
                  <span className="text-xl font-bold text-green-600">₵{change.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cart Discount */}
          <div ref={cartDiscountRef} className="p-6 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cart Discount</h3>
            <div className="flex gap-2 mb-2">
              <select
                value={cartDiscount.type}
                onChange={(e) => setCartDiscount({ ...cartDiscount, type: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Amount (₵)</option>
              </select>
              <input
                type="number"
                value={cartDiscount.value === 0 ? '' : cartDiscount.value}
                onChange={(e) => setCartDiscount({ ...cartDiscount, value: parseFloat(e.target.value) || 0 })}
                className="w-24 px-3 py-2 border border-gray-300 rounded"
                step="0.01"
                min="0"
              />
            </div>
            {cartDiscountAmount > 0 && (
              <div className="text-sm text-green-600">
                Discount: -₵{cartDiscountAmount.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="bg-white border-t px-6 py-4 flex items-center justify-end gap-3 shadow-lg shrink-0">
        <button 
          onClick={() => setShowHeldSalesModal(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Clock size={18} />
          Held Sales {heldSales.length > 0 && `(${heldSales.length})`}
        </button>
        <button 
          onClick={handlePutOnHold}
          disabled={items.length === 0}
          className="bg-primary-600 text-white px-6 py-3 rounded font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Put on Hold
        </button>
        <button 
          onClick={handleCancel}
          className="bg-primary-600 text-white px-6 py-3 rounded font-medium hover:bg-primary-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => handleSaveTransaction(false, true)}
          className="bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Mail size={18} />
          Save & Email
        </button>
        <button 
          onClick={() => handleSaveTransaction(false, false)}
          disabled={!!savingState}
          className={`text-white px-6 py-3 rounded font-medium transition-colors flex items-center gap-2 ${savingState === 'save' ? 'bg-green-500 cursor-wait' : savingState ? 'bg-green-400 cursor-not-allowed opacity-60' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {savingState === 'save' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {savingState === 'save' ? 'Saving...' : 'Save Only'}
        </button>
        <button 
          onClick={() => handleSaveTransaction(true, false)}
          disabled={!!savingState}
          className={`text-white px-6 py-3 rounded font-medium transition-colors flex items-center gap-2 ${savingState === 'print' ? 'bg-green-500 cursor-wait' : savingState ? 'bg-green-400 cursor-not-allowed opacity-60' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {savingState === 'print' ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          {savingState === 'print' ? 'Saving...' : 'Save & Print'}
        </button>
      </div>

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          onSave={handleUpdateItem}
          onClose={() => setShowEditModal(false)}
          products={productsFromApi}
        />
      )}

      {/* Discount Modal */}
      {showDiscountModal && selectedItem && (
        <DiscountModal
          item={selectedItem}
          onApply={handleApplyDiscount}
          onClose={() => setShowDiscountModal(false)}
        />
      )}

      {/* Unit of Measure Selection Modal */}
      {showUnitModal && pendingProduct && (
        <UnitSelectionModal
          product={pendingProduct}
          currentItem={selectedItem}
          onSelect={handleUnitSelected}
          onClose={() => {
            setShowUnitModal(false)
            setPendingProduct(null)
          }}
        />
      )}

      {/* Receipt Preview Modal */}
      {showReceiptModal && (
        <ReceiptModal
          transaction={transactionData}
          storeInfo={storeInfo}
          onPrint={handlePrintReceipt}
          onClose={() => setShowReceiptModal(false)}
          receiptRef={receiptRef}
        />
      )}

      {/* Held Sales Modal */}
      {showHeldSalesModal && (
        <HeldSalesModal
          heldSales={heldSales}
          onRecall={handleRecallHeldSale}
          onDelete={handleDeleteHeldSale}
          onClose={() => setShowHeldSalesModal(false)}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && successTransaction && (
        <SuccessModal
          transaction={successTransaction}
          onClose={() => {
            setShowSuccessModal(false)
            setSuccessTransaction(null)
          }}
        />
      )}

      {/* Hidden Receipt for Printing */}
      <div ref={receiptRef} style={{ position: 'absolute', left: '-9999px' }}>
        <Receipt transaction={transactionData} storeInfo={storeInfo} />
      </div>
    </div>
  )
}

// Edit Item Modal Component (uses products prop from parent — no global refs)
const EditItemModal = ({ item, onSave, onClose, products = [] }) => {
  const productList = Array.isArray(products) ? products : []
  const [editedItem, setEditedItem] = useState({ 
    ...item,
    unit: item.unit || 'piece',
    unitLabel: item.unitLabel || 'pc'
  })

  const product = productList.find(p => p && p.id === item.id)
  const availableUnits = product?.units || [{ unit: 'piece', conversion: 1, price: item.unitPrice }]

  const handleSave = () => {
    const updatedItem = {
      ...editedItem,
      extPrice: (editedItem.unitPrice * editedItem.qty) - (editedItem.discount || 0)
    }
    onSave(updatedItem)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={editedItem.itemName}
              onChange={(e) => setEditedItem({ ...editedItem, itemName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={editedItem.qty}
                onChange={(e) => setEditedItem({ ...editedItem, qty: parseFloat(e.target.value) || 1 })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                min="0.25"
                step="0.25"
              />
              <select
                value={editedItem.unit || 'piece'}
                onChange={(e) => {
                  const selectedUnit = availableUnits.find(u => u.unit === e.target.value) || availableUnits[0]
                  const unitInfo = UNITS_OF_MEASURE.find(u => u.value === selectedUnit.unit)
                  setEditedItem({ 
                    ...editedItem, 
                    unit: selectedUnit.unit,
                    unitUuid: selectedUnit.uuid || null,
                    unitLabel: unitInfo?.abbreviation || selectedUnit.unit,
                    unitPrice: selectedUnit.price,
                    baseUnitPrice: editedItem.baseUnitPrice || editedItem.unitPrice
                  })
                }}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                {availableUnits.map(unitOption => {
                  const unitInfo = UNITS_OF_MEASURE.find(u => u.value === unitOption.unit)
                  return (
                    <option key={unitOption.unit} value={unitOption.unit}>
                      {unitInfo?.abbreviation || unitOption.unit}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Price</label>
            <input
              type="number"
              value={editedItem.unitPrice === 0 ? '' : editedItem.unitPrice}
              onChange={(e) => setEditedItem({ ...editedItem, unitPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Discount</label>
            <input
              type="number"
              value={(editedItem.discount || 0) === 0 ? '' : (editedItem.discount || 0)}
              onChange={(e) => setEditedItem({ ...editedItem, discount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// Receipt Preview Modal Component
const ReceiptModal = ({ transaction, storeInfo, onPrint, onClose, receiptRef }) => {
  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${storeInfo.name}</title>
          <style>
            @media print {
              @page {
                size: 55mm auto;
                margin: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              width: 55mm;
              margin: 0;
              padding: 10px;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          ${receiptRef.current?.innerHTML || ''}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gray-900 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold">Receipt Preview</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6 bg-gray-100 flex justify-center">
          <div className="bg-white shadow-lg" style={{ width: '55mm', minWidth: '55mm' }}>
            <Receipt transaction={transaction} storeInfo={storeInfo} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="bg-primary-600 text-white px-6 py-3 rounded font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={onPrint}
            className="bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

// Unit Selection Modal Component
const UnitSelectionModal = ({ product, currentItem, onSelect, onClose }) => {
  const availableUnits = product?.units || [{ unit: 'piece', conversion: 1, price: product.price }]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Select Unit of Measure</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Product: <span className="font-semibold text-gray-900">{product.itemName}</span></p>
          {currentItem && (
            <p className="text-xs text-gray-500">Current: {currentItem.qty} {currentItem.unitLabel || 'pc'}</p>
          )}
        </div>

        <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
          {availableUnits.map((unitOption, index) => {
            const unitInfo = UNITS_OF_MEASURE.find(u => u.value === unitOption.unit)
            const unitLabel = unitInfo?.label || unitOption.unit
            const unitAbbr = unitInfo?.abbreviation || unitOption.unit
            const isSelected = currentItem?.unit === unitOption.unit

            return (
              <button
                key={index}
                onClick={() => onSelect(unitOption)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{unitLabel}</div>
                    <div className="text-sm text-gray-600">
                      {unitOption.conversion !== 1 && (
                        <span>
                          {unitOption.conversion > 1 
                            ? `1 ${unitAbbr} = ${unitOption.conversion} ${product.baseUnit || 'pieces'}`
                            : `1 ${product.baseUnit || 'piece'} = ${(1 / unitOption.conversion).toFixed(2)} ${unitAbbr}`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-600">₵{unitOption.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">per {unitAbbr}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Discount Modal Component
const DiscountModal = ({ item, onApply, onClose }) => {
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState(0)

  const handleApply = () => {
    onApply(discountType, discountValue)
  }

  const maxDiscount = discountType === 'percentage' 
    ? 100 
    : item.unitPrice * item.qty

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Apply Discount</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Item: {item.itemName}</p>
          <p className="text-sm text-gray-600">Current Total: ₵{(item.unitPrice * item.qty).toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Amount ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Discount Value (Max: {maxDiscount.toFixed(2)}{discountType === 'percentage' ? '%' : '₵'})
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                setDiscountValue(Math.min(val, maxDiscount))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              step="0.01"
              min="0"
              max={maxDiscount}
            />
          </div>
          {discountValue > 0 && (
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                Discount Amount: ₵{discountType === 'percentage' 
                  ? ((item.unitPrice * item.qty * discountValue) / 100).toFixed(2)
                  : discountValue.toFixed(2)}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                New Total: ₵{discountType === 'percentage'
                  ? ((item.unitPrice * item.qty) - ((item.unitPrice * item.qty * discountValue) / 100)).toFixed(2)
                  : ((item.unitPrice * item.qty) - discountValue).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleApply} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  )
}

// Held Sales Modal Component
const HeldSalesModal = ({ heldSales, onRecall, onDelete, onClose }) => {
  const formatDate = (date) => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Held Sales</h2>
            <p className="text-sm text-gray-600 mt-1">
              {heldSales.length === 0 
                ? 'No held sales' 
                : `${heldSales.length} sale${heldSales.length > 1 ? 's' : ''} on hold`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {heldSales.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-2">No held sales</p>
              <p className="text-sm text-gray-500">Sales placed on hold will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {heldSales.map((sale) => (
                <div 
                  key={sale.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">{sale.id}</span>
                        <span className="text-sm text-gray-500">{formatDate(sale.timestamp)}</span>
                      </div>
                      {sale.customer && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Customer:</span> {sale.customer.name || sale.customer.phone || 'N/A'}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><span className="font-medium">Items:</span> {sale.itemCount}</span>
                        <span><span className="font-medium">Qty:</span> {sale.totalQty}</span>
                        <span><span className="font-medium">Payment:</span> {sale.selectedPayment || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        ₵{sale.total.toFixed(2)}
                      </div>
                      {sale.cartDiscount && sale.cartDiscount.value > 0 && (
                        <div className="text-xs text-green-600">
                          Discount: -₵{sale.cartDiscount.type === 'percentage' 
                            ? ((sale.subtotal * sale.cartDiscount.value) / 100).toFixed(2)
                            : sale.cartDiscount.value.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-3 pt-3 border-t">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Items:</div>
                    <div className="space-y-1 max-h-32 overflow-auto">
                      {sale.items.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600">
                          <span>{item.qty} {item.unitLabel || 'pc'} x {item.itemName}</span>
                          <span>₵{item.extPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {sale.items.length > 5 && (
                        <div className="text-xs text-gray-500 italic">
                          +{sale.items.length - 5} more item{sale.items.length - 5 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => onRecall(sale)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCw size={18} />
                      Recall Sale
                    </button>
                    <button
                      onClick={() => onDelete(sale.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Success Modal Component
const SuccessModal = ({ transaction, onClose }) => {
  const formatDate = (date) => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header with Success Icon */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 rounded-t-lg">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full p-3 mb-4">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Transaction Successful!</h2>
            <p className="text-green-100 text-sm">
              Your sale has been {transaction.action || 'completed'} successfully
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            {/* Receipt Number */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 font-medium">Receipt Number:</span>
              <span className="text-gray-900 font-bold">{transaction.receiptNumber}</span>
            </div>

            {/* Date & Time */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Date & Time:</span>
              <span className="text-gray-900">{formatDate(transaction.date)}</span>
            </div>

            {/* Customer */}
            {transaction.customer && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer:</span>
                <span className="text-gray-900 font-medium">{transaction.customer}</span>
              </div>
            )}

            {/* Payment Method */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <span className="text-gray-900 font-medium">{transaction.paymentMethod}</span>
            </div>

            {/* Items Summary */}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Items:</span>
                <span className="text-gray-900 font-semibold">{transaction.items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="text-gray-900 font-semibold">
                  {transaction.items.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              </div>
            </div>

            {/* Amounts */}
            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">₵{transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount:</span>
                  <span>-₵{transaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">₵{transaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">₵{transaction.total.toFixed(2)}</span>
              </div>
              {transaction.change > 0 && (
                <div className="flex justify-between items-center text-primary-600">
                  <span className="font-medium">Change:</span>
                  <span className="font-bold">₵{transaction.change.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-8 py-2 rounded font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Check size={18} />
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default POS
