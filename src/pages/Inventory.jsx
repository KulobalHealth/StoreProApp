import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSessionBranchId, getSessionOrgId, getActiveBranch as getActiveBranchUtil } from '../utils/branch'
import * as XLSX from 'xlsx'
import { HIcon } from '../components/HIcon'
import {
  Add01Icon,
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowMoveDownRightIcon,
  ArrowMoveUpRightIcon,
  ArrowRight01Icon,
  Building01Icon,
  Cancel01Icon,
  Cancel02Icon,
  CheckListIcon,
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete01Icon,
  Delete02Icon,
  Download01Icon,
  FileValidationIcon,
  FilterIcon,
  FolderOpenIcon,
  Loading03Icon,
  MinusSignIcon,
  Package01Icon,
  PencilEdit01Icon,
  QrCodeIcon,
  RotateLeft01Icon,
  SaveIcon,
  Search01Icon,
  ShoppingCart01Icon,
  Tick01Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons'
import Tooltip from '../components/Tooltip'
import {
  listProducts,
  listProductsByBranch,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
  bulkImportProducts,
} from '../api/awoselDb.js'

function mapApiProductToDisplay(p) {
  const baseUnit = (p.base_unit || p.baseUnit || 'piece').toLowerCase()
  const defaultPrice = p.selling_price ?? p.price ?? 0
  const defaultCost = p.cost_price ?? p.cost ?? 0
  const safeNum = (v, fallback) => { const n = Number(v); return Number.isFinite(n) ? n : fallback }
  const units = (p.units && p.units.length > 0)
    ? p.units.map(u => ({
        unit: (u.unit_name || u.unit || baseUnit).toLowerCase(),
        conversion: safeNum(u.conversion_quantity ?? u.base_quantity, 1),
        price: safeNum(u.unit_price ?? u.price, defaultPrice),
        cost: safeNum(u.cost_price ?? u.cost, defaultCost)
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

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const allProductsCache = useRef([]) // Cache all products to avoid refetching on search
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])
  const [importFileType, setImportFileType] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successProduct, setSuccessProduct] = useState(null)
  const [productSaving, setProductSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const PAGE_SIZE = 100
  const TABLE_PAGE_SIZE = 10
  const [tablePage, setTablePage] = useState(1)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [alertQueue, setAlertQueue] = useState([])
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

  // Toast alert helper
  const showAlert = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setAlertQueue(prev => [...prev, { id, message, type }])
    const duration = type === 'success' ? 4000 : type === 'error' ? 6000 : 3500
    setTimeout(() => setAlertQueue(prev => prev.filter(a => a.id !== id)), duration)
  }
  
  // Debounce search term - wait 300ms after user stops typing before triggering search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Get departments for filter dropdown
  const getDepartments = () => loadDepartments()

  // Fetch all products from API (only re-fetches when branch changes or manual refresh)
  const fetchProducts = useCallback(async (page) => {
    const pageToFetch = page !== undefined && page !== null ? page : currentPage
    setProductsLoading(true)
    setProductsError(null)
    try {
      const activeBranch = getActiveBranch()
      const branchId = activeBranch?.uuid || activeBranch?.id
      let data
      if (branchId) {
        // Use branch-specific endpoint - fetch ALL products once
        const res = await listProductsByBranch(branchId)
        data = res?.data || res
      } else {
        // Fallback to generic products list with server-side search
        const query = { page: pageToFetch, limit: PAGE_SIZE }
        if (debouncedSearchTerm.trim()) query.search = debouncedSearchTerm.trim()
        if (selectedDepartmentFilter && selectedDepartmentFilter !== 'all') query.category = selectedDepartmentFilter
        data = await listProducts(query)
      }
      const list = Array.isArray(data) ? data : (data.products || [])
      // Cache the full product list (mapped) for fast client-side filtering
      const mapped = list.map(mapApiProductToDisplay)
      allProductsCache.current = mapped
      // Apply client-side filters from cache
      applyFilters(mapped)
    } catch (err) {
      setProductsError(err.message || 'Could not load products')
      setProducts([])
      setTotalProducts(0)
      setTotalPages(1)
    } finally {
      setProductsLoading(false)
    }
  }, [currentPage, selectedDepartmentFilter, debouncedSearchTerm])

  // Fast client-side filtering from cached products (no API call)
  const applyFilters = useCallback((allProducts) => {
    const source = allProducts || allProductsCache.current
    if (!source.length) {
      setProducts([])
      setTotalProducts(0)
      setTotalPages(1)
      return
    }
    let filtered = source
    // Search filter
    if (debouncedSearchTerm.trim()) {
      const q = debouncedSearchTerm.trim().toLowerCase()
      filtered = source.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q)
      )
    }
    // Department filter
    if (selectedDepartmentFilter && selectedDepartmentFilter !== 'all') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase() === selectedDepartmentFilter.toLowerCase())
    }
    setProducts(filtered)
    setTotalProducts(filtered.length)
    setTotalPages(1)
  }, [debouncedSearchTerm, selectedDepartmentFilter])

  // Only re-fetch from API on initial load and page changes
  const initialFetchDone = useRef(false)
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true
      fetchProducts(1)
    }
  }, [])

  // Re-filter from cache when search/department changes (instant, no API call)
  const prevSearchRef = useRef(null)
  const prevDeptRef = useRef(null)
  useEffect(() => {
    const searchOrDeptChanged = prevSearchRef.current !== debouncedSearchTerm || prevDeptRef.current !== selectedDepartmentFilter
    prevSearchRef.current = debouncedSearchTerm
    prevDeptRef.current = selectedDepartmentFilter
    if (!searchOrDeptChanged) return
    const activeBranch = getActiveBranch()
    const branchId = activeBranch?.uuid || activeBranch?.id
    if (branchId && allProductsCache.current.length > 0) {
      // Filter from cache — no API call needed
      setTablePage(1)
      applyFilters()
    } else {
      // Non-branch mode: use server-side search
      setCurrentPage(1)
      fetchProducts(1)
    }
  }, [debouncedSearchTerm, selectedDepartmentFilter])

  // Handle page changes (non-branch mode)
  useEffect(() => {
    if (currentPage > 1) fetchProducts(currentPage)
  }, [currentPage])

  // Products are already filtered and paginated by the API (page size 100)
  const startIndex = totalProducts === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endIndex = (currentPage - 1) * PAGE_SIZE + products.length

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= p.minStock), [products])
  
  const expiredStockItems = useMemo(() => products.filter(p => {
    if (!p.expiry) return false
    const expiryDate = new Date(p.expiry)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiryDate < today
  }), [products])

  const outOfStockItems = useMemo(() => products.filter(p => (Number(p.stock) || 0) === 0), [products])

  // Apply stock filter to get display products
  const displayProducts = useMemo(() => {
    switch (stockFilter) {
      case 'high_sale':
        return [...products].sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      case 'low_sale':
        return [...products].sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0))
      case 'out_of_stock':
        return outOfStockItems
      case 'expired':
        return expiredStockItems
      default:
        return products
    }
  }, [products, stockFilter, outOfStockItems, expiredStockItems])

  // Client-side pagination: 10 items per table page
  const totalTablePages = Math.max(1, Math.ceil(displayProducts.length / TABLE_PAGE_SIZE))
  const paginatedProducts = useMemo(() => displayProducts.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE), [displayProducts, tablePage])

  // Reset table page when filters/search/products change
  useEffect(() => {
    setTablePage(1)
  }, [stockFilter, debouncedSearchTerm, selectedDepartmentFilter, products.length])

  const openDeleteModal = (product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    if (deleteLoading) return
    setShowDeleteModal(false)
    setProductToDelete(null)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    try {
      setDeleteLoading(true)
      await apiDeleteProduct(productToDelete.uuid || productToDelete.id)
      await fetchProducts()
      showAlert('Product deleted successfully', 'success')
      setShowDeleteModal(false)
      setProductToDelete(null)
    } catch (err) {
      showAlert(err.message || 'Could not delete product', 'error')
    } finally {
      setDeleteLoading(false)
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
      showAlert('No products match the selected filters.', 'warning')
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

  // Export Price List to CSV (name, brand, stock, selling price, cost price only)
  const handleExportPriceListCSV = () => {
    const exportProducts = getFilteredExportProducts()
    if (exportProducts.length === 0) {
      showAlert('No products match the selected filters.', 'warning')
      return
    }
    const headers = ['Product Name', 'Brand', 'Stock', 'Selling Price', 'Cost Price']
    const csvRows = [
      headers.join(','),
      ...exportProducts.map(p => [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.brand || p.brand_name || '').replace(/"/g, '""')}"`,
        Number(p.quantity || p.stock) || 0,
        (Number(p.selling_price || p.price) || 0).toFixed(2),
        (Number(p.cost_price || p.cost) || 0).toFixed(2),
      ].join(','))
    ]
    const deptSuffix = exportDepartmentFilter !== 'all' ? `_${exportDepartmentFilter}` : ''
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `price_list${deptSuffix}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportModal(false)
    setExportDepartmentFilter('all')
    setExportSaleFilter('all')
  }

  // Export Price List to PDF via browser print
  const handleExportPriceListPDF = () => {
    const exportProducts = getFilteredExportProducts()
    if (exportProducts.length === 0) {
      showAlert('No products match the selected filters.', 'warning')
      return
    }
    const activeBranch = getActiveBranch()
    const branchName = activeBranch?.name || 'Store'
    const today = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    const rows = exportProducts.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9fa'}">
        <td style="padding:9px 12px;border:1px solid #d1d5db;font-size:12px;color:#111827"><span style="color:#9ca3af;font-size:10px;margin-right:6px;font-weight:600">${i + 1}.</span>${(p.name || '—')}</td>
        <td style="padding:9px 12px;border:1px solid #d1d5db;font-size:12px;color:#4b5563">${(p.brand || p.brand_name || '—')}</td>
        <td style="padding:9px 12px;border:1px solid #d1d5db;font-size:12px;text-align:center;color:#111827;font-weight:600">${Number(p.quantity || p.stock) || 0}</td>
        <td style="padding:9px 12px;border:1px solid #d1d5db;font-size:12px;text-align:right;color:#15803d;font-weight:700">&#8373;${(Number(p.selling_price || p.price) || 0).toFixed(2)}</td>
        <td style="padding:9px 12px;border:1px solid #d1d5db;font-size:12px;text-align:right;color:#b91c1c;font-weight:700">&#8373;${(Number(p.cost_price || p.cost) || 0).toFixed(2)}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Price List — ${branchName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#fff; color:#111; }

        .page-wrapper { padding: 24px 28px; }

        /* Header banner */
        .header { background:#FF7521; color:#fff; padding:18px 24px; border-radius:6px 6px 0 0; display:flex; justify-content:space-between; align-items:flex-end; }
        .header-left h1 { font-size:22px; font-weight:800; letter-spacing:-0.3px; }
        .header-left p { font-size:11px; opacity:0.88; margin-top:4px; }
        .header-right { text-align:right; font-size:11px; opacity:0.88; line-height:1.6; }

        /* Meta bar */
        .meta { display:flex; justify-content:space-between; align-items:center; padding:8px 14px; background:#1f2937; color:#d1d5db; font-size:10.5px; border-left:1px solid #374151; border-right:1px solid #374151; }
        .meta span { display:flex; align-items:center; gap:5px; }
        .meta .dot { width:5px; height:5px; border-radius:50%; background:#FF7521; display:inline-block; }

        /* Table */
        .table-wrap { border:1px solid #d1d5db; border-top:none; border-radius:0 0 6px 6px; overflow:hidden; }
        table { width:100%; border-collapse:collapse; }

        thead tr { background:#1f2937; }
        thead th {
          padding:10px 12px;
          color:#f9fafb;
          font-size:10px;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:0.07em;
          border-right:1px solid #374151;
          text-align:left;
        }
        thead th:last-child { border-right:none; }
        thead th.center { text-align:center; }
        thead th.right { text-align:right; }

        tbody tr:last-child td { border-bottom:none; }
        tbody td { border-bottom:1px solid #e5e7eb; border-right:1px solid #e5e7eb; }
        tbody td:last-child { border-right:none; }

        /* Footer summary */
        .footer { margin-top:14px; display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:10px; }
        .footer strong { color:#374151; }

        /* Column widths */
        col.c-name  { width:36%; }
        col.c-brand { width:18%; }
        col.c-stock { width:12%; }
        col.c-sell  { width:17%; }
        col.c-cost  { width:17%; }

        @media print {
          @page { size: A4; margin: 14mm 12mm; }
          .page-wrapper { padding: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head><body>
      <div class="page-wrapper">
        <div class="header">
          <div class="header-left">
            <h1>&#128233; Price List</h1>
            <p>${branchName}${exportDepartmentFilter !== 'all' ? ` &mdash; ${exportDepartmentFilter}` : ''}</p>
          </div>
          <div class="header-right">
            <div>${today}</div>
            <div>${exportProducts.length} product${exportProducts.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div class="meta">
          <span><span class="dot"></span> OFFICIAL STORE PRICE LIST</span>
          <span>Confidential &mdash; Internal Use Only</span>
        </div>

        <div class="table-wrap">
          <table>
            <colgroup>
              <col class="c-name"><col class="c-brand"><col class="c-stock"><col class="c-sell"><col class="c-cost">
            </colgroup>
            <thead><tr>
              <th>#&nbsp; Product Name</th>
              <th>Brand</th>
              <th class="center">Stock</th>
              <th class="right">Selling Price</th>
              <th class="right">Cost Price</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div class="footer">
          <span>Generated by StorePro &mdash; ${branchName}</span>
          <span><strong>${exportProducts.length}</strong> total items exported</span>
        </div>
      </div>
    </body></html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
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
      showAlert('Please select a CSV or Excel file (.csv, .xlsx, .xls)', 'warning')
      return
    }
    setImportFileType(isExcel ? 'excel' : 'csv')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (isExcel) {
          const { data, errors } = parseExcel(e.target.result)
          if (data.length === 0) {
            showAlert('No rows found in the Excel sheet', 'warning')
            return
          }
          buildImportPreview(data, errors)
        } else {
          const text = e.target.result
          const { data, errors } = parseCSV(text)
          buildImportPreview(data, errors)
        }
      } catch (error) {
        showAlert(`Error reading file: ${error.message}`, 'error')
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
      showAlert('No valid rows to import', 'warning')
      return
    }

    const activeBranch = getActiveBranch()
    const branchId = activeBranch?.uuid || activeBranch?.id || ''
    const organizationId = user?.organization_id || user?.organizationId || ''

    if (!branchId || !organizationId) {
      showAlert('Please select an active branch before importing products.', 'warning')
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
        showAlert(`Imported ${created} product(s). ${failed} row(s) failed (e.g. duplicate SKU). Check the list.`, 'warning')
      } else {
        showAlert(`Successfully imported ${products.length} product(s).`, 'success')
      }
    } catch (err) {
      showAlert(err.message || 'Could not import products', 'error')
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
          .filter(u => u.unit) // keep all units including base unit
          .map(u => ({
            unit_name: u.unit,
            base_quantity: parseFloat(u.conversion) || 1,
            conversion_quantity: parseFloat(u.conversion) || 1,
            unit_price: parseFloat(u.price) || 0,
            cost_price: parseFloat(u.cost) || 0,
          }))
      : [{
          unit_name: productData.baseUnit || 'piece',
          base_quantity: 1,
          conversion_quantity: 1,
          unit_price: parseFloat(productData.price) || 0,
          cost_price: parseFloat(productData.cost) || 0,
        }]

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
      setProductSaving(true)
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
      console.error('Save product error:', err)
      showAlert(err.message || 'Could not save product', 'error')
    } finally {
      setProductSaving(false)
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

  return (
    <div className="app-page">
      {/* Toast Notifications */}
      {alertQueue.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
          {alertQueue.map((alert) => {
            const styles = {
              success: { bg: 'bg-green-50 border-green-200', icon: <HIcon icon={CheckmarkCircle02Icon} size={20} className="text-green-500"  />, title: 'Success', text: 'text-green-800', bar: 'bg-green-500' },
              error: { bg: 'bg-red-50 border-red-200', icon: <HIcon icon={Cancel02Icon} size={20} className="text-red-500"  />, title: 'Error', text: 'text-red-800', bar: 'bg-red-500' },
              warning: { bg: 'bg-amber-50 border-amber-200', icon: <HIcon icon={Alert02Icon} size={20} className="text-amber-500"  />, title: 'Warning', text: 'text-amber-800', bar: 'bg-amber-500' },
              info: { bg: 'bg-primary-50 border-primary-200', icon: <HIcon icon={Package01Icon} size={20} className="text-primary-500"  />, title: 'Info', text: 'text-primary-800', bar: 'bg-primary-500' },
            }[alert.type] || { bg: 'bg-primary-50 border-primary-200', icon: <HIcon icon={Package01Icon} size={20} className="text-primary-500"  />, title: 'Info', text: 'text-primary-800', bar: 'bg-primary-500' }
            return (
              <div key={alert.id} className={`pointer-events-auto rounded-lg border shadow-lg overflow-hidden ${styles.bg}`} style={{ animation: 'slideDown 0.35s ease-out' }}>
                <div className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{styles.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${styles.text}`}>{styles.title}</p>
                    <p className={`text-sm mt-0.5 ${styles.text} opacity-90`}>{alert.message}</p>
                  </div>
                  <button onClick={() => setAlertQueue(prev => prev.filter(a => a.id !== alert.id))} className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors">
                    <HIcon icon={Cancel01Icon} size={16} className={styles.text}  />
                  </button>
                </div>
                <div className={`h-1 ${styles.bar} opacity-30`} />
              </div>
            )
          })}
        </div>
      )}

      {/* Full-page product saving overlay */}
      {productSaving && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <HIcon icon={Loading03Icon} size={48} className="animate-spin text-primary-600"  />
            <p className="text-lg font-semibold text-gray-800">
              {editingProduct ? 'Updating Product...' : 'Saving Product...'}
            </p>
            <p className="text-sm text-gray-500">Please wait, do not close this page.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="app-page-header">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="app-page-title-wrap">
              <div className="app-page-icon h-9 w-9 rounded-control">
                <HIcon icon={Package01Icon} size={18} strokeWidth={2}  />
              </div>
              <div>
                <p className="app-page-kicker">Operations</p>
                <h1 className="app-page-title">Inventory</h1>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="flex items-center gap-1.5">
              <Tooltip text="Upload a CSV or Excel file to add products in bulk">
                <button
                  onClick={handleImportClick}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <HIcon icon={Upload01Icon} size={13} className="text-primary-500"  />
                  Import
                </button>
              </Tooltip>
              <Tooltip text="Download a blank CSV template for bulk product import">
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
                >
                  <HIcon icon={Download01Icon} size={13} className="text-gray-400"  />
                  Template
                </button>
              </Tooltip>
              <Tooltip text="Export your product list to CSV or Excel">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <HIcon icon={Download01Icon} size={13} className="text-primary-500"  />
                  Export
                </button>
              </Tooltip>
              <Tooltip text="Return items from a sale back to inventory stock">
                <button
                  onClick={() => navigate('/return-items')}
                  className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100"
                >
                  <HIcon icon={RotateLeft01Icon} size={13}  />
                  Return
                </button>
              </Tooltip>
              <Tooltip text="Add a single new product to inventory">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  <HIcon icon={Add01Icon} size={13} strokeWidth={2.5}  />
                  Add Product
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="app-page-content space-y-5">
        {/* Summary Stats */}
        <div className="app-stat-grid gap-4">
          <div className="app-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-stat-label">Total Products</p>
                <p className="app-stat-value">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <HIcon icon={Package01Icon} className="text-primary-500" size={20}  />
              </div>
            </div>
          </div>
          <div className="app-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-stat-label">Stock Value</p>
                <p className="mt-1 text-2xl font-bold text-primary-600">
                  ₵{products.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.cost) || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <HIcon icon={ArrowMoveUpRightIcon} className="text-primary-500" size={20}  />
              </div>
            </div>
          </div>
          <div className="app-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-stat-label">Low Stock</p>
                <p className="app-stat-value">{lowStockItems.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <HIcon icon={Alert02Icon} className="text-primary-500" size={20}  />
              </div>
            </div>
          </div>
          <div className="app-stat-card-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-stat-label text-white/80">Expired</p>
                <p className="app-stat-value text-white">{expiredStockItems.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <HIcon icon={Clock01Icon} className="text-white" size={20}  />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="rounded-panel border border-warning-100 bg-warning-50 p-4">
            <div className="flex items-start gap-3">
              <HIcon icon={Alert02Icon} className="text-amber-600 mt-0.5 shrink-0" size={18}  />
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
        <div className="app-filter-bar space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <HIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
              <input
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="app-input pl-10"
              />
            </div>
            <div className="relative">
              <HIcon icon={Building01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}  />
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="app-input pl-10 appearance-none"
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
              <HIcon icon={FilterIcon} size={14}  />
              <span className="text-xs font-medium">Quick Filters:</span>
            </div>
            <Tooltip text="Show all products">
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
            </Tooltip>
            <Tooltip text="Products with lowest remaining stock (most sold)">
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
            </Tooltip>
            <Tooltip text="Products with highest remaining stock (least sold)">
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
            </Tooltip>
            <Tooltip text="Products with zero remaining stock">
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
            </Tooltip>
            <Tooltip text="Products whose expiry date has passed">
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
            </Tooltip>
          </div>
        </div>

        {/* Products Table */}
        <div className="app-table-shell">
          {productsError && (
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-center gap-2">
              <HIcon icon={Alert02Icon} size={16}  />
              {productsError}
            </div>
          )}
          <div className="max-h-[62vh] overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="app-table-head-dark">
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 rounded-tl-[2px]">Product</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900">SKU</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900">Department</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Stock</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Min Stock</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Reorder</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Price</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Cost</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Profit</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-right">Value</th>
                  <th className="app-table-head-cell sticky top-0 z-10 bg-gray-900 text-center rounded-tr-[2px]">Actions</th>
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
                ) : paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, idx) => {
                    const isLowStock = product.stock <= product.minStock
                    const reorderPoint = product.reorderPoint || product.minStock
                    const needsReplenishment = product.stock <= reorderPoint
                    const sellingPrice = Number(product.price) || 0
                    const costPrice = Number(product.cost) || 0
                    const profit = sellingPrice - costPrice
                    return (
                      <tr key={product.id} onClick={() => handleEditClick(product)} className={`hover:bg-primary-50/40 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                              <HIcon icon={Package01Icon} size={14} className="text-primary-500"  />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                              {product.barcode && product.barcode !== '-' && (
                                <p className="text-xs text-gray-500 truncate">{product.barcode}</p>
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
                            <Tooltip text="Edit this product">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditClick(product) }}
                                className="p-1.5 rounded-md text-gray-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                              >
                                <HIcon icon={PencilEdit01Icon} size={15}  />
                              </button>
                            </Tooltip>
                            <Tooltip text="Delete this product">
                              <button
                                onClick={(e) => { e.stopPropagation(); openDeleteModal(product) }}
                                className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <HIcon icon={Delete01Icon} size={15}  />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <HIcon icon={Package01Icon} size={40}  />
                        <p className="text-sm font-medium text-gray-500">No products found</p>
                        <p className="text-xs text-gray-500">Try adjusting your search or add a new product.</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                        >
                          <HIcon icon={Add01Icon} size={16}  />
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
                Showing <span className="font-medium text-gray-900">{(tablePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(tablePage * TABLE_PAGE_SIZE, displayProducts.length)}</span> of <span className="font-medium text-gray-900">{displayProducts.length}</span>{stockFilter !== 'all' && <span className="text-primary-500 font-medium"> · {stockFilter === 'high_sale' ? 'High Sale' : stockFilter === 'low_sale' ? 'Low Sale' : stockFilter === 'out_of_stock' ? 'Out of Stock' : 'Expired'}</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTablePage(prev => Math.max(1, prev - 1))}
                  disabled={tablePage === 1}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HIcon icon={ArrowLeft01Icon} size={16}  />
                </button>
                {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((page) => {
                  if (page === 1 || page === totalTablePages || (page >= tablePage - 1 && page <= tablePage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setTablePage(page)}
                        className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                          tablePage === page
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === tablePage - 2 || page === tablePage + 2) {
                    return <span key={page} className="px-1 text-gray-400">…</span>
                  }
                  return null
                })}
                <button
                  onClick={() => setTablePage(prev => Math.min(totalTablePages, prev + 1))}
                  disabled={tablePage === totalTablePages}
                  className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <HIcon icon={ArrowRight01Icon} size={16}  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="bg-gray-900 rounded-t-xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <HIcon icon={Download01Icon} size={18} className="text-primary-400"  />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Export Products</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Filter then choose what to export</p>
                </div>
              </div>
              <button
                onClick={() => { setShowExportModal(false); setExportDepartmentFilter('all'); setExportSaleFilter('all') }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <HIcon icon={Cancel01Icon} size={18}  />
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
                  <HIcon icon={ArrowDown01Icon} size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"  />
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
                    <HIcon icon={Package01Icon} size={18} className={exportSaleFilter === 'all' ? 'text-primary-500' : 'text-gray-400'}  />
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
                    <HIcon icon={ArrowMoveUpRightIcon} size={18} className={exportSaleFilter === 'high' ? 'text-primary-500' : 'text-gray-400'}  />
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
                    <HIcon icon={ArrowMoveDownRightIcon} size={18} className={exportSaleFilter === 'low' ? 'text-primary-500' : 'text-gray-400'}  />
                    <span>Low Sale</span>
                  </button>
                </div>
              </div>

              {/* Preview Count */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Products to export</span>
                <span className="text-sm font-bold text-gray-900">{getFilteredExportProducts().length} items</span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Price List export */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-800">Export Price List</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 uppercase tracking-wide">Name · Brand · Stock · Price · Cost</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Compact view — only essential pricing columns</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPriceListCSV}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                  >
                    <HIcon icon={Download01Icon} size={15}  />
                    Price List CSV
                  </button>
                  <button
                    onClick={handleExportPriceListPDF}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:border-red-400 hover:bg-red-100 transition-all"
                  >
                    <HIcon icon={FileValidationIcon} size={15}  />
                    Price List PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
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
                <HIcon icon={Download01Icon} size={16}  />
                Full Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV / Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
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
                <HIcon icon={Cancel01Icon} size={20}  />
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
          showAlert={showAlert}
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

      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <HIcon icon={Delete02Icon} size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Product</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-2">
              <p className="text-sm text-gray-700">Are you sure you want to delete this product?</p>
              <p className="text-sm font-semibold text-gray-900 break-words">{productToDelete.name || 'Unnamed Product'}</p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {deleteLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <HIcon icon={Delete01Icon} size={15} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// Add/Edit Product Modal Component
const AddProductModal = ({ product, onSave, onClose, departments = [], showAlert = () => {} }) => {
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
    { value: 'wholesale', label: 'Wholesale', abbreviation: 'ws' },
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
  const skuTouched = React.useRef(!!product?.sku) // true if editing existing product

  // Auto-generate SKU from product name: first 4 letters + 2 random digits
  const generateSku = (name) => {
    const letters = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
    if (!letters) return ''
    const digits = String(Math.floor(10 + Math.random() * 90)) // 10-99
    return letters + digits
  }

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
          baseUnit: (data.base_unit ?? data.baseUnit ?? data.unit ?? 'piece').toLowerCase(),
          units: (data.units && data.units.length > 0)
            ? data.units.map(u => ({
                unit: (u.unit_name ?? u.unit ?? data.base_unit ?? 'piece').toLowerCase(),
                conversion: parseFloat(u.conversion_quantity ?? u.base_quantity ?? 1) || 1,
                price: parseFloat(u.unit_price ?? u.price ?? data.selling_price ?? 0) || 0,
                cost: parseFloat(u.cost_price ?? u.cost ?? data.cost_price ?? 0) || 0,
              }))
            : [{ unit: (data.base_unit || data.baseUnit || 'piece').toLowerCase(), conversion: 1, price: parseFloat(data.selling_price ?? data.price ?? 0) || 0, cost: parseFloat(data.cost_price ?? data.cost ?? 0) || 0 }]
        })
        
      } catch (error) {
        console.error('Error fetching product:', error)
        setFetchError(`Failed to load product: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch from API if we have an ID but units are NOT already mapped
    // (i.e. units come in as raw API shape with unit_name instead of unit)
    const productId = product?.uuid || product?.id || product?.productId
    const unitsAlreadyMapped = Array.isArray(product?.units) &&
      product.units.length > 0 &&
      product.units[0].unit !== undefined   // mapped shape has `unit`, raw API has `unit_name`

    if (productId && !unitsAlreadyMapped) {
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
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      // Auto-generate SKU when typing product name (only if user hasn't manually edited SKU)
      if (field === 'name' && !skuTouched.current) {
        next.sku = generateSku(value)
      }
      if (field === 'sku') {
        skuTouched.current = true
      }
      // When main selling price or cost price changes, update base unit row and cascade to other units
      if (field === 'price' || field === 'cost') {
        const numValue = parseFloat(value) || 0
        const bi = findBaseIndex(prev.units, prev.baseUnit)
        next.units = prev.units.map((u, i) => {
          const conv = parseFloat(u.conversion) || 1
          if (i === bi) {
            // Update base unit row to match main form price/cost
            return { ...u, [field]: numValue }
          }
          // Auto-recalculate non-base units unless manually edited
          if (field === 'price' && !manualPriceEdits.current.has(`${i}-price`)) {
            return { ...u, price: parseFloat((numValue * conv).toFixed(2)) }
          }
          if (field === 'cost' && !manualPriceEdits.current.has(`${i}-cost`)) {
            return { ...u, cost: parseFloat((numValue * conv).toFixed(2)) }
          }
          return u
        })
      }
      return next
    })
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    // Also clear SKU error when name auto-generates it
    if (field === 'name' && !skuTouched.current && errors.sku) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.sku
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
      showAlert('Please add at least one unit of measure', 'warning')
      return
    }

    // Ensure base unit is in units array — work on a copy, never mutate state directly
    let finalUnits = [...formData.units]
    const baseUnitExists = finalUnits.some(u => u.unit === formData.baseUnit)
    if (!baseUnitExists) {
      finalUnits.unshift({
        unit: formData.baseUnit,
        conversion: 1,
        price: formData.price,
        cost: formData.cost
      })
    }

    // Use the base unit row as the canonical price/cost (keeps top field & unit row in sync)
    const bi = findBaseIndex(finalUnits, formData.baseUnit)
    const canonicalPrice = parseFloat(finalUnits[bi]?.price ?? formData.price) || parseFloat(formData.price) || 0
    const canonicalCost  = parseFloat(finalUnits[bi]?.cost  ?? formData.cost)  || parseFloat(formData.cost)  || 0

    onSave({
      ...formData,
      price: canonicalPrice,
      cost: canonicalCost,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      reorderPoint: parseInt(formData.reorderPoint) || parseInt(formData.minStock),
      expiry: formData.expiry || null,
      baseUnit: formData.baseUnit,
      units: finalUnits.map(u => ({
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
      units: [...prev.units, { unit: 'piece', conversion: '', price: '', cost: '' }]
    }))
  }

  // Remove unit
  const handleRemoveUnit = (index) => {
    if (formData.units.length <= 1) {
      showAlert('At least one unit is required', 'warning')
      return
    }
    // Clear all manual edit flags and rebuild for remaining indices
    manualPriceEdits.current.clear()
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }))
  }

  // Track which unit price/cost fields the user has manually edited
  const manualPriceEdits = React.useRef(new Set())

  // Helper: find base unit index (conversion === 1, preferring the one matching baseUnit name)
  const findBaseIndex = (units, baseUnit) => {
    const idx = units.findIndex(u => u.unit === baseUnit && parseFloat(u.conversion) === 1)
    if (idx >= 0) return idx
    const fallback = units.findIndex(u => parseFloat(u.conversion) === 1)
    return fallback >= 0 ? fallback : 0
  }

  // Update unit — auto-calculate price/cost when conversion factor changes
  const handleUpdateUnit = (index, field, value) => {
    setFormData(prev => {
      const updatedUnits = prev.units.map((unit, i) => 
        i === index ? { ...unit, [field]: value } : unit
      )

      const bi = findBaseIndex(updatedUnits, prev.baseUnit)
      const isBase = index === bi

      // Base prices come from main form (single source of truth)
      const basePrice = parseFloat(prev.price) || 0
      const baseCost = parseFloat(prev.cost) || 0

      if (field === 'conversion' && !isBase) {
        // When conversion factor changes on non-base row, auto-fill price & cost
        const conv = parseFloat(value) || 0
        if (conv > 0 && basePrice > 0) {
          updatedUnits[index] = {
            ...updatedUnits[index],
            price: parseFloat((basePrice * conv).toFixed(2)),
            cost: parseFloat((baseCost * conv).toFixed(2))
          }
        }
        // Clear manual edit flags so future base price changes re-calculate
        manualPriceEdits.current.delete(`${index}-price`)
        manualPriceEdits.current.delete(`${index}-cost`)
      }

      if (field === 'unit' && !isBase) {
        // When unit type changes on a non-base row, recalculate price
        const conv = parseFloat(updatedUnits[index].conversion) || 0
        if (conv > 0 && basePrice > 0) {
          updatedUnits[index] = {
            ...updatedUnits[index],
            price: parseFloat((basePrice * conv).toFixed(2)),
            cost: parseFloat((baseCost * conv).toFixed(2))
          }
          manualPriceEdits.current.delete(`${index}-price`)
          manualPriceEdits.current.delete(`${index}-cost`)
        }
      }

      if (field === 'price') {
        manualPriceEdits.current.add(`${index}-price`)
      }
      if (field === 'cost') {
        manualPriceEdits.current.add(`${index}-cost`)
      }

      // When base unit row's price/cost changes, sync BACK to main formData.price/cost
      // AND cascade to other unit rows
      if ((field === 'price' || field === 'cost') && isBase) {
        const newBasePrice = field === 'price' ? (parseFloat(value) || 0) : basePrice
        const newBaseCost = field === 'cost' ? (parseFloat(value) || 0) : baseCost

        for (let i = 0; i < updatedUnits.length; i++) {
          if (i === bi) continue
          const conv = parseFloat(updatedUnits[i].conversion) || 0
          if (conv > 0) {
            if (!manualPriceEdits.current.has(`${i}-price`)) {
              updatedUnits[i] = { ...updatedUnits[i], price: parseFloat((newBasePrice * conv).toFixed(2)) }
            }
            if (!manualPriceEdits.current.has(`${i}-cost`)) {
              updatedUnits[i] = { ...updatedUnits[i], cost: parseFloat((newBaseCost * conv).toFixed(2)) }
            }
          }
        }

        // Keep top-level price/cost in sync with the base unit row (single source of truth)
        return {
          ...prev,
          price: field === 'price' ? newBasePrice : prev.price,
          cost: field === 'cost' ? newBaseCost : prev.cost,
          units: updatedUnits
        }
      }

      return { ...prev, units: updatedUnits }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              {product ? <HIcon icon={PencilEdit01Icon} size={18} className="text-white"  /> : <HIcon icon={Add01Icon} size={18} className="text-white"  />}
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
            <HIcon icon={Cancel01Icon} size={20}  />
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
              <HIcon icon={Alert02Icon} className="text-red-500 mt-0.5" size={16}  />
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
              <p className="text-xs text-gray-500 mt-1">Stock level at which this item should be restocked</p>
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
                  <HIcon icon={Add01Icon} size={16}  />
                  Add Unit
                </button>
              </div>
              
              <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                {formData.units.map((unit, index) => {
                  const unitInfo = UNITS_OF_MEASURE.find(u => u.value === unit.unit)
                  const bi = findBaseIndex(formData.units, formData.baseUnit)
                  const isBaseUnit = index === bi
                  const conv = parseFloat(unit.conversion) || 1
                  const basePrice = parseFloat(formData.price) || 0
                  const baseCost = parseFloat(formData.cost) || 0
                  
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
                              placeholder={isBaseUnit ? "1" : "e.g. 12"}
                            />
                            {isBaseUnit ? (
                              <p className="text-xs text-gray-400 mt-1">Base unit</p>
                            ) : conv > 1 ? (
                              <p className="text-xs text-gray-500 mt-1">
                                {`1 ${unitInfo?.abbreviation || unit.unit} = ${conv} ${formData.baseUnit}`}
                              </p>
                            ) : conv > 0 && conv < 1 ? (
                              <p className="text-xs text-gray-500 mt-1">
                                {`1 ${formData.baseUnit} = ${(1 / conv).toFixed(2)} ${unitInfo?.abbreviation || unit.unit}`}
                              </p>
                            ) : null}
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
                            {!isBaseUnit && conv > 0 && basePrice > 0 && (
                              <p className="text-xs text-green-600 mt-1">₵{basePrice.toFixed(2)} × {conv} = ₵{(basePrice * conv).toFixed(2)}</p>
                            )}
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
                            {!isBaseUnit && conv > 0 && baseCost > 0 && (
                              <p className="text-xs text-green-600 mt-1">₵{baseCost.toFixed(2)} × {conv} = ₵{(baseCost * conv).toFixed(2)}</p>
                            )}
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
                            <HIcon icon={Delete02Icon} size={18}  />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-6">
          <div className="flex flex-col items-center">
            <div className="bg-primary-500 rounded-full p-3 mb-3">
              <HIcon icon={CheckmarkCircle02Icon} size={32} className="text-white"  />
            </div>
            <h2 className="text-xl font-bold text-white">
              Product {product.action === 'added' ? 'Added' : 'Updated'}!
            </h2>
            <p className="text-gray-500 text-sm mt-1">
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
            <HIcon icon={Tick01Icon} size={16}  />
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default Inventory

