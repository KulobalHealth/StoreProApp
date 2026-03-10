import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSessionBranchId, getSessionOrgId, getActiveBranch as getActiveBranchUtil } from '../utils/branch'
import * as XLSX from 'xlsx'
import { Search, Plus, Edit, Trash2, AlertTriangle, Upload, Download, Package, X, Trash, CheckCircle, Check, ChevronLeft, ChevronRight, ChevronDown, ShoppingCart, FileText, Clock, CheckCircle2, ClipboardList, Scan, TrendingUp, TrendingDown, Minus, Building2, FolderOpen, Save, Filter, XCircle } from 'lucide-react'
import {
  listProducts,
  listProductsByBranch,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
  bulkImportProducts,
  listReceipts,
  listSuppliers,
  createReceipt,
  createReceiptBulk,
  addReceiptItem,
  receiveReceipt,
} from '../api/awoselDb.js'

function mapApiProductToDisplay(p) {
  const baseUnit = p.base_unit || 'piece'
  const defaultPrice = p.selling_price ?? p.price ?? 0
  const defaultCost = p.cost_price ?? p.cost ?? 0
  const units = (p.units && p.units.length > 0)
    ? p.units.map(u => ({
        unit: u.unit_name,
        conversion: u.conversion_quantity ?? u.base_quantity ?? 1,
        price: Number(u.unit_price) ?? Number(u.price) ?? defaultPrice,
        cost: Number(u.cost_price) ?? Number(u.cost) ?? defaultCost
      }))
    : [{ unit: baseUnit, conversion: 1, price: defaultPrice, cost: defaultCost }]
  return {
    ...p,
    price: p.selling_price ?? p.price ?? 0,
    cost: p.cost_price ?? p.cost ?? 0,
    stock: p.quantity ?? p.stock ?? 0,
    minStock: p.min_stock_quantity ?? p.minStock ?? 0,
    reorderPoint: p.reorder_quantity ?? p.reorderPoint ?? p.min_stock_quantity ?? 0,
    expiry: p.expiry_date ?? p.expiry ?? null,
    baseUnit,
    units,
  }
}

const Inventory = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)

  // Get active branch for the session
  const getActiveBranch = getActiveBranchUtil

  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])
  const [importFileType, setImportFileType] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successProduct, setSuccessProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const PAGE_SIZE = 100
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false)
  const [showPurchaseOrderList, setShowPurchaseOrderList] = useState(false)
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportDepartmentFilter, setExportDepartmentFilter] = useState('all')
  const [exportSaleFilter, setExportSaleFilter] = useState('all') // 'all' | 'high' | 'low'
  const [stockFilter, setStockFilter] = useState('all') // 'all' | 'high_sale' | 'low_sale' | 'out_of_stock' | 'expired'
  const fileInputRef = useRef(null)
  
  // Department Management - Load from localStorage
  const loadDepartments = () => {
    const saved = localStorage.getItem('departments')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error loading departments:', e)
      }
    }
    return [
      { id: 1, name: 'Beverages', description: 'Drinks and beverages', productCount: 0 },
      { id: 2, name: 'Bakery', description: 'Baked goods and pastries', productCount: 0 },
      { id: 3, name: 'Dairy', description: 'Dairy products', productCount: 0 },
      { id: 4, name: 'Grains', description: 'Rice, wheat, and grains', productCount: 0 },
      { id: 5, name: 'Cooking', description: 'Cooking ingredients', productCount: 0 },
      { id: 6, name: 'Baking', description: 'Baking supplies', productCount: 0 },
    ]
  }

  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all')
  
  // Get departments for filter dropdown
  const getDepartments = () => loadDepartments()

  const fetchProducts = async (page) => {
    const pageToFetch = page !== undefined && page !== null ? page : currentPage
    setProductsLoading(true)
    setProductsError(null)
    try {
      const activeBranch = getActiveBranch()
      const branchId = activeBranch?.uuid || activeBranch?.id
      let data
      if (branchId) {
        // Use branch-specific endpoint
        const res = await listProductsByBranch(branchId)
        data = res?.data || res
      } else {
        // Fallback to generic products list
        const query = { page: pageToFetch, limit: PAGE_SIZE }
        if (searchTerm.trim()) query.search = searchTerm.trim()
        if (selectedDepartmentFilter && selectedDepartmentFilter !== 'all') query.category = selectedDepartmentFilter
        data = await listProducts(query)
      }
      const list = Array.isArray(data) ? data : (data.products || [])
      // Client-side search/filter when using branch endpoint
      let filtered = list
      if (branchId && searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase()
        filtered = list.filter(p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.barcode || '').toLowerCase().includes(q)
        )
      }
      if (branchId && selectedDepartmentFilter && selectedDepartmentFilter !== 'all') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === selectedDepartmentFilter.toLowerCase())
      }
      setProducts(filtered.map(mapApiProductToDisplay))
      setTotalProducts(filtered.length)
      setTotalPages(1)
    } catch (err) {
      setProductsError(err.message || 'Could not load products')
      setProducts([])
      setTotalProducts(0)
      setTotalPages(1)
    } finally {
      setProductsLoading(false)
    }
  }

  const prevSearchRef = useRef(null)
  const prevDeptRef = useRef(null)
  useEffect(() => {
    const searchOrDeptChanged = prevSearchRef.current !== searchTerm || prevDeptRef.current !== selectedDepartmentFilter
    if (searchOrDeptChanged) {
      prevSearchRef.current = searchTerm
      prevDeptRef.current = selectedDepartmentFilter
      setCurrentPage(1)
      fetchProducts(1)
    } else {
      fetchProducts(currentPage)
    }
  }, [currentPage, searchTerm, selectedDepartmentFilter])

  // Products are already filtered and paginated by the API (page size 100)
  const startIndex = totalProducts === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = (currentPage - 1) * PAGE_SIZE + products.length

  const lowStockItems = products.filter(p => p.stock <= p.minStock)
  
  const expiredStockItems = products.filter(p => {
    if (!p.expiry) return false
    const expiryDate = new Date(p.expiry)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiryDate < today
  })

  const outOfStockItems = products.filter(p => (Number(p.stock) || 0) === 0)

  // Apply stock filter to get display products
  const displayProducts = (() => {
    switch (stockFilter) {
      case 'high_sale':
        // High sale items = lowest stock remaining (most sold)
        return [...products].sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      case 'low_sale':
        // Low sale items = highest stock remaining (least sold)
        return [...products].sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0))
      case 'out_of_stock':
        return outOfStockItems
      case 'expired':
        return expiredStockItems
      default:
        return products
    }
  })()

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await apiDeleteProduct(id)
      await fetchProducts()
    } catch (err) {
      alert(err.message || 'Could not delete product')
    }
  }

  // Get filtered products for export
  const getFilteredExportProducts = () => {
    let filtered = [...products]

    // Department filter
    if (exportDepartmentFilter && exportDepartmentFilter !== 'all') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase() === exportDepartmentFilter.toLowerCase())
    }

    // Sale filter
    if (exportSaleFilter === 'high') {
      // High sale: sort by stock ascending (most sold = lowest stock remaining)
      filtered = filtered.sort((a, b) => {
        const stockA = Number(a.quantity || a.stock) || 0
        const stockB = Number(b.quantity || b.stock) || 0
        return stockA - stockB
      })
    } else if (exportSaleFilter === 'low') {
      // Low sale: sort by stock descending (least sold = highest stock remaining)
      filtered = filtered.sort((a, b) => {
        const stockA = Number(a.quantity || a.stock) || 0
        const stockB = Number(b.quantity || b.stock) || 0
        return stockB - stockA
      })
    }

    return filtered
  }

  // Export to CSV
  const handleExportCSV = () => {
    const exportProducts = getFilteredExportProducts()

    if (exportProducts.length === 0) {
      alert('No products match the selected filters.')
      return
    }

    // CSV Headers
    const headers = ['Name', 'Brand', 'SKU', 'Barcode', 'Category', 'Price', 'Cost', 'Stock', 'Base Unit', 'Min Stock', 'Reorder Point', 'Expiry', 'Product Units']
    
    // Convert products to CSV rows
    const csvRows = [
      headers.join(','),
      ...exportProducts.map(product => {
        const units = product.product_units || product.productUnits || []
        const unitsStr = units.length > 0
          ? `"${units.map(u => `${u.unit_name || u.name}|${u.base_quantity}|${u.conversion_quantity}|${u.unit_price || u.price}|${u.cost_price || u.cost}`).join('; ')}"`
          : ''
        return [
          `"${(product.name || '').replace(/"/g, '""')}"`,
          `"${(product.brand || '').replace(/"/g, '""')}"`,
          product.sku || '',
          product.barcode || '',
          product.category || '',
          (Number(product.selling_price || product.price) || 0).toFixed(2),
          (Number(product.cost_price || product.cost) || 0).toFixed(2),
          Number(product.quantity || product.stock) || 0,
          product.base_unit || 'piece',
          Number(product.min_stock_quantity || product.minStock) || 0,
          Number(product.reorder_quantity || product.reorderPoint) || 0,
          product.expiry_date || product.expiry || '',
          unitsStr,
        ].join(',')
      })
    ]
    
    // Build filename suffix
    const deptSuffix = exportDepartmentFilter !== 'all' ? `_${exportDepartmentFilter}` : ''
    const saleSuffix = exportSaleFilter !== 'all' ? `_${exportSaleFilter}_sale` : ''
    
    // Create CSV content
    const csvContent = csvRows.join('\n')
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory_export${deptSuffix}${saleSuffix}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setShowExportModal(false)
    setExportDepartmentFilter('all')
    setExportSaleFilter('all')
  }

  // Download a blank CSV template for bulk import
  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Brand', 'SKU', 'Barcode', 'Category', 'Price', 'Cost', 'Stock', 'Base Unit', 'Min Stock', 'Reorder Point', 'Expiry', 'Product Units']
    const sampleRow = [
      'Milk Powder',
      'Ghana Loyal',
      '123456789',
      '65t8790ou',
      'Food',
      '15',
      '10',
      '100',
      'Box',
      '0',
      '0',
      '',
      '"Sachet|12|12|40|25; Gallon|4|4|20|15"',
    ]
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'product_import_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Normalize row keys from Excel/CSV (allow various header names)
  const normalizeRow = (row) => {
    const get = (...keys) => {
      for (const k of keys) {
        const s = String(k)
        const v = row[k] ?? row[s.toLowerCase()] ?? row[s.replace(/\s+/g, '')]
        if (v !== undefined && v !== null && v !== '') return String(v).trim()
      }
      return ''
    }
    // Parse product_units from a pipe/semicolon delimited string
    // Format: "unit_name|base_qty|conv_qty|unit_price|cost_price; unit_name2|..."
    const rawUnits = get('product_units', 'productunits', 'units', 'product units')
    let product_units = []
    if (rawUnits) {
      try {
        // Try JSON first
        product_units = JSON.parse(rawUnits)
      } catch {
        // Fallback: semicolon-separated groups of pipe-separated values
        product_units = rawUnits.split(';').map(u => u.trim()).filter(Boolean).map(u => {
          const [unit_name, base_quantity, conversion_quantity, unit_price, cost_price] = u.split('|').map(v => v.trim())
          return {
            unit_name: unit_name || '',
            base_quantity: parseFloat(base_quantity) || 1,
            conversion_quantity: parseFloat(conversion_quantity) || 1,
            unit_price: parseFloat(unit_price) || 0,
            cost_price: parseFloat(cost_price) || 0,
          }
        }).filter(u => u.unit_name)
      }
    }

    return {
      name: get('name', 'Name', 'productname', 'product name'),
      sku: get('sku', 'SKU', 'code', 'productcode'),
      barcode: get('barcode', 'Barcode'),
      category: get('category', 'Category', 'department'),
      price: get('price', 'Price', 'sellingprice', 'selling_price'),
      cost: get('cost', 'Cost', 'costprice', 'cost_price'),
      stock: get('stock', 'Stock', 'quantity'),
      minstock: get('minstock', 'Min Stock', 'min_stock', 'minimumstock'),
      reorderpoint: get('reorderpoint', 'Reorder Point', 'reorder_quantity'),
      expiry: get('expiry', 'Expiry', 'expirydate', 'expiry_date'),
      brand: get('brand', 'Brand'),
      base_unit: get('base_unit', 'base unit', 'baseunit') || 'piece',
      product_units,
    }
  }

  // Parse Excel file (xlsx, xls)
  const parseExcel = (arrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false })
    const data = []
    const errors = []
    json.forEach((row, index) => {
      const normalized = normalizeRow(row)
      if (!normalized.name && !normalized.sku) return
      data.push({ row: normalized, lineNumber: index + 2 })
    })
    return { data, errors }
  }

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const data = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = []
      let currentValue = ''
      let inQuotes = false
      
      // Parse CSV line handling quoted values
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim())
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`)
        continue
      }
      
      const row = {}
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '')
        row[key] = values[index].replace(/^"|"$/g, '')
        row[header] = row[key]
      })
      const normalized = normalizeRow(row)
      data.push({ row: normalized, lineNumber: i + 1 })
    }
    
    return { data, errors }
  }

  const buildImportPreview = (data, parseErrors) => {
    const preview = []
    const validationErrors = []
    data.forEach(({ row, lineNumber }) => {
      const errs = []
      if (!row.name) errs.push('Name is required')
      if (!row.sku) errs.push('SKU is required')
      if (!row.barcode) errs.push('Barcode is required')
      if (!row.category) errs.push('Category is required')
      if (row.price && isNaN(parseFloat(row.price))) errs.push('Price must be a number')
      if (row.cost && isNaN(parseFloat(row.cost))) errs.push('Cost must be a number')
      if (row.stock && isNaN(parseInt(row.stock))) errs.push('Stock must be a number')
      if (row.minstock && isNaN(parseInt(row.minstock))) errs.push('Min Stock must be a number')
      if (errs.length > 0) validationErrors.push(`Row ${lineNumber}: ${errs.join(', ')}`)
      preview.push({ ...row, lineNumber, errors: errs.length > 0 })
    })
    setImportPreview(preview)
    setImportErrors([...(parseErrors || []), ...validationErrors])
    setShowImportModal(true)
  }

  // Handle CSV or Excel file import
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const isExcel = /\.(xlsx|xls)$/i.test(file.name)
    const isCsv = file.name.toLowerCase().endsWith('.csv')
    if (!isExcel && !isCsv) {
      alert('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
      return
    }
    setImportFileType(isExcel ? 'excel' : 'csv')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (isExcel) {
          const { data, errors } = parseExcel(e.target.result)
          if (data.length === 0) {
            alert('No rows found in the Excel sheet')
            return
          }
          buildImportPreview(data, errors)
        } else {
          const text = e.target.result
          const { data, errors } = parseCSV(text)
          buildImportPreview(data, errors)
        }
      } catch (error) {
        alert(`Error reading file: ${error.message}`)
      }
    }
    if (isExcel) reader.readAsArrayBuffer(file)
    else reader.readAsText(file)
    event.target.value = ''
  }

  // Confirm import – send valid rows to bulk API
  const handleConfirmImport = async () => {
    const validRows = importPreview.filter(p => !p.errors)
    if (validRows.length === 0) {
      alert('No valid rows to import')
      return
    }

    const activeBranch = getActiveBranch()
    const branchId = activeBranch?.uuid || activeBranch?.id || ''
    const organizationId = user?.organization_id || user?.organizationId || ''

    if (!branchId || !organizationId) {
      alert('Please select an active branch before importing products.')
      return
    }

    const products = validRows.map(row => ({
      name: (row.name || '').trim() || 'Untitled',
      brand: (row.brand || '').trim() || '-',
      category: (row.category || '').trim() || '-',
      sku: (row.sku || '').trim() || '',
      barcode: (row.barcode || '').trim() || '-',
      cost_price: parseFloat(row.cost) || 0,
      selling_price: parseFloat(row.price) || 0,
      quantity: parseInt(row.stock) || 0,
      base_unit: (row.base_unit || '').trim() || 'piece',
      expiry_date: row.expiry?.trim() || null,
      min_stock_quantity: parseInt(row.minstock) || 0,
      reorder_quantity: parseInt(row.reorderpoint || row.minstock) || 0,
      product_units: Array.isArray(row.product_units) ? row.product_units.map(u => ({
        unit_name: (u.unit_name || '').trim(),
        base_quantity: parseFloat(u.base_quantity) || 1,
        conversion_quantity: parseFloat(u.conversion_quantity) || 1,
        unit_price: parseFloat(u.unit_price) || 0,
        cost_price: parseFloat(u.cost_price) || 0,
      })) : [],
    }))

    setImportLoading(true)
    try {
      const data = await bulkImportProducts({ branchId, organizationId, products })
      await fetchProducts()
      setShowImportModal(false)
      setImportPreview([])
      setImportErrors([])
      setImportFileType(null)
      const failed = data.failed ?? 0
      const created = data.created ?? products.length ?? 0
      if (failed > 0) {
        alert(`Imported ${created} product(s). ${failed} row(s) failed (e.g. duplicate SKU). Check the list.`)
      } else {
        alert(`Successfully imported ${products.length} product(s).`)
      }
    } catch (err) {
      alert(err.message || 'Could not import products')
    } finally {
      setImportLoading(false)
    }
  }

  // Trigger file input
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  // Handle add/edit product
  const handleSaveProduct = async (productData) => {
    const activeBranch = getActiveBranch()
    const branchId = activeBranch?.uuid || activeBranch?.id || ''
    const organizationId = user?.organization_id || user?.organization?.id || activeBranch?.organization_id || ''

    // Build product_units from the form's units array
    const productUnits = Array.isArray(productData.units) && productData.units.length > 0
      ? productData.units
          .filter(u => u.unit && u.unit !== productData.baseUnit) // exclude the base unit
          .map(u => ({
            unit_name: u.unit,
            base_quantity: parseFloat(u.conversion) || 1,
            conversion_quantity: parseFloat(u.conversion) || 1,
            unit_price: parseFloat(u.price) || 0,
            cost_price: parseFloat(u.cost) || 0,
          }))
      : []

    const payload = {
      name: (productData.name || '').trim() || 'Untitled',
      brand: (productData.brand || '').trim() || '-',
      category: (productData.category || '').trim() || '-',
      sku: (productData.sku || '').trim() || '',
      barcode: (productData.barcode || '').trim() || '-',
      cost_price: parseFloat(productData.cost) || 0,
      selling_price: parseFloat(productData.price) || 0,
      quantity: parseFloat(productData.stock) || 0,
      base_unit: productData.baseUnit || 'piece',
      expiry_date: (productData.expiry || '').trim() || null,
      min_stock_quantity: parseFloat(productData.minStock) || 0,
      reorder_quantity: parseFloat(productData.reorderPoint) || 0,
      product_units: productUnits,
      branchId: branchId,
      organizationId: organizationId,
    }

    try {
      if (editingProduct) {
        const productId = editingProduct.uuid || editingProduct.id
        await updateProduct(productId, payload)
        setSuccessProduct({ ...payload, id: productId, action: 'updated' })
      } else {
        const res = await createProduct(payload)
        const created = res?.data || res
        setSuccessProduct({ ...created, action: 'added' })
      }
      await fetchProducts()
      setShowAddModal(false)
      setEditingProduct(null)
      setShowSuccessModal(true)
    } catch (err) {
      alert(err.message || 'Could not save product')
    }
  }

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditingProduct(product)
    setShowAddModal(true)
  }

  // Close modal and reset
  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingProduct(null)
  }

  // Purchase orders: load from API when list modal opens
  const fetchPurchaseOrders = async () => {
    setPurchaseOrdersLoading(true)
    try {
      const branchId = getSessionBranchId()
      const res = await listReceipts(branchId)
      const data = res?.data || res
      setPurchaseOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setPurchaseOrders([])
    } finally {
      setPurchaseOrdersLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const branchId = getSessionBranchId()
      if (!branchId) { setSuppliers([]); return }
      const data = await listSuppliers(branchId)
      setSuppliers(Array.isArray(data) ? data : (data?.data || []))
    } catch (_) {
      setSuppliers([])
    }
  }

  useEffect(() => {
    if (showPurchaseOrderModal) fetchSuppliers()
  }, [showPurchaseOrderModal])
  useEffect(() => {
    if (showPurchaseOrderList) fetchPurchaseOrders()
  }, [showPurchaseOrderList])

  const createPurchaseOrder = async (orderData) => {
    const supplierId = orderData.supplier_id
    const items = orderData.items || []
    const paymentType = orderData.payment_type === 'credit' ? 'credit' : 'full_payment'
    if (!supplierId || items.length === 0) {
      alert('Please select a supplier and add at least one item')
      return
    }
    try {
      const payload = {
        supplier_id: supplierId,
        payment_type: paymentType,
        branchId: getSessionBranchId(),
        organizationId: getSessionOrgId(),
        items: items.map(item => ({
          product_id: item.productId,
          quantity: Number(item.quantity),
          unit_cost: parseFloat(item.unitCost) || 0,
        }))
      }
      await createReceipt(payload)
      setShowPurchaseOrderModal(false)
      setSelectedPurchaseOrder(null)
      fetchPurchaseOrders()
      alert('Purchase order saved. Receive it from the list when stock arrives.')
    } catch (err) {
      alert(err.message || 'Could not save purchase order')
    }
  }

  const receivePurchaseOrder = async (poId) => {
    try {
      await receiveReceipt({ id: poId, branchId: getSessionBranchId(), organizationId: getSessionOrgId() })
      fetchPurchaseOrders()
      fetchProducts()
      alert('Purchase order received. Stock and supplier balance updated.')
    } catch (err) {
      alert(err.message || 'Could not receive order')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500 text-white">
                <Package size={18} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Inventory</h1>
                <p className="text-gray-500 text-xs">Manage your products and stock levels</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPurchaseOrderList(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                title="View and receive purchase orders"
              >
                <FileText size={16} className="text-primary-500" />
                Purchase Orders
              </button>
              <button
                onClick={handleImportClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                title="Upload CSV or Excel to add products in bulk"
              >
                <Upload size={16} className="text-primary-500" />
                Import
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                title="Download a blank CSV template for bulk import"
              >
                <Download size={16} className="text-gray-400" />
                Template
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Download size={16} className="text-primary-500" />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Package className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Stock Value</p>
                <p className="text-2xl font-bold text-primary-500 mt-1">
                  ₵{products.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.cost) || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <TrendingUp className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{lowStockItems.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <AlertTriangle className="text-primary-500" size={20} />
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-gray-200 p-4" style={{ backgroundColor: '#FF7521' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Expired</p>
                <p className="text-2xl font-bold text-white mt-1">{expiredStockItems.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-amber-900 text-sm">
                  {lowStockItems.length} product(s) running low on stock
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Consider restocking: {lowStockItems.slice(0, 5).map(p => p.name).join(', ')}
                  {lowStockItems.length > 5 && ` and ${lowStockItems.length - 5} more`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-gray-900 bg-white appearance-none text-sm"
              >
                <option value="all">All departments</option>
                {loadDepartments().map((dept) => {
                  const productCount = products.filter(p => p.category === dept.name).length
                  return (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({productCount})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Stock Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-500 mr-1">
              <Filter size={14} />
              <span className="text-xs font-medium">Quick Filters:</span>
            </div>
            <button
              onClick={() => setStockFilter('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                stockFilter === 'all'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Items
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                stockFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{products.length}</span>
            </button>
            <button
              onClick={() => setStockFilter('high_sale')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                stockFilter === 'high_sale'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              High Sale
            </button>
            <button
              onClick={() => setStockFilter('low_sale')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                stockFilter === 'low_sale'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              Low Sale
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Out of Stock
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                stockFilter === 'out_of_stock' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
              }`}>{outOfStockItems.length}</span>
            </button>
            <button
              onClick={() => setStockFilter('expired')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                stockFilter === 'expired'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Expired
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                stockFilter === 'expired' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'
              }`}>{expiredStockItems.length}</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {productsError && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {productsError}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Department</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Stock</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Min Stock</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Reorder</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Cost</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Profit</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Value</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsLoading ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading products...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayProducts.length > 0 ? (
                  displayProducts.map((product, idx) => {
                    const isLowStock = product.stock <= product.minStock
                    const reorderPoint = product.reorderPoint || product.minStock
                    const needsReplenishment = product.stock <= reorderPoint
                    const sellingPrice = Number(product.price) || 0
                    const costPrice = Number(product.cost) || 0
                    const profit = sellingPrice - costPrice
                    return (
                      <tr key={product.id} className={`hover:bg-primary-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                              <Package size={14} className="text-primary-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                              {product.barcode && product.barcode !== '-' && (
                                <p className="text-xs text-gray-400 truncate">{product.barcode}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{product.sku || '—'}</td>
                        <td className="py-3 px-4">
                          {product.category && product.category !== '-' ? (
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold text-sm ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                          {isLowStock && (
                            <span className="ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">LOW</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 text-sm">{Number(product.minStock) || 0}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-sm ${needsReplenishment ? 'text-primary-600 font-semibold' : 'text-gray-500'}`}>
                            {reorderPoint}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 text-sm">₵{sellingPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-gray-500 text-sm">₵{costPrice.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-semibold text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₵{profit.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-primary-600 text-sm">
                          ₵{((Number(product.stock) || 0) * costPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="p-1.5 rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.uuid || product.id)}
                              className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Package size={40} />
                        <p className="text-sm font-medium text-gray-500">No products found</p>
                        <p className="text-xs text-gray-400">Try adjusting your search or add a new product.</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          <Plus size={16} />
                          Add Product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {displayProducts.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{displayProducts.length}</span> of <span className="font-medium text-gray-900">{totalProducts}</span>{stockFilter !== 'all' && <span className="text-primary-500 font-medium"> · {stockFilter === 'high_sale' ? 'High Sale' : stockFilter === 'low_sale' ? 'Low Sale' : stockFilter === 'out_of_stock' ? 'Out of Stock' : 'Expired'}</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 text-gray-400">…</span>
                  }
                  return null
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="bg-gray-900 rounded-t-xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Download size={18} className="text-primary-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Export Products</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Filter before exporting to CSV</p>
                </div>
              </div>
              <button
                onClick={() => { setShowExportModal(false); setExportDepartmentFilter('all'); setExportSaleFilter('all') }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Department Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <div className="relative">
                  <select
                    value={exportDepartmentFilter}
                    onChange={(e) => setExportDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Departments</option>
                    {getDepartments().map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sale Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by Sales</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setExportSaleFilter('all')}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      exportSaleFilter === 'all'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Package size={18} className={exportSaleFilter === 'all' ? 'text-primary-500' : 'text-gray-400'} />
                    <span>All Items</span>
                  </button>
                  <button
                    onClick={() => setExportSaleFilter('high')}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      exportSaleFilter === 'high'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp size={18} className={exportSaleFilter === 'high' ? 'text-primary-500' : 'text-gray-400'} />
                    <span>High Sale</span>
                  </button>
                  <button
                    onClick={() => setExportSaleFilter('low')}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      exportSaleFilter === 'low'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingDown size={18} className={exportSaleFilter === 'low' ? 'text-primary-500' : 'text-gray-400'} />
                    <span>Low Sale</span>
                  </button>
                </div>
              </div>

              {/* Preview Count */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Products to export</span>
                <span className="text-sm font-bold text-gray-900">{getFilteredExportProducts().length} items</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowExportModal(false); setExportDepartmentFilter('all'); setExportSaleFilter('all') }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV / Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Bulk Import Preview</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {importFileType === 'excel' ? 'Excel' : 'CSV'} file · {importPreview.filter(p => !p.errors).length} valid row(s)
                </p>
              </div>
              <button
                onClick={() => {
                  if (!importLoading) {
                    setShowImportModal(false)
                    setImportPreview([])
                    setImportErrors([])
                    setImportFileType(null)
                  }
                }}
                disabled={importLoading}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Errors */}
            {importErrors.length > 0 && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-100">
                <h3 className="font-semibold text-red-800 text-sm mb-1">Errors Found:</h3>
                <div className="max-h-28 overflow-auto">
                  {importErrors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Product Units format tip */}
            <div className="px-6 py-2 bg-primary-50 border-b border-primary-100">
              <p className="text-xs text-primary-800">
                <span className="font-semibold">Product Units format:</span>{' '}
                <code className="bg-primary-100 px-1 rounded text-[11px]">unit_name|base_qty|conv_qty|unit_price|cost_price</code>
                {' '}— separate multiple units with <code className="bg-primary-100 px-1 rounded text-[11px]">;</code>
              </p>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="text-left py-2 px-3 font-semibold text-xs">Row</th>
                      <th className="text-left py-2 px-3 font-semibold text-xs">Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-xs">Brand</th>
                      <th className="text-left py-2 px-3 font-semibold text-xs">SKU</th>
                      <th className="text-left py-2 px-3 font-semibold text-xs">Barcode</th>
                      <th className="text-left py-2 px-3 font-semibold text-xs">Category</th>
                      <th className="text-left py-2 px-3 font-semibold text-xs">Base Unit</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs">Price</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs">Cost</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs">Stock</th>
                      <th className="text-right py-2 px-3 font-semibold text-xs">Min Stock</th>
                      <th className="text-center py-2 px-3 font-semibold text-xs">Units</th>
                      <th className="text-center py-2 px-3 font-semibold text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-b ${row.errors ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="py-2 px-3 text-gray-600">{row.lineNumber}</td>
                        <td className="py-2 px-3 font-medium">{row.name || '-'}</td>
                        <td className="py-2 px-3">{row.brand || '-'}</td>
                        <td className="py-2 px-3">{row.sku || '-'}</td>
                        <td className="py-2 px-3">{row.barcode || '-'}</td>
                        <td className="py-2 px-3">{row.category || '-'}</td>
                        <td className="py-2 px-3">{row.base_unit || 'piece'}</td>
                        <td className="py-2 px-3 text-right">₵{parseFloat(row.price || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">₵{parseFloat(row.cost || 0).toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">{row.stock || 0}</td>
                        <td className="py-2 px-3 text-right">{row.minstock || 0}</td>
                        <td className="py-2 px-3 text-center">
                          {row.product_units?.length > 0 ? (
                            <span className="text-xs text-primary-600 font-medium" title={row.product_units.map(u => u.unit_name).join(', ')}>
                              {row.product_units.length} unit(s)
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.errors ? (
                            <span className="text-red-600 text-xs font-semibold">Error</span>
                          ) : (
                            <span className="text-green-600 text-xs font-semibold">Valid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportPreview([])
                  setImportErrors([])
                  setImportFileType(null)
                }}
                disabled={importLoading}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importLoading || importPreview.filter(p => !p.errors).length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {importLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing…
                  </>
                ) : (
                  `Import ${importPreview.filter(p => !p.errors).length} product(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <AddProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={handleCloseModal}
          departments={getDepartments()}
        />
      )}


      {/* Success Modal */}
      {showSuccessModal && successProduct && (
        <ProductSuccessModal
          product={successProduct}
          onClose={() => {
            setShowSuccessModal(false)
            setSuccessProduct(null)
          }}
        />
      )}

      {/* Purchase Order Modal */}
      {showPurchaseOrderModal && (
        <PurchaseOrderModal
          products={products}
          suppliers={suppliers}
          initialItems={selectedPurchaseOrder?.items || []}
          onSave={createPurchaseOrder}
          onClose={() => {
            setShowPurchaseOrderModal(false)
            setSelectedPurchaseOrder(null)
          }}
        />
      )}

      {/* Purchase Order List Modal */}
      {showPurchaseOrderList && (
        <PurchaseOrderListModal
          purchaseOrders={purchaseOrders}
          loading={purchaseOrdersLoading}
          onSelectPo={(po) => {
            setShowPurchaseOrderList(false)
            navigate(`/purchase-orders/${po.id}`)
          }}
          onClose={() => setShowPurchaseOrderList(false)}
          onCreateNew={() => {
            setShowPurchaseOrderList(false)
            setShowPurchaseOrderModal(true)
          }}
        />
      )}

    </div>
  )
}

// Add/Edit Product Modal Component
const AddProductModal = ({ product, onSave, onClose, departments = [] }) => {
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

  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    category: product?.category || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    reorderPoint: product?.reorderPoint || product?.minStock || 0,
    expiry: product?.expiry || '',
    baseUnit: product?.baseUnit || 'piece',
    units: product?.units || [{ unit: 'piece', conversion: 1, price: product?.price || 0, cost: product?.cost || 0 }]
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  // Fetch product from API if productId is provided
  useEffect(() => {
    const fetchProductFromAPI = async (productId) => {
      setLoading(true)
      setFetchError(null)
      
      try {
        const data = await getProduct(productId)
        
        // Map API response to form data structure
        setFormData({
          name: data.name || data.productName || '',
          sku: data.sku || data.productCode || '',
          barcode: data.barcode || data.barcodeNumber || '',
          category: data.category || data.department || '',
          price: parseFloat(data.selling_price ?? data.price ?? data.sellingPrice ?? 0),
          cost: parseFloat(data.cost_price ?? data.cost ?? data.costPrice ?? 0),
          stock: parseInt(data.quantity ?? data.stock ?? 0),
          minStock: parseInt(data.min_stock_quantity ?? data.minStock ?? data.minimumStock ?? 0),
          reorderPoint: parseInt(data.reorder_quantity ?? data.reorderPoint ?? data.reorderLevel ?? data.minStock ?? 0),
          expiry: data.expiry_date ?? data.expiry ?? data.expiryDate ?? '',
          baseUnit: data.base_unit ?? data.baseUnit ?? data.unit ?? 'piece',
          units: data.units || [{ unit: data.base_unit || data.baseUnit || 'piece', conversion: 1, price: parseFloat(data.selling_price ?? data.price ?? 0), cost: parseFloat(data.cost_price ?? data.cost ?? 0) }]
        })
        
      } catch (error) {
        console.error('Error fetching product:', error)
        setFetchError(`Failed to load product: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    // Check if we have a product ID to fetch (from URL or product prop)
    const productId = product?.id || product?.productId
    
    if (productId && typeof productId === 'string' && productId.includes('-')) {
      // Looks like a UUID, fetch from API
      fetchProductFromAPI(productId)
    }
  }, [product])

  // Use departments if provided, otherwise fallback to default categories
  const categories = departments.length > 0 
    ? departments.map(d => d.name).concat(['Other'])
    : [
        'Beverages',
        'Bakery',
        'Dairy',
        'Grains',
        'Cooking',
        'Baking',
        'Fruits',
        'Vegetables',
        'Meat',
        'Snacks',
        'Electronics',
        'Home',
        'Other'
      ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barcode is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative'
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    if (formData.minStock < 0) {
      newErrors.minStock = 'Min Stock cannot be negative'
    }

    if (formData.reorderPoint < 0) {
      newErrors.reorderPoint = 'Reorder Point cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Validate units
    if (formData.units.length === 0) {
      alert('Please add at least one unit of measure')
      return
    }

    // Ensure base unit is in units array
        const baseUnitExists = formData.units.some(u => u.unit === formData.baseUnit)
    if (!baseUnitExists) {
      // Add base unit if not present
      const baseUnitPrice = formData.units[0]?.price || formData.price
      const baseUnitCost = formData.units[0]?.cost ?? formData.cost ?? 0
      formData.units.unshift({
        unit: formData.baseUnit,
        conversion: 1,
        price: baseUnitPrice,
        cost: baseUnitCost
      })
    }

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      reorderPoint: parseInt(formData.reorderPoint) || parseInt(formData.minStock),
      expiry: formData.expiry || null,
      baseUnit: formData.baseUnit,
      units: formData.units.map(u => ({
        unit: u.unit,
        conversion: parseFloat(u.conversion) || 1,
        price: parseFloat(u.price) || 0,
        cost: parseFloat(u.cost) || 0
      }))
    })
  }

  // Add new unit
  const handleAddUnit = () => {
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, { unit: 'piece', conversion: 1, price: prev.price, cost: prev.cost || 0 }]
    }))
  }

  // Remove unit
  const handleRemoveUnit = (index) => {
    if (formData.units.length <= 1) {
      alert('At least one unit is required')
      return
    }
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }))
  }

  // Update unit
  const handleUpdateUnit = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === index ? { ...unit, [field]: value } : unit
      )
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              {product ? <Edit size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {product ? 'Update product information' : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
              <p className="text-sm text-primary-700 font-medium">Loading product data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {fetchError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-500 mt-0.5" size={16} />
              <div>
                <p className="text-sm text-red-800 font-medium">Error loading product</p>
                <p className="text-xs text-red-600 mt-0.5">{fetchError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Coca Cola 500ml"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., CC-500"
              />
              {errors.sku && (
                <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
              )}
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.barcode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 1234567890"
              />
              {errors.barcode && (
                <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Coca Cola"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selling Price (₵) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost Price (₵)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.cost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
              )}
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleChange('minStock', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.minStock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.minStock && (
                <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>
              )}
            </div>

            {/* Reorder Point */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reorder Point
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderPoint}
                onChange={(e) => handleChange('reorderPoint', e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.reorderPoint ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.reorderPoint && (
                <p className="text-red-500 text-xs mt-1">{errors.reorderPoint}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Stock level at which to create a purchase order</p>
            </div>

            {/* Expiry Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiry}
                onChange={(e) => handleChange('expiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if product doesn't expire</p>
            </div>

            {/* Base Unit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base Unit
              </label>
              <select
                value={formData.baseUnit}
                onChange={(e) => handleChange('baseUnit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {UNITS_OF_MEASURE.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label} ({unit.abbreviation})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Primary unit for this product</p>
            </div>

            {/* Units of Measure Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Units of Measure
                </label>
                <button
                  type="button"
                  onClick={handleAddUnit}
                  className="text-sm bg-primary-50 text-primary-600 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-1 font-medium"
                >
                  <Plus size={16} />
                  Add Unit
                </button>
              </div>
              
              <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {formData.units.map((unit, index) => {
                  const unitInfo = UNITS_OF_MEASURE.find(u => u.value === unit.unit)
                  const isBaseUnit = unit.unit === formData.baseUnit
                  
                  return (
                    <div key={index} className="bg-white p-4 rounded border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Unit Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Unit
                            </label>
                            <select
                              value={unit.unit}
                              onChange={(e) => handleUpdateUnit(index, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {UNITS_OF_MEASURE.map(u => (
                                <option key={u.value} value={u.value}>
                                  {u.label} ({u.abbreviation})
                                </option>
                              ))}
                            </select>
                            {isBaseUnit && (
                              <span className="text-xs text-primary-500 font-medium mt-1 block">Base Unit</span>
                            )}
                          </div>

                          {/* Conversion Factor */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Conversion Factor
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={unit.conversion}
                              onChange={(e) => handleUpdateUnit(index, 'conversion', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="1.00"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {unit.conversion > 1 
                                ? `1 ${unitInfo?.abbreviation || unit.unit} = ${unit.conversion} ${formData.baseUnit}`
                                : `1 ${formData.baseUnit} = ${(1 / (unit.conversion || 1)).toFixed(2)} ${unitInfo?.abbreviation || unit.unit}`
                              }
                            </p>
                          </div>

                          {/* Unit Price */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Selling Price (₵)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={unit.price}
                              onChange={(e) => handleUpdateUnit(index, 'price', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Unit Cost Price */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cost Price (₵)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={unit.cost ?? ''}
                              onChange={(e) => handleUpdateUnit(index, 'cost', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        {formData.units.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnit(index)}
                            className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove unit"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Define different units customers can purchase this product in (e.g., piece, pack, box)
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
          >
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Product Success Modal Component
const ProductSuccessModal = ({ product, onClose }) => {
  if (!product) return null
  const price = Number(product.price) || 0
  const cost = Number(product.cost) || 0
  const stock = Number(product.stock) || 0
  const minStock = Number(product.minStock) || 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-6">
          <div className="flex flex-col items-center">
            <div className="bg-primary-500 rounded-full p-3 mb-3">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Product {product.action === 'added' ? 'Added' : 'Updated'}!
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {product.action === 'added' 
                ? 'Added to inventory successfully' 
                : 'Product information updated'}
            </p>
          </div>
        </div>

        {/* Product Details */}
        <div className="px-6 py-5">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-500 text-sm">Product Name</span>
              <span className="text-gray-900 font-semibold text-sm">{product.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">SKU</span>
              <span className="text-gray-900 font-medium text-sm">{product.sku}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Barcode</span>
              <span className="text-gray-900 font-medium text-sm">{product.barcode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Category</span>
              <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">{product.category}</span>
            </div>
            {product.baseUnit && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Base Unit</span>
                <span className="text-gray-900 font-medium text-sm">{product.baseUnit}</span>
              </div>
            )}
            {product.units && product.units.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Available Units</span>
                <span className="text-primary-500 font-semibold text-sm">{product.units.length}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Stock</span>
                <span className={`font-semibold text-sm ${stock <= minStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {stock}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Min Stock</span>
                <span className="text-gray-900 font-medium text-sm">{minStock}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Selling Price</span>
                <span className="text-gray-900 font-semibold text-sm">₵{price.toFixed(2)}</span>
              </div>
              {cost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Cost Price</span>
                  <span className="text-gray-700 text-sm">₵{cost.toFixed(2)}</span>
                </div>
              )}
              {cost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Profit Margin</span>
                  <span className="text-primary-500 font-bold text-sm">
                    {(((price - cost) / cost) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Stock Value</span>
                <span className="text-lg font-bold text-primary-500">
                  ₵{(stock * cost).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm"
          >
            <Check size={16} />
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// Purchase Order Modal Component (saves as pending; receive from list when stock arrives)
const PurchaseOrderModal = ({ products, suppliers = [], initialItems = [], onSave, onClose }) => {
  const [supplierId, setSupplierId] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false)
  const [paymentType, setPaymentType] = useState('full_payment') // 'full_payment' | 'credit'
  const [items, setItems] = useState(initialItems.length > 0 ? initialItems : [])
  const [openProductIndex, setOpenProductIndex] = useState(null)
  const [productSearchTerm, setProductSearchTerm] = useState('')

  const selectedSupplier = suppliers.find(s => (s.uuid || s.id) === supplierId)
  const debtOwing = selectedSupplier ? (Number(selectedSupplier.debt_owing) || 0) : 0

  const filteredProductsForPO = (searchTerm, limit = 12) =>
    products
      .filter(p => {
        if (!(searchTerm || '').trim()) return true
        const term = (searchTerm || '').toLowerCase().trim()
        return (p.name || '').toLowerCase().includes(term) ||
          (p.sku || '').toLowerCase().includes(term) ||
          (p.barcode || '').includes(term) ||
          (p.category || '').toLowerCase().includes(term)
      })
      .slice(0, limit)

  const filteredSuppliers = suppliers.filter(s => {
    if (!supplierSearch.trim()) return true
    const term = supplierSearch.toLowerCase().trim()
    return (s.name || '').toLowerCase().includes(term) ||
      (s.phone1 || '').includes(supplierSearch) ||
      (s.phone2 || '').includes(supplierSearch) ||
      (s.email || '').toLowerCase().includes(term) ||
      (s.location || '').toLowerCase().includes(term)
  }).slice(0, 15)

  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      sku: '',
      quantity: 1,
      unitCost: 0
    }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        if (field === 'productId') {
          const product = products.find(p => (p.uuid || p.id) === value || p.id === parseInt(value))
          return {
            ...item,
            productId: product?.uuid || value,
            productName: product?.name || '',
            sku: product?.sku || '',
            unitCost: product?.cost || 0
          }
        }
        return { ...item, [field]: value }
      }
      return item
    })
    setItems(updatedItems)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!supplierId) {
      alert('Please select a supplier')
      return
    }
    if (items.length === 0) {
      alert('Please add at least one item to the purchase order')
      return
    }

    const validItems = items.filter(item => item.productId && item.quantity > 0).map(item => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      unitCost: parseFloat(item.unitCost) || 0
    }))
    if (validItems.length === 0) {
      alert('Please add valid items to the purchase order')
      return
    }

    onSave({ supplier_id: supplierId, payment_type: paymentType, items: validItems })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Purchase Order</h2>
              <p className="text-xs text-gray-500 mt-0.5">Select supplier and add items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={selectedSupplier ? selectedSupplier.name : supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value)
                      setSupplierId('')
                      setSupplierDropdownOpen(true)
                    }}
                    onFocus={() => setSupplierDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setSupplierDropdownOpen(false), 200)}
                    placeholder="Search supplier by name..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                {supplierDropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-52 overflow-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No supplier found</div>
                    ) : (
                      filteredSuppliers.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSupplierId(s.uuid || String(s.id))
                            setSupplierSearch('')
                            setSupplierDropdownOpen(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-900">{s.name}</span>
                          {(s.phone1 || s.phone2 || s.email) && (
                            <span className="block text-xs text-gray-500 mt-0.5">
                              {[s.phone1, s.phone2, s.email].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedSupplier && debtOwing > 0 && (
                  <p className="mt-1 text-sm text-amber-700">
                    Amount owing: ₵{debtOwing.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="full_payment">Full payment</option>
                  <option value="credit">Own credit</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                <button type="button" onClick={addItem} className="btn-primary flex items-center text-sm">
                  <Plus size={16} className="mr-2" />
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 relative">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            value={openProductIndex === index ? productSearchTerm : (item.productName || '')}
                            onChange={(e) => {
                              setOpenProductIndex(index)
                              setProductSearchTerm(e.target.value)
                            }}
                            onFocus={() => {
                              setOpenProductIndex(index)
                              setProductSearchTerm(item.productName || '')
                            }}
                            onBlur={() => {
                              setTimeout(() => setOpenProductIndex(null), 180)
                            }}
                            placeholder="Search product by name, SKU..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        {openProductIndex === index && (
                          <div
                            className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {filteredProductsForPO(productSearchTerm).length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500">No products match</div>
                            ) : (
                              filteredProductsForPO(productSearchTerm).map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    updateItem(index, 'productId', p.uuid || String(p.id))
                                    setOpenProductIndex(null)
                                    setProductSearchTerm('')
                                  }}
                                  className="w-full px-4 py-2.5 text-left hover:bg-primary-50 border-b border-gray-100 last:border-b-0 text-sm"
                                >
                                  <span className="font-medium text-gray-900">{p.name}</span>
                                  <span className="block text-xs text-gray-500 mt-0.5">
                                    {p.sku}{p.barcode ? ` · ${p.barcode}` : ''} · Stock: {p.stock}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit Cost (₵)</label>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    {item.productId && (
                      <div className="mt-2 text-xs text-gray-600">
                        Subtotal: ₵{(Number(item.quantity) * Number(item.unitCost)).toFixed(2)}
                      </div>
                    )}
                    <button type="button" onClick={() => removeItem(index)} className="mt-2 text-red-600 text-xs hover:text-red-800">
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-2 text-gray-400" />
                  <p>No items added. Click &quot;Add Item&quot; to start.</p>
                </div>
              )}

              {items.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₵{items.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.unitCost)), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 shrink-0">
            <button type="button" onClick={onClose} className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" className="bg-primary-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-600 text-sm">
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Purchase Order List Modal: click a PO to open its detail page
const PurchaseOrderListModal = ({ purchaseOrders, loading, onSelectPo, onClose, onCreateNew }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Purchase Orders</h2>
              <p className="text-xs text-gray-500 mt-0.5">Click an order to view details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onCreateNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
              <Plus size={14} />
              New Order
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading purchase orders…
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm mb-4">No purchase orders yet</p>
              <button onClick={onCreateNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600">
                Create First Order
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {purchaseOrders.map((po) => {
                const totalAmount = Number(po.totalAmount) || (Array.isArray(po.items) ? po.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0) : 0)
                const itemCount = (po.items || []).length
                const isPending = po.status === 'pending'
                return (
                  <button
                    key={po.id}
                    type="button"
                    onClick={() => onSelectPo(po)}
                    className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-primary-50/50 hover:border-primary-200 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm truncate">{po.poNumber || `PO-${po.id}`}</span>
                        {isPending ? (
                          <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock size={12} />
                            Pending
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Received
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {po.date ? new Date(po.date).toLocaleDateString() : (po.created_at ? new Date(po.created_at).toLocaleDateString() : '—')}
                        {' · '}
                        {po.supplier || po.supplier_name || '—'}
                        {' · '}
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="font-bold text-primary-500 text-sm">₵{totalAmount.toFixed(2)}</span>
                      <ChevronRight className="text-gray-300" size={18} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inventory

