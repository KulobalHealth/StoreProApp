/**
 * Generates product_import_template.xlsx in the project root.
 * Run: node scripts/generate-product-import-template.js
 */
import XLSX from 'xlsx'
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outPath = join(root, 'product_import_template.xlsx')

const headers = [
  'Name',
  'SKU',
  'Barcode',
  'Category',
  'Price',
  'Cost',
  'Stock',
  'Min Stock',
  'Reorder Point',
  'Expiry',
  'Brand',
  'Base Unit',
]

const sampleRows = [
  ['Coca Cola 500ml', 'CC-500', '5901234567890', 'Beverages', 5.00, 3.50, 50, 10, 15, '', 'Coca-Cola', 'piece'],
  ['Bread Loaf', 'BL-001', '5901234567891', 'Bakery', 5.00, 3.00, 30, 15, 20, '', '', 'piece'],
  ['Milk 1L', 'ML-1L', '5901234567892', 'Dairy', 5.00, 3.75, 25, 10, 15, '2025-12-31', '', 'piece'],
  ['Rice 5kg', 'RC-5KG', '5901234567893', 'Grains', 15.00, 12.00, 40, 20, 25, '', '', 'kg'],
  ['Cooking Oil 1L', 'CO-1L', '5901234567894', 'Cooking', 10.00, 7.50, 35, 15, 20, '', '', 'piece'],
]

const data = [headers, ...sampleRows]
const ws = XLSX.utils.aoa_to_sheet(data)

// Column widths for readability
ws['!cols'] = [
  { wch: 18 },
  { wch: 12 },
  { wch: 16 },
  { wch: 12 },
  { wch: 8 },
  { wch: 8 },
  { wch: 8 },
  { wch: 10 },
  { wch: 14 },
  { wch: 12 },
  { wch: 12 },
  { wch: 10 },
]

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Products')

writeFileSync(outPath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
console.log('Created:', outPath)
