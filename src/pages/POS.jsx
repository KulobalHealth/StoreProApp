import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HIcon } from '../components/HIcon'
import {
  Add01Icon,
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Cancel02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CreditCardIcon,
  Delete01Icon,
  DollarCircleIcon,
  Download01Icon,
  FileValidationIcon,
  InformationCircleIcon,
  Loading03Icon,
  Mail01Icon,
  MinusSignIcon,
  PencilEdit01Icon,
  PercentIcon,
  PrinterIcon,
  ReceiptTextIcon,
  RotateClockwiseIcon,
  RotateLeft01Icon,
  SaveIcon,
  Search01Icon,
  Settings02Icon,
  ShoppingBag01Icon,
  Tick01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import Tooltip from '../components/Tooltip'
import Receipt from '../components/Receipt'
import { printReceiptDirect } from '../utils/printReceipt'
import { listCustomers, listProducts, listProductsByBranch, listHeldSales, createSale, createHeldSale, deleteHeldSale } from '../api/awoselDb.js'
import { getSessionBranchId, getSessionOrgId, getActiveBranch as getActiveBranchUtil } from '../utils/branch'

// Common units of measure
const UNITS_OF_MEASURE = [
  { value: 'piece', label: 'Piece', abbreviation: 'pc' },
  { value: 'pack', label: 'Pack', abbreviation: 'pack' },
  { value: 'sachet', label: 'Sachet', abbreviation: 'sct' },
  { value: 'bag', label: 'Bag', abbreviation: 'bag' },
  { value: 'bucket', label: 'Bucket', abbreviation: 'bkt' },
  { value: 'sack', label: 'Sack', abbreviation: 'sck' },
  { value: 'strip', label: 'Strip', abbreviation: 'stp' },
  { value: 'box', label: 'Box', abbreviation: 'box' },
  { value: 'carton', label: 'Carton', abbreviation: 'ctn' },
  { value: '6in1', label: '6 in 1', abbreviation: '6in1' },
  { value: '4in1', label: '4 in 1', abbreviation: '4in1' },
  { value: '3in1', label: '3 in 1', abbreviation: '3in1' },
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
  const cost = Number(p.cost_price) ?? Number(p.cost) ?? 0
  const mappedUnits = (p.units && p.units.length > 0)
    ? p.units.map(u => ({
        uuid: u.uuid || null,
        unit: u.unit_name || u.unit || baseUnit,
        conversion: Number(u.conversion_quantity) ?? Number(u.conversion) ?? 1,
        price: Number(u.unit_price) ?? Number(u.price) ?? price
      }))
    : []
  // Always ensure the base unit is in the units list (at the front)
  const hasBaseUnit = mappedUnits.some(u => u.unit === baseUnit && u.conversion === 1)
  const units = hasBaseUnit
    ? mappedUnits
    : [{ uuid: null, unit: baseUnit, conversion: 1, price }, ...mappedUnits]
  return {
    id: p.id,
    uuid: p.uuid || p.id,
    itemNumber: p.sku || String(p.id),
    department: p.category || 'General',
    itemName: p.name || 'Unknown',
    brand: p.brand || '',
    price,
    stock: Number(p.quantity) || Number(p.stock) || 0,
    barcode: p.barcode || '',
    baseUnit,
    units
  }
}

const POS = () => {
  const navigate = useNavigate()
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
  const [savingState, setSavingState] = useState(null) // null | 'save' | 'print' | 'email'
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successTransaction, setSuccessTransaction] = useState(null)
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
    // Backend expects UUID for customer_id
    selectedCustomerIdRef.current = (customer && (customer.uuid || customer.id)) ? (customer.uuid || customer.id) : null
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

  // Reusable product fetch function
  const fetchProducts = useCallback(() => {
    const branchId = getSessionBranchId()
    if (!branchId) return
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

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Refetch products when the tab/page becomes visible (e.g. after editing inventory)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchProducts()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    // Also refetch when the window regains focus (covers same-tab navigation)
    window.addEventListener('focus', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [fetchProducts])

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
      (p.department || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q)
    )
    setProductsFromApi(filtered)
  }, [itemSearch, allProducts])

  // Load held sales from API (DB) and map to display format
  useEffect(() => {
    listHeldSales(getSessionBranchId())
      .then(res => {
        const data = res?.data || res
        const list = Array.isArray(data) ? data : []

        // Map API response items back to cart-compatible shape
        // API returns nested product & unit objects inside each item
        const mapped = list.map(sale => {
          const saleItems = Array.isArray(sale.items) ? sale.items : []
          const cartItems = saleItems.map(apiItem => {
            const qty = Number(apiItem.quantity ?? apiItem.qty ?? 1)
            const productId = apiItem.product_id || apiItem.productId || apiItem.id

            // Use embedded product/unit objects from the API response (primary source)
            const embeddedProduct = apiItem.product || null
            const embeddedUnit = apiItem.unit || null

            if (embeddedProduct) {
              // Determine unit info from embedded unit object
              const unitName = embeddedUnit?.unit_name || embeddedProduct.base_unit || 'piece'
              const unitUuid = embeddedUnit?.uuid || apiItem.product_unit || null
              const unitPrice = Number(embeddedUnit?.unit_price ?? embeddedProduct.selling_price ?? 0)
              const baseCost = Number(embeddedProduct.cost_price ?? 0)
              const basePrice = Number(embeddedProduct.selling_price ?? 0)
              const conversion = Number(embeddedUnit?.conversion_quantity ?? embeddedUnit?.base_quantity ?? 1)
              const unitLabel = UNITS_OF_MEASURE.find(u => u.value === unitName)?.abbreviation || unitName || 'pc'

              return {
                id: embeddedProduct.id,
                uuid: embeddedProduct.uuid || productId,
                itemNumber: embeddedProduct.sku || String(embeddedProduct.id || ''),
                department: embeddedProduct.category || 'General',
                itemName: embeddedProduct.name || 'Unknown',
                qty,
                unit: unitName,
                unitUuid,
                unitLabel,
                unitPrice,
                baseUnitPrice: basePrice,
                conversion,
                extPrice: unitPrice * qty,
                discount: 0,
                stock: Number(embeddedProduct.quantity_available ?? embeddedProduct.quantity ?? 0)
              }
            }

            // Fallback: try to match from allProducts cache
            const product = allProducts.find(p => p.id === productId || p.uuid === productId)
            if (product) {
              const unitUuid = apiItem.product_unit || apiItem.unitUuid || null
              const matchedUnit = unitUuid && product.units
                ? product.units.find(u => u.uuid === unitUuid)
                : product.units?.[0]
              const unitPrice = matchedUnit?.price ?? product.price ?? 0
              const unitLabel = UNITS_OF_MEASURE.find(u => u.value === (matchedUnit?.unit || product.baseUnit))?.abbreviation || 'pc'

              return {
                id: product.id,
                uuid: product.uuid || product.id,
                itemNumber: product.itemNumber || '',
                department: product.department || 'General',
                itemName: product.itemName || 'Unknown',
                qty,
                unit: matchedUnit?.unit || product.baseUnit || 'piece',
                unitUuid,
                unitLabel,
                unitPrice,
                baseUnitPrice: product.price || unitPrice,
                conversion: matchedUnit?.conversion || 1,
                extPrice: unitPrice * qty,
                discount: 0,
                stock: product.stock || 0
              }
            }

            // Last resort fallback — use raw API fields
            return {
              id: productId,
              uuid: productId,
              itemNumber: apiItem.sku || '',
              department: 'General',
              itemName: apiItem.product_name || apiItem.name || 'Unknown',
              qty,
              unit: apiItem.unit || 'piece',
              unitUuid: apiItem.product_unit || null,
              unitLabel: 'pc',
              unitPrice: Number(apiItem.unit_price ?? apiItem.price ?? 0),
              baseUnitPrice: Number(apiItem.price ?? 0),
              conversion: 1,
              extPrice: Number(apiItem.unit_price ?? apiItem.price ?? 0) * qty,
              discount: 0,
              stock: 0
            }
          })

          const saleTotal = Number(sale.total ?? 0)
          const saleSubtotal = Number(sale.subtotal ?? saleTotal)
          const saleTax = Number(sale.tax ?? 0)
          const saleDiscount = Number(sale.discount ?? 0)

          return {
            id: sale.id,
            uuid: sale.uuid || sale.id,
            timestamp: sale.created_at || sale.createdAt || sale.timestamp || new Date().toISOString(),
            customer: sale.customer || null,
            items: cartItems,
            cartDiscount: saleDiscount > 0
              ? { type: 'fixed', value: saleDiscount }
              : { type: 'percentage', value: 0 },
            selectedPayment: sale.payment_method || sale.selectedPayment || 'Cash',
            amountPaid: Number(sale.amount_paid ?? 0),
            subtotal: saleSubtotal,
            tax: saleTax,
            total: saleTotal,
            itemCount: cartItems.length,
            totalQty: cartItems.reduce((sum, item) => sum + item.qty, 0)
          }
        })

        setHeldSales(mapped)
      })
      .catch(() => setHeldSales([]))
  }, [allProducts])

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
          discount: 0,
          stock: typeof product.stock === 'number' ? product.stock : 0
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
      // Ensure amount_paid is never less than total to avoid backend "Insufficient payment" rejection.
      // The frontend already validates amountDue <= 0.01 above; floating-point drift or item-level
      // discount differences can still cause the backend's recalculated total to exceed what we send.
      const safeTotalForPayload = transaction.total
      const safeAmountPaid = Math.max(transaction.amountPaid, safeTotalForPayload)
      const safeChange = Math.max(0, safeAmountPaid - safeTotalForPayload)
      const salePayload = {
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
        customer_id: customerId || null,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        tax: transaction.tax,
        total: safeTotalForPayload,
        payment_method: transaction.paymentMethod,
        amount_paid: safeAmountPaid,
        change_amount: safeChange,
        items: items.map(item => ({
          product_id: item.uuid || item.id,
          quantity: Number(item.qty),
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
        // TODO: Integrate email service to send receipt
      }

      // Show success modal
      const successData = {
        ...transaction,
        action: email ? 'saved and emailed' : 'saved'
      }
      
      // Reset cart
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

      setSuccessTransaction(successData)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error saving transaction:', error)
      showAlert('error', `Failed to save transaction: ${error.message || 'Unknown error'}. Please try again.`, 'Save Failed')
    } finally {
      setSavingState(null)
    }
  }

  const handlePrintReceipt = async () => {
    try {
      // Transaction was already saved to backend in handleSaveTransaction — just print and reset

      // Trigger print using system printer
      setTimeout(() => {
        if (receiptRef.current) {
          printReceiptDirect(receiptRef.current)
        } else {
          console.error('Receipt reference not found')
          showAlert('error', 'Unable to print - receipt content not ready', 'Print Error')
        }
      }, 100)
      
      // Capture transaction snapshot BEFORE clearing the cart
      const txSnapshot = {
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
        change,
        action: 'saved and printed'
      }

      // Close receipt modal and show success modal
      setTimeout(() => {
        setShowReceiptModal(false)
        
        // Reset cart
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

        setSuccessTransaction(txSnapshot)
        setShowSuccessModal(true)
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

      const customerId = selectedCustomerIdRef.current

      // Build payload matching backend /held-sales endpoint
      const holdPayload = {
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
        customer_id: customerId || null,
        subtotal: typeof subtotal === 'number' ? subtotal : 0,
        discount: typeof cartDiscountAmount === 'number' ? cartDiscountAmount : 0,
        tax: typeof tax === 'number' ? tax : 0,
        total: typeof total === 'number' ? total : 0,
        payment_method: selectedPayment || 'Cash',
        amount_paid: 0,
        change_amount: 0,
        items: items.map(item => ({
          product_id: item.uuid || item.id,
          product_unit: item.unitUuid || null,
          quantity: Number(item.qty)
        }))
      }

      createHeldSale(holdPayload)
        .then(res => {
          const data = res?.data || res
          const holdId = data?.id || `HOLD-${Date.now()}`
          const holdUuid = data?.uuid || holdId

          // Build local held sale object for the modal (includes full cart items for recall)
          const heldSale = {
            id: holdId,
            uuid: holdUuid,
            timestamp: data?.created_at || data?.createdAt || new Date().toISOString(),
            customer: customer ? { ...customer } : null,
            items: items.map(item => ({ ...item })),
            cartDiscount: cartDiscount ? { ...cartDiscount } : { type: 'percentage', value: 0 },
            selectedPayment: selectedPayment || 'Cash',
            amountPaid: 0,
            subtotal: typeof subtotal === 'number' ? subtotal : 0,
            tax: typeof tax === 'number' ? tax : 0,
            total: typeof total === 'number' ? total : 0,
            itemCount: items.length,
            totalQty: items.reduce((sum, item) => sum + (typeof item.qty === 'number' ? item.qty : 0), 0)
          }

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
  }, [items, heldSales, customer, cartDiscount, cartDiscountAmount, selectedPayment, amountPaid, subtotal, tax, total])

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
    if (!Array.isArray(heldSale.items) || heldSale.items.length === 0) {
      showAlert('error', 'Invalid held sale data — no items found')
      return
    }

    // Items should already be in cart-compatible shape from the fetch mapping
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
    setShowHeldSalesModal(false)

    // Delete from backend when recalled (use numeric id for API)
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

  const totalLineItems = items.length
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  const customerDisplayName = customer?.name || 'Walk-in customer'
  const activeBranch = React.useMemo(() => {
    try {
      return getActiveBranch() || null
    } catch {
      return null
    }
  }, [getActiveBranch])
  const branchDisplayName = activeBranch?.name || storeInfo.branch || 'Main Branch'
  const branchLocation = activeBranch?.location || storeInfo.address || 'Accra'
  const paymentOptions = [
    { value: 'Cash', label: 'Cash', hint: 'Standard till payment' },
    { value: 'Mobile Money', label: 'Momo', hint: 'Digital wallet transfer' },
    { value: 'Cheque', label: 'Cheque', hint: 'Bank cheque settlement' },
  ]
  const paymentStateClass = amountDue > 0.01
    ? 'border-danger-100 bg-danger-50 text-danger-700'
    : change > 0
      ? 'border-success-100 bg-success-50 text-success-700'
      : 'border-gray-200 bg-gray-50 text-gray-500'
  const mobileMoneyProviders = ['MTN', 'Vodafone', 'AirtelTigo']
  const formatQuantity = (value) => {
    const normalized = Number(value) || 0
    return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(2)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-surface-page via-white to-primary-50/35">
      {/* Full-page saving overlay */}
      {savingState && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="app-surface flex flex-col items-center gap-3 p-8 shadow-panel">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
              <HIcon icon={Loading03Icon} size={28} className="animate-spin text-primary-600"  />
            </div>
            <p className="text-base font-bold text-gray-900">
              {savingState === 'print' ? 'Saving & Printing…' : savingState === 'email' ? 'Saving & Emailing…' : 'Saving Transaction…'}
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
              error:   { bg: 'bg-red-50 border-red-300',    text: 'text-red-800',    icon: <HIcon icon={Cancel02Icon} size={20} className="text-red-500 shrink-0"  /> },
              warning: { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800',  icon: <HIcon icon={Alert02Icon} size={20} className="text-amber-500 shrink-0"  /> },
              success: { bg: 'bg-green-50 border-green-300', text: 'text-green-800',  icon: <HIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-500 shrink-0"  /> },
              info:    { bg: 'bg-primary-50 border-primary-300',   text: 'text-primary-800',   icon: <HIcon icon={InformationCircleIcon} size={20} className="text-primary-500 shrink-0"  /> },
            }[alert.type] || { bg: 'bg-gray-50 border-gray-300', text: 'text-gray-800', icon: <HIcon icon={InformationCircleIcon} size={20} className="text-gray-500 shrink-0"  /> }
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-control border px-4 py-3 shadow-panel animate-[slideDown_0.3s_ease-out] ${config.bg}`}
              >
                {config.icon}
                <div className="flex-1 min-w-0">
                  {alert.title && <p className={`font-semibold text-sm ${config.text}`}>{alert.title}</p>}
                  <p className={`text-sm ${config.text} ${alert.title ? 'mt-0.5' : ''}`}>{alert.message}</p>
                </div>
                <button onClick={() => dismissAlert(alert.id)} className={`${config.text} hover:opacity-70 shrink-0 mt-0.5`}>
                  <HIcon icon={Cancel01Icon} size={16}  />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Remove Item Confirmation Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="app-surface mx-4 w-full max-w-sm overflow-hidden shadow-panel animate-[slideDown_0.25s_ease-out]">
            <div className="flex items-center gap-3 border-b border-danger-100 bg-danger-50 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-100">
                <HIcon icon={Delete01Icon} size={18} className="text-danger-600"  />
              </div>
              <h3 className="text-base font-bold text-gray-900">Remove Item</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-gray-600">
                Remove <span className="font-semibold text-gray-900">"{removeConfirm.name}"</span> from cart?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
              <button onClick={() => setRemoveConfirm(null)} className="app-btn-secondary py-2 text-sm">Cancel</button>
              <button
                onClick={() => {
                  handleRemoveItem(removeConfirm.id)
                  setRemoveConfirm(null)
                  showAlert('success', `"${removeConfirm.name}" removed from cart`)
                }}
                className="app-btn-danger flex items-center gap-1.5 py-2 text-sm"
              >
                <HIcon icon={Delete01Icon} size={14}  />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/branch-dashboard')} className="flex h-8 w-8 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <HIcon icon={ArrowLeft01Icon} size={18}  />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-500 shadow-soft">
              <HIcon icon={ShoppingBag01Icon} size={16} className="text-white"  />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900">Point of Sale</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                {cashierName && <span className="font-medium text-gray-500">{cashierName}</span>}
                {cashierName && <span>·</span>}
                <span className="font-mono text-primary-500">{receiptNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-3 rounded-control border border-gray-100 bg-gray-50/70 px-3 py-1.5 text-xs lg:flex">
              <span className="text-gray-400">{customerDisplayName}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{totalLineItems} items · {formatQuantity(totalUnits)} qty</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{selectedPayment || 'Cash'}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-control bg-primary-500 px-3.5 py-1.5 shadow-soft">
              <span className="text-xs font-semibold text-white/70">Total</span>
              <span className="text-sm font-extrabold text-white">₵{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-4 py-3">
        <div className="grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1.65fr)_340px]">
          <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
            {/* Search & Session Bar */}
            <div className="app-surface relative shrink-0 overflow-visible p-3">
              {/* Product Search Row */}
              <div className="relative">
                <HIcon icon={Search01Icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Scan barcode or search product…"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && filteredProducts.length > 0) {
                      handleAddItem(filteredProducts[0])
                    }
                  }}
                  className="app-input h-11 w-full pl-10 pr-24 text-sm"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{productsFromApi.length} items</span>
              </div>

              {productsError && (
                <div className="mt-2 flex items-center gap-2 rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-xs text-danger-700">
                  <HIcon icon={AlertCircleIcon} size={14}  />
                  <span className="truncate">{productsError}</span>
                </div>
              )}

              {/* Customer + Quick Actions Row */}
              <div className="mt-2.5 flex items-center gap-2">
                {/* Customer Input */}
                <div className="relative min-w-0 flex-1">
                  <HIcon icon={UserIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}  />
                  <input
                    type="text"
                    placeholder={customer ? `Selected: ${customer.name}` : 'Customer…'}
                    value={customer ? `${customer.name}${customer.phone ? ` · ${customer.phone}` : ''}` : customerSearch}
                    onChange={(e) => {
                      setCustomer(null)
                      setCustomerSearch(e.target.value)
                      setCustomerDropdownOpen(true)
                    }}
                    onFocus={() => !customer && setCustomerDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 180)}
                    readOnly={!!customer}
                    className="app-input h-9 w-full pl-8 pr-14 text-xs"
                  />
                  {customer ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomer(null)
                        setCustomerSearch('')
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 hover:bg-danger-50 hover:text-danger-600"
                      title="Clear customer"
                    >
                      Clear
                    </button>
                  ) : (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">Walk-in</span>
                  )}
                  {customerDropdownOpen && (customerSearch.trim() || filteredCustomersForPOS.length > 0) && !customer && (
                    <div
                      className="absolute left-0 right-0 top-full z-[100] mt-1.5 max-h-52 overflow-auto rounded-control border border-gray-200 bg-white shadow-panel"
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
                        className="w-full border-b px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
                      >
                        Walk-in (no customer)
                      </button>
                      {filteredCustomersForPOS.map(c => (
                        <button
                          type="button"
                          key={c.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCustomer({ id: c.id, uuid: c.uuid || c.id, name: c.name || '', phone: c.phone || '', email: c.email || '' })
                            setCustomerSearch(c.name || '')
                            setCustomerDropdownOpen(false)
                          }}
                          className="w-full border-b px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-gray-100"
                        >
                          <div className="font-medium text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-600">{[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact'}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-6 w-px shrink-0 bg-gray-200" />

                {/* Quick Action Buttons – inline row */}
                <div className="flex shrink-0 items-center gap-1" ref={iWantToMenuRef}>
                  <Tooltip text="Held Sales" position="bottom">
                    <button
                      type="button"
                      onClick={() => setShowHeldSalesModal(true)}
                      className="relative flex h-9 w-9 items-center justify-center rounded-control border border-gray-200 bg-white transition-colors hover:border-info-200 hover:bg-info-50"
                    >
                      <HIcon icon={Clock01Icon} size={15} className="text-info-600"  />
                      {heldSales.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-info-600 text-[9px] font-bold text-white">{heldSales.length}</span>}
                    </button>
                  </Tooltip>
                  <Tooltip text="Preview Receipt" position="bottom">
                    <button
                      type="button"
                      onClick={() => handleIWantToAction('viewReceipt')}
                      disabled={items.length === 0}
                      className="flex h-9 w-9 items-center justify-center rounded-control border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <HIcon icon={ReceiptTextIcon} size={15} className="text-gray-500"  />
                    </button>
                  </Tooltip>
                  <Tooltip text="More Actions" position="bottom">
                    <button
                      type="button"
                      onClick={() => setShowIWantToMenu(!showIWantToMenu)}
                      className="flex h-9 w-9 items-center justify-center rounded-control border border-primary-200 bg-primary-50 transition-colors hover:bg-primary-100"
                    >
                      <HIcon icon={ArrowDown01Icon} size={15} className={`text-primary-600 transition-transform ${showIWantToMenu ? 'rotate-180' : ''}`}  />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {itemSearch && itemSearch.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mx-3 mt-1 max-h-72 overflow-auto rounded-control border border-gray-200 bg-white shadow-panel">
                  {productsLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-gray-500">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                      Searching…
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.slice(0, 8).map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleAddItem(product)}
                        className="flex cursor-pointer items-center gap-2.5 border-b border-gray-50 px-3.5 py-2.5 transition-colors last:border-0 hover:bg-primary-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-gray-100">
                          <HIcon icon={ShoppingBag01Icon} size={14} className="text-gray-500"  />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-gray-900">{product.itemName}</span>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                              (product.stock || 0) <= 0
                                ? 'bg-red-100 text-red-700'
                                : (product.stock || 0) <= 5
                                  ? 'bg-warning-100 text-warning-700'
                                  : 'bg-success-100 text-success-700'
                            }`}>
                              {product.stock || 0} left
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-gray-400">
                            {product.department}
                            {product.brand && product.brand !== 'N/A' && product.brand !== '-' && (
                              <span className="font-medium text-gray-500"> · {product.brand}</span>
                            )}
                            {' · '}<span className="font-semibold text-primary-600">₵{product.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-xs text-gray-400">No products found</div>
                  )}
                </div>
              )}

              {/* More Actions Dropdown */}
              {showIWantToMenu && (
                <div className="absolute right-3 top-full z-50 mt-1 w-56 overflow-hidden rounded-control border border-gray-200 bg-white shadow-panel">
                  <div className="py-1">
                    <button onClick={() => handleIWantToAction('viewHeldSales')} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
                      <HIcon icon={Clock01Icon} size={15} className="text-gray-400"  />
                      <span className="font-medium text-gray-700">Held Sales</span>
                    </button>
                    <button onClick={() => handleIWantToAction('applyCartDiscount')} disabled={items.length === 0} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                      <HIcon icon={PercentIcon} size={15} className="text-gray-400"  />
                      <span className="font-medium text-gray-700">Cart Discount</span>
                    </button>
                    <button onClick={() => handleIWantToAction('applyItemDiscount')} disabled={!selectedItem} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                      <HIcon icon={DollarCircleIcon} size={15} className="text-gray-400"  />
                      <span className="font-medium text-gray-700">Item Discount</span>
                    </button>
                    <div className="my-0.5 border-t border-gray-100" />
                    <button onClick={() => handleIWantToAction('lookupCustomer')} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
                      <HIcon icon={UserIcon} size={15} className="text-gray-400"  />
                      <span className="font-medium text-gray-700">Lookup Customer</span>
                    </button>
                    <button onClick={() => handleIWantToAction('openCashDrawer')} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
                      <HIcon icon={CreditCardIcon} size={15} className="text-gray-400"  />
                      <span className="font-medium text-gray-700">Open Cash Drawer</span>
                    </button>
                    <button onClick={() => handleIWantToAction('clearCart')} disabled={items.length === 0} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                      <HIcon icon={Delete01Icon} size={15} className="text-gray-400"  />
                      <span className="font-medium text-gray-700">Clear Cart</span>
                    </button>
                    <div className="my-0.5 border-t border-gray-100" />
                    <button onClick={() => handleIWantToAction('voidTransaction')} disabled={items.length === 0} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-40">
                      <HIcon icon={AlertCircleIcon} size={15} className="text-danger-500"  />
                      <span className="font-medium text-danger-600">Void Transaction</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="app-table-shell flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/80 px-4 py-2">
                <div className="flex items-center gap-2">
                  <HIcon icon={ShoppingBag01Icon} size={14} className="text-gray-400"  />
                  <span className="text-xs font-semibold text-gray-500">Cart</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500 shadow-sm">{totalLineItems} lines · {formatQuantity(totalUnits)} qty</span>
              </div>

              <div className="flex-1 overflow-auto bg-white">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                      <HIcon icon={ShoppingBag01Icon} size={24} className="text-gray-300"  />
                    </div>
                    <p className="text-sm font-medium text-gray-400">Scan or search to add items</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="app-table-head border-b border-gray-200">
                        <th className="app-table-head-cell">SKU</th>
                        <th className="app-table-head-cell">Category</th>
                        <th className="app-table-head-cell">Item</th>
                        <th className="app-table-head-cell text-center">Stock</th>
                        <th className="app-table-head-cell text-center">Qty</th>
                        <th className="app-table-head-cell text-right">Amount</th>
                        <th className="app-table-head-cell text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={`${item.id}-${index}`}
                          onClick={() => handleRowClick(item)}
                          className={`app-table-row cursor-pointer ${selectedItem?.id === item.id ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : ''}`}
                        >
                          <td className="px-4 py-3.5 font-mono text-xs text-gray-400">{item.itemNumber || '—'}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{item.department}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="text-sm font-semibold text-gray-900">{item.itemName}</div>
                            {item.discount > 0 && <div className="mt-0.5 text-xs font-medium text-warning-600">-₵{item.discount.toFixed(2)} discount</div>}
                            <div className="mt-0.5 text-xs text-gray-400">₵{item.unitPrice.toFixed(2)} / {item.unitLabel || 'pc'}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              (item.stock || 0) <= 0
                                ? 'bg-red-100 text-red-700'
                                : (item.stock || 0) <= 5
                                  ? 'bg-warning-100 text-warning-700'
                                  : 'bg-success-100 text-success-700'
                            }`}>
                              {item.stock || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, -1, item.unit) }} className="flex h-7 w-7 items-center justify-center rounded-control bg-gray-100 transition-colors hover:bg-primary-100 hover:text-primary-700">
                                <HIcon icon={MinusSignIcon} size={13}  />
                              </button>
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  const newQty = parseFloat(e.target.value) || 0.25
                                  if (newQty > 0) {
                                    const changeValue = newQty - item.qty
                                    handleQtyChange(item.id, changeValue, item.unit)
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-14 rounded-control border border-gray-200 px-1 py-1 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400"
                                step="0.25"
                                min="0.25"
                              />
                              <button onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, 1, item.unit) }} className="flex h-7 w-7 items-center justify-center rounded-control bg-gray-100 transition-colors hover:bg-primary-100 hover:text-primary-700">
                                <HIcon icon={Add01Icon} size={13}  />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm font-bold text-gray-900">₵{item.extPrice.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setRemoveConfirm({ id: item.id, name: item.itemName })
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-control text-gray-300 transition-colors hover:bg-danger-50 hover:text-danger-500"
                            >
                              <HIcon icon={Delete01Icon} size={16}  />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t border-gray-200 bg-gray-50/80 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {selectedItem ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600">
                        <HIcon icon={Tick01Icon} size={10}  />
                        {selectedItem.itemName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Select an item for actions</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Tooltip text="Edit item" position="bottom"><button onClick={handleEditItem} disabled={!selectedItem} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-white hover:text-primary-600 disabled:opacity-30"><HIcon icon={PencilEdit01Icon} size={13}  /></button></Tooltip>
                    <Tooltip text="Return item" position="bottom"><button onClick={handleReturnItem} disabled={!selectedItem} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-white hover:text-warning-600 disabled:opacity-30"><HIcon icon={RotateLeft01Icon} size={13}  /></button></Tooltip>
                    <Tooltip text="Discount" position="bottom"><button onClick={() => {
                      if (selectedItem) {
                        const product = productsFromApi.find(p => p.id === selectedItem.id)
                        if (product?.units && product.units.length > 1) {
                          setPendingProduct(product)
                          setShowUnitModal(true)
                        } else {
                          handleApplyItemDiscount()
                        }
                      }
                    }} disabled={!selectedItem} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-white hover:text-primary-600 disabled:opacity-30"><HIcon icon={PercentIcon} size={13}  /></button></Tooltip>
                    <Tooltip text="Qty +" position="bottom"><button onClick={() => selectedItem && handleQtyChange(selectedItem.id, 1)} disabled={!selectedItem} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-white hover:text-success-600 disabled:opacity-30"><HIcon icon={Add01Icon} size={13}  /></button></Tooltip>
                    <Tooltip text="Qty −" position="bottom"><button onClick={() => selectedItem && handleQtyChange(selectedItem.id, -1)} disabled={!selectedItem} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-white hover:text-warning-600 disabled:opacity-30"><HIcon icon={MinusSignIcon} size={13}  /></button></Tooltip>
                    <Tooltip text="Remove item" position="bottom"><button onClick={() => selectedItem && setRemoveConfirm({ id: selectedItem.id, name: selectedItem.itemName })} disabled={!selectedItem} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-30"><HIcon icon={Delete01Icon} size={13}  /></button></Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane – Checkout */}
          <div className="flex min-h-0 flex-col gap-3 xl:overflow-auto">
            {/* Branch & Cashier strip */}
            <div className="flex items-center gap-2 rounded-control border border-gray-100 bg-gray-50/70 px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                <HIcon icon={ShoppingBag01Icon} size={11} className="text-primary-600"  />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-700">{storeInfo.name} — {branchDisplayName}</p>
                <p className="truncate text-[10px] text-gray-400">{cashierName || 'Operator'} · {receiptNumber}</p>
              </div>
            </div>

            {/* Checkout Summary */}
            <div className="app-surface flex flex-col overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Amount Due</p>
                    <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-gray-900">₵{total.toFixed(2)}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{totalLineItems} items</span>
                </div>
              </div>

              <div className="space-y-4 px-4 py-3">
                {/* Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="font-semibold text-gray-600">₵{subtotal.toFixed(2)}</span></div>
                  {cartDiscountAmount > 0 && <div className="flex justify-between text-warning-600"><span>Discount</span><span className="font-semibold">-₵{cartDiscountAmount.toFixed(2)}</span></div>}
                  {tax > 0 && <div className="flex justify-between text-gray-400"><span>Tax ({taxRatePercent}%)</span><span className="font-semibold text-gray-600">₵{tax.toFixed(2)}</span></div>}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Payment</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {paymentOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSelectedPayment(value)
                          setAmountPaid(total)
                        }}
                        className={`rounded-control border py-2 text-center text-xs font-bold transition-all ${selectedPayment === value ? 'border-primary-500 bg-primary-500 text-white shadow-soft' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPayment === 'Mobile Money' && (
                  <div className="rounded-control border border-info-100 bg-info-50 p-2.5">
                    <div className="grid gap-2 grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-info-600">Provider</label>
                        <select value={mobileMoneyProvider} onChange={(e) => setMobileMoneyProvider(e.target.value)} className="app-input bg-white py-2 text-xs">
                          {mobileMoneyProviders.map((p) => (<option key={p} value={p}>{p}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-info-600">Number</label>
                        <input type="text" value={mobileMoneyNumber} onChange={(e) => setMobileMoneyNumber(e.target.value)} placeholder="024 000 0000" className="app-input bg-white py-2 text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Tendered */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Tendered</label>
                  <div className="flex items-center gap-1.5 rounded-control border border-gray-200 bg-white px-3 py-2 transition-all focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
                    <span className="text-xs font-bold text-gray-300">₵</span>
                    <input
                      type="number"
                      value={amountPaid === 0 ? '' : amountPaid}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-gray-900 focus:outline-none focus:ring-0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Due / Change */}
                <div className={`rounded-control border px-3 py-2.5 ${paymentStateClass}`}>
                  {amountDue > 0.01 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Due</span>
                      <span className="text-lg font-extrabold">₵{amountDue.toFixed(2)}</span>
                    </div>
                  ) : change > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Change</span>
                      <span className="text-lg font-extrabold">₵{change.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Ready</span>
                      <span className="text-lg font-extrabold">₵0.00</span>
                    </div>
                  )}
                </div>

                {/* Cart Discount */}
                <div ref={cartDiscountRef}>
                  <label className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                    <span>Cart Discount</span>
                    {cartDiscountAmount > 0 && <span className="rounded-full bg-warning-100 px-1.5 py-px text-[9px] font-bold text-warning-700 normal-case">-₵{cartDiscountAmount.toFixed(2)}</span>}
                  </label>
                  <div className="flex gap-1.5">
                    <select value={cartDiscount.type} onChange={(e) => setCartDiscount({ ...cartDiscount, type: e.target.value })} className="app-input-muted flex-1 px-2 py-2 text-xs">
                      <option value="percentage">%</option>
                      <option value="amount">₵</option>
                    </select>
                    <input
                      type="number"
                      value={cartDiscount.value === 0 ? '' : cartDiscount.value}
                      onChange={(e) => setCartDiscount({ ...cartDiscount, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="app-input-muted w-20 px-2 py-2 text-center text-xs font-bold"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Hold / Cancel */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => setShowHeldSalesModal(true)} className="relative flex items-center justify-center gap-1.5 rounded-control border border-info-200 bg-info-50 px-2 py-2 text-xs font-bold text-info-700 transition-colors hover:bg-info-100">
                    <HIcon icon={Clock01Icon} size={13}  />Held
                    {heldSales.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-info-600 text-[9px] font-bold text-white">{heldSales.length}</span>}
                  </button>
                  <button onClick={handlePutOnHold} disabled={items.length === 0} className="flex items-center justify-center gap-1.5 rounded-control border border-warning-200 bg-warning-50 px-2 py-2 text-xs font-bold text-warning-700 transition-colors hover:bg-warning-100 disabled:cursor-not-allowed disabled:opacity-40">
                    <HIcon icon={SaveIcon} size={13}  />Hold
                  </button>
                  <button onClick={handleCancel} className="flex items-center justify-center gap-1.5 rounded-control border border-danger-200 bg-danger-50 px-2 py-2 text-xs font-bold text-danger-700 transition-colors hover:bg-danger-100">
                    <HIcon icon={Cancel01Icon} size={13}  />Cancel
                  </button>
                </div>

                {/* Complete Sale Actions */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSaveTransaction(false, true)}
                    disabled={!!savingState}
                    className={`flex w-full items-center justify-between rounded-control border px-3 py-2.5 text-left transition-all ${savingState === 'email' ? 'cursor-wait border-info-400 bg-info-100 text-info-700' : savingState ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50' : 'border-gray-200 bg-white text-gray-600 hover:border-info-300 hover:bg-info-50'}`}
                  >
                    <span className="text-xs font-bold">Email Receipt</span>
                    <HIcon icon={Mail01Icon} size={14} className="shrink-0"  />
                  </button>
                  <button
                    onClick={() => handleSaveTransaction(false, false)}
                    disabled={!!savingState}
                    className={`flex w-full items-center justify-between rounded-control border px-3 py-2.5 text-left transition-all ${savingState === 'save' ? 'cursor-wait border-success-500 bg-success-500 text-white' : savingState ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50' : 'border-success-200 bg-success-50 text-success-700 hover:bg-success-100'}`}
                  >
                    <span className="text-xs font-bold">{savingState === 'save' ? 'Saving…' : 'Save Only'}</span>
                    {savingState === 'save' ? <HIcon icon={Loading03Icon} size={14} className="animate-spin shrink-0"  /> : <HIcon icon={Tick01Icon} size={14} className="shrink-0"  />}
                  </button>
                  <button
                    onClick={() => handleSaveTransaction(true, false)}
                    disabled={!!savingState}
                    className={`flex w-full items-center justify-between rounded-control px-4 py-3 text-left transition-all shadow-soft ${savingState === 'print' ? 'cursor-wait bg-primary-500 text-white' : savingState ? 'cursor-not-allowed bg-primary-300 text-white opacity-50' : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600'}`}
                  >
                    <span className="text-sm font-bold">{savingState === 'print' ? 'Saving…' : 'Save & Print'}</span>
                    {savingState === 'print' ? <HIcon icon={Loading03Icon} size={16} className="animate-spin shrink-0"  /> : <HIcon icon={PrinterIcon} size={16} className="shrink-0"  />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#ecfdf3' }}>
              <HIcon icon={CheckmarkCircle02Icon} size={36} style={{ color: '#059669' }}  />
            </div>

            <h2 className="text-xl font-extrabold text-gray-900">Sale Complete!</h2>
            <p className="mt-1 text-sm text-gray-500">Transaction {successTransaction.action || 'completed'} successfully</p>

            <p className="mt-5 text-3xl font-extrabold" style={{ color: '#059669' }}>
              ₵{(successTransaction.total || 0).toFixed(2)}
            </p>
            {(successTransaction.change || 0) > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Change: <span className="font-bold" style={{ color: '#FF7521' }}>₵{(successTransaction.change || 0).toFixed(2)}</span>
              </p>
            )}

            <div className="mx-auto mt-5 max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Receipt</span>
                <span className="font-mono text-xs font-bold text-gray-900">{successTransaction.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment</span>
                <span className="font-semibold capitalize text-gray-700">{successTransaction.paymentMethod}</span>
              </div>
            </div>

            <button
              onClick={() => { setShowSuccessModal(false); setSuccessTransaction(null) }}
              className="mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF7521' }}
            >
              <HIcon icon={ShoppingBag01Icon} size={16}  />
              New Sale
            </button>
          </div>
        </div>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="app-surface w-full max-w-md overflow-hidden shadow-panel">
        <div className="border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-100">
              <HIcon icon={PencilEdit01Icon} size={15} className="text-primary-600"  />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Edit Item</h2>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HIcon icon={Cancel01Icon} size={16}  />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">Item Name</label>
            <input
              type="text"
              value={editedItem.itemName}
              onChange={(e) => setEditedItem({ ...editedItem, itemName: e.target.value })}
              className="app-input py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">Quantity &amp; Unit</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={editedItem.qty}
                onChange={(e) => setEditedItem({ ...editedItem, qty: parseFloat(e.target.value) || 1 })}
                className="app-input flex-1 py-2 text-sm"
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
                className="app-input w-24 py-2 text-sm"
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
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">Unit Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300">₵</span>
              <input
                type="number"
                value={editedItem.unitPrice === 0 ? '' : editedItem.unitPrice}
                onChange={(e) => setEditedItem({ ...editedItem, unitPrice: parseFloat(e.target.value) || 0 })}
                className="app-input py-2 pl-7 text-sm"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">Item Discount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300">₵</span>
              <input
                type="number"
                value={(editedItem.discount || 0) === 0 ? '' : (editedItem.discount || 0)}
                onChange={(e) => setEditedItem({ ...editedItem, discount: parseFloat(e.target.value) || 0 })}
                className="app-input py-2 pl-7 text-sm"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="app-btn-secondary flex-1 justify-center py-2 text-sm">Cancel</button>
          <button onClick={handleSave} className="app-btn-primary flex-1 justify-center py-2 text-sm shadow-soft">Save Changes</button>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="app-surface max-w-2xl w-full max-h-[90vh] overflow-auto shadow-panel">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3.5 flex items-center justify-between" style={{ borderRadius: 'var(--radius-panel) var(--radius-panel) 0 0' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-100">
              <HIcon icon={ReceiptTextIcon} size={15} className="text-primary-600"  />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Receipt Preview</h2>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HIcon icon={Cancel01Icon} size={16}  />
          </button>
        </div>

        <div className="p-5 bg-gray-100 flex justify-center">
          <div className="bg-white shadow-soft" style={{ width: '55mm', minWidth: '55mm' }}>
            <Receipt transaction={transaction} storeInfo={storeInfo} />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-end gap-2" style={{ borderRadius: '0 0 var(--radius-panel) var(--radius-panel)' }}>
          <button onClick={onClose} className="app-btn-secondary py-2 text-sm">Close</button>
          <button onClick={handleDownload} className="app-btn-secondary flex items-center gap-1.5 border-primary-200 py-2 text-sm text-primary-600 hover:bg-primary-50">
            <HIcon icon={Download01Icon} size={14}  />
            Download
          </button>
          <button onClick={onPrint} className="app-btn-primary flex items-center gap-1.5 py-2 text-sm shadow-soft">
            <HIcon icon={PrinterIcon} size={14}  />
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="app-surface w-full max-w-md overflow-hidden shadow-panel">
        <div className="border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-100">
              <HIcon icon={ShoppingBag01Icon} size={14} className="text-primary-600"  />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Select Unit</h2>
              <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{product.itemName}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HIcon icon={Cancel01Icon} size={16}  />
          </button>
        </div>

        <div className="p-4 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {availableUnits.map((unitOption, index) => {
            const unitInfo = UNITS_OF_MEASURE.find(u => u.value === unitOption.unit)
            const unitLabel = unitInfo?.label || unitOption.unit
            const unitAbbr = unitInfo?.abbreviation || unitOption.unit
            const isSelected = currentItem?.unit === unitOption.unit

            return (
              <button
                key={index}
                onClick={() => onSelect(unitOption)}
                className={`w-full p-3 border rounded-control text-left transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-soft'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{unitLabel}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
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
                    <div className="font-extrabold text-primary-600 text-base">₵{unitOption.price.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-400">per {unitAbbr}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="px-4 pb-4">
          <button onClick={onClose} className="app-btn-secondary w-full justify-center py-2 text-sm">
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="app-surface w-full max-w-sm overflow-hidden shadow-panel">
        <div className="border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-warning-100">
              <HIcon icon={PercentIcon} size={15} className="text-warning-600"  />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Apply Discount</h2>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HIcon icon={Cancel01Icon} size={16}  />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-3.5 rounded-control border border-gray-200 bg-gray-50 p-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.14em]">{item.itemName}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">₵{(item.unitPrice * item.qty).toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="app-input py-2 text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Fixed Amount (₵)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] mb-1">
                Value (max {maxDiscount.toFixed(2)}{discountType === 'percentage' ? '%' : '₵'})
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  setDiscountValue(Math.min(val, maxDiscount))
                }}
                className="app-input py-2 text-sm"
                step="0.01"
                min="0"
                max={maxDiscount}
                autoFocus
              />
            </div>
            {discountValue > 0 && (
              <div className="rounded-control border border-warning-200 bg-warning-50 p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-bold text-warning-600">-₵{discountType === 'percentage' 
                    ? ((item.unitPrice * item.qty * discountValue) / 100).toFixed(2)
                    : discountValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1.5 pt-1.5 border-t border-warning-200">
                  <span className="font-bold text-gray-900">New Total</span>
                  <span className="font-extrabold text-gray-900">₵{discountType === 'percentage'
                    ? ((item.unitPrice * item.qty) - ((item.unitPrice * item.qty * discountValue) / 100)).toFixed(2)
                    : ((item.unitPrice * item.qty) - discountValue).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="app-btn-secondary flex-1 justify-center py-2 text-sm">Cancel</button>
          <button onClick={handleApply} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-control bg-warning-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-warning-600 shadow-soft">Apply</button>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="app-surface w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-panel">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-warning-100">
              <HIcon icon={Clock01Icon} size={15} className="text-warning-600"  />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Held Sales</h2>
              <p className="text-[10px] text-gray-400">
                {heldSales.length === 0 ? 'None' : `${heldSales.length} on hold`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-control text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <HIcon icon={Cancel01Icon} size={16}  />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {heldSales.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-3">
                <HIcon icon={Clock01Icon} size={20} className="text-gray-300"  />
              </div>
              <p className="text-sm font-semibold text-gray-500">No held sales</p>
              <p className="text-xs text-gray-400 mt-0.5">Sales placed on hold will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {heldSales.map((sale) => (
                <div key={sale.id} className="rounded-control border border-gray-200 bg-white p-3 hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs font-mono">#{sale.id}</span>
                        <span className="text-[10px] text-gray-400">{formatDate(sale.timestamp)}</span>
                      </div>
                      {sale.customer && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <HIcon icon={UserIcon} size={11} className="text-gray-400"  />
                          <span className="truncate">{sale.customer.name || sale.customer.phone || 'N/A'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span className="rounded-full bg-gray-100 px-1.5 py-px">{sale.itemCount} items</span>
                        <span className="rounded-full bg-gray-100 px-1.5 py-px">{sale.totalQty} qty</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-primary-600">₵{(sale.total || 0).toFixed(2)}</div>
                      {sale.cartDiscount && sale.cartDiscount.value > 0 && (
                        <div className="text-[10px] text-warning-600 font-medium">
                          -₵{sale.cartDiscount.type === 'percentage' 
                            ? ((sale.subtotal * sale.cartDiscount.value) / 100).toFixed(2)
                            : sale.cartDiscount.value.toFixed(2)} disc.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-2 pt-2 border-t border-gray-50">
                    <div className="space-y-0.5 max-h-16 overflow-auto">
                      {sale.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] text-gray-400">
                          <span className="truncate">{item.qty} {item.unitLabel || 'pc'} × {item.itemName}</span>
                          <span className="font-semibold shrink-0 ml-2 text-gray-500">₵{(item.extPrice || 0).toFixed(2)}</span>
                        </div>
                      ))}
                      {sale.items.length > 3 && <div className="text-[10px] text-gray-300">+{sale.items.length - 3} more</div>}
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-2 border-t border-gray-50">
                    <button onClick={() => onRecall(sale)} className="app-btn-primary flex-1 justify-center gap-1.5 py-2 text-xs">
                      <HIcon icon={RotateClockwiseIcon} size={13}  />
                      Recall
                    </button>
                    <button onClick={() => onDelete(sale.id)} className="flex h-8 w-8 items-center justify-center rounded-control border border-danger-200 bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors">
                      <HIcon icon={Delete01Icon} size={13}  />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex justify-end shrink-0">
          <button onClick={onClose} className="app-btn-secondary py-2 text-sm">Close</button>
        </div>
      </div>
    </div>
  )
}

export default POS
