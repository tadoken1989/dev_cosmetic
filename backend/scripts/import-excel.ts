/**
 * Import Products & Inventory from Excel
 * 
 * Usage: npx ts-node scripts/import-excel.ts
 * 
 * Files required:
 * - /home/admin/domains/dev.giatlacapy.vn/public_html/products.xlsx
 * - /home/admin/domains/dev.giatlacapy.vn/public_html/inventory.xlsx
 */

import { DataSource } from 'typeorm'
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'
import * as http from 'http'
import * as dotenv from 'dotenv'

dotenv.config()

// File paths
const EXCEL_DIR = '/home/admin/domains/dev.giatlacapy.vn/public_html'
const PRODUCTS_FILE = path.join(EXCEL_DIR, 'products.xlsx')
const INVENTORY_FILE = path.join(EXCEL_DIR, 'inventory.xlsx')
const UPLOAD_DIR = '/home/admin/domains/dev.giatlacapy.vn/public_html/uploads/products'

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Database connection
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'cosmetic_db',
  synchronize: false,
  logging: false,
})

// Helper functions
function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0
  const num = parseFloat(String(value).replace(/,/g, ''))
  return isNaN(num) ? 0 : num
}

function parsePrice(value: any): number {
  const num = parseNumber(value)
  // Nếu giá < 10000, giả định Excel đã bỏ đuôi 000, nhân lại
  if (num > 0 && num < 10000) {
    return num * 1000
  }
  return num
}

function parseBoolean(value: any): boolean {
  if (value === null || value === undefined || value === '') return true
  const str = String(value).toLowerCase().trim()
  if (str === 'false' || str === '0' || str === 'x' || str === 'no') {
    return false
  }
  return true
}

function parseTags(value: any): string[] {
  if (!value) return []
  return String(value).split(',').map(t => t.trim()).filter(t => t)
}

function getColumnValue(row: any, columnLetter: string): any {
  // Convert column letter to index (A=0, B=1, ..., AA=26, AB=27, etc.)
  let index = 0
  for (let i = 0; i < columnLetter.length; i++) {
    index = index * 26 + (columnLetter.charCodeAt(i) - 'A'.charCodeAt(0) + 1)
  }
  index-- // Convert to 0-based
  
  // Get value by index from array representation
  const keys = Object.keys(row)
  return row[keys[index]]
}

async function getOrCreateProductType(name: string): Promise<number | null> {
  if (!name || name.trim() === '') return null
  
  const trimmedName = name.trim()
  
  const existing = await AppDataSource.query(
    'SELECT id FROM product_types WHERE name = $1',
    [trimmedName]
  )
  
  if (existing.length > 0) {
    return existing[0].id
  }
  
  const result = await AppDataSource.query(
    'INSERT INTO product_types (name, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING id',
    [trimmedName]
  )
  
  console.log(`  ✅ Created product type: ${trimmedName}`)
  return result[0].id
}

async function getOrCreateBrand(name: string): Promise<number | null> {
  if (!name || name.trim() === '') return null
  
  const trimmedName = name.trim()
  
  const existing = await AppDataSource.query(
    'SELECT id FROM brands WHERE name = $1',
    [trimmedName]
  )
  
  if (existing.length > 0) {
    return existing[0].id
  }
  
  const result = await AppDataSource.query(
    'INSERT INTO brands (name, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING id',
    [trimmedName]
  )
  
  console.log(`  ✅ Created brand: ${trimmedName}`)
  return result[0].id
}

async function downloadImage(url: string, productName: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const ext = path.extname(urlObj.pathname) || '.jpg'
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      const fileStream = fs.createWriteStream(filepath)
      
      const client = url.startsWith('https') ? https : http
      
      client.get(url, (response) => {
        if (response.statusCode !== 200) {
          console.error(`  ⚠️  Failed to download image for ${productName}: ${response.statusCode}`)
          resolve(null)
          return
        }
        
        response.pipe(fileStream)
        
        fileStream.on('finish', () => {
          fileStream.close()
          // Return relative path for DB
          resolve(`/uploads/products/${filename}`)
        })
      }).on('error', (err) => {
        console.error(`  ⚠️  Error downloading image for ${productName}:`, err.message)
        fs.unlink(filepath, () => {}) // Delete failed download
        resolve(null)
      })
      
      fileStream.on('error', (err) => {
        console.error(`  ⚠️  Error writing image for ${productName}:`, err.message)
        fs.unlink(filepath, () => {})
        resolve(null)
      })
    } catch (error: any) {
      console.error(`  ⚠️  Invalid image URL for ${productName}:`, error.message)
      resolve(null)
    }
  })
}

async function importProducts(): Promise<Map<string, number>> {
  console.log('\n📦 Importing Products...')
  console.log(`   Reading file: ${PRODUCTS_FILE}`)
  
  const workbook = XLSX.readFile(PRODUCTS_FILE)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  // Read as array of arrays to access by index
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
  
  // Skip header row (row 0), start from row 1
  const dataRows = data.slice(1)
  
  console.log(`   Found ${dataRows.length} products`)
  
  const skuToIdMap = new Map<string, number>()
  let imported = 0
  let skipped = 0
  let errors = 0
  
  for (const row of dataRows) {
    try {
      // Map by column index (0-based): A=0, B=1, C=2, etc.
      const name = row[0] ? String(row[0]) : '' // A: Tên sản phẩm
      const managementType = row[1] // B: Hình thức quản lý
      const productTypeName = row[2] // C: Loại sản phẩm
      const description = row[3] // D: Mô tả
      const brandName = row[4] // E: Nhãn hiệu
      const tags = row[5] // F: Tags
      // G-L: Thuộc tính (skip for now)
      // M: Tên phiên bản (skip)
      const sku = row[13] // N: Mã SKU
      const barcode = row[14] // O: Barcode
      const weight = row[15] // P: Khối lượng
      const weightUnit = row[16] // Q: Đơn vị khối lượng
      const imageUrl = row[17] // R: Ảnh đại diện
      const unit = row[18] // S: Đơn vị
      const expiryWarningDays = row[19] // T: Số ngày cảnh báo hết hạn
      const warrantyEnabled = row[20] // U: Áp dụng bảo hành
      const warrantyPolicy = row[21] // V: Chính sách bảo hành
      const applyTax = row[22] // W: Áp dụng thuế
      const taxIncluded = row[23] // X: Giá áp dụng thuế
      const inputTax = row[24] // Y: Thuế đầu vào
      const outputTax = row[25] // Z: Thuế đầu ra
      const initialStock = row[26] // AA: Tồn kho ban đầu
      const costPrice = row[27] // AB: Giá vốn
      const minStock = row[28] // AC: Tồn tối thiểu
      const maxStock = row[29] // AD: Tồn tối đa
      const location = row[30] // AE: Điểm lưu kho
      const retailPrice = row[31] // AF: Giá bán lẻ
      const importPrice = row[32] // AG: Giá nhập
      const wholesalePrice = row[33] // AH: Giá bán buôn
      
      // Skip if no name
      if (!name || name.trim() === '') {
        skipped++
        continue
      }
      
      // Get or create product type and brand
      const productTypeId = await getOrCreateProductType(productTypeName)
      const brandId = await getOrCreateBrand(brandName)
      
      // Process image URL - download from external source
      let imageToSave: string | null = null
      if (imageUrl && String(imageUrl).trim() !== '') {
        const urlStr = String(imageUrl).trim()
        // If it's a valid HTTP/HTTPS URL, download it
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          imageToSave = await downloadImage(urlStr, String(name))
        }
      }
      
      // Check if product exists
      let existingId: number | null = null
      if (sku) {
        const existing = await AppDataSource.query(
          'SELECT id FROM products WHERE sku = $1',
          [String(sku).trim()]
        )
        if (existing.length > 0) {
          existingId = existing[0].id
        }
      }
      if (!existingId && barcode) {
        const existing = await AppDataSource.query(
          'SELECT id FROM products WHERE barcode = $1',
          [String(barcode).trim()]
        )
        if (existing.length > 0) {
          existingId = existing[0].id
        }
      }
      
      if (existingId) {
        // Update existing product
        await AppDataSource.query(`
          UPDATE products SET
            name = $1,
            "managementType" = $2,
            unit = $3,
            "retailPrice" = $4,
            "wholesalePrice" = $5,
            "importPrice" = $6,
            barcode = $7,
            description = $8,
            weight = $9,
            "weightUnit" = $10,
            "applyTax" = $11,
            "taxIncluded" = $12,
            notes = $13,
            tags = $14,
            "productTypeId" = $15,
            "brandId" = $16,
            "expiryWarningDays" = $17,
            "warrantyEnabled" = $18,
            "warrantyPolicy" = $19,
            "updatedAt" = NOW()
          WHERE id = $20
        `, [
          name.trim(),
          managementType === 'Lô/Date' ? 'batch' : 'normal',
          unit || null,
          parsePrice(retailPrice),
          parsePrice(wholesalePrice),
          parsePrice(importPrice),
          barcode ? String(barcode).trim() : null,
          description || null,
          parseNumber(weight),
          weightUnit || 'g',
          parseBoolean(applyTax),
          parseBoolean(taxIncluded),
          null, // notes
          parseTags(tags),
          productTypeId,
          brandId,
          parseNumber(expiryWarningDays) || null,
          parseBoolean(warrantyEnabled),
          warrantyPolicy || null,
          existingId,
        ])
        
        // Save product image if exists
        if (imageToSave && existingId) {
          // Check if image already exists
          const existingImage = await AppDataSource.query(
            'SELECT id FROM product_images WHERE "productId" = $1 AND url = $2',
            [existingId, imageToSave]
          )
          
          if (existingImage.length === 0) {
            await AppDataSource.query(`
              INSERT INTO product_images ("productId", url, "isPrimary")
              VALUES ($1, $2, true)
            `, [existingId, imageToSave])
          }
        }
        
        // Update or create inventory
        const qty = parseNumber(initialStock)
        const cost = parseNumber(costPrice) || parseNumber(importPrice)
        
        if (qty > 0 || cost > 0) {
          const invExists = await AppDataSource.query(
            'SELECT id FROM inventory WHERE "productId" = $1 AND "branchId" = 1',
            [existingId]
          )
          
          if (invExists.length > 0) {
            await AppDataSource.query(`
              UPDATE inventory SET
                quantity = $1,
                available = $1,
                "costPrice" = $2,
                "minStock" = $3,
                "maxStock" = $4,
                location = $5,
                "updatedAt" = NOW()
              WHERE id = $6
            `, [qty, cost, parseNumber(minStock) || null, parseNumber(maxStock) || null, location || null, invExists[0].id])
          } else {
            await AppDataSource.query(`
              INSERT INTO inventory (
                "productId", "branchId", "branchName", quantity, available,
                "costPrice", "minStock", "maxStock", location, "createdAt", "updatedAt"
              ) VALUES ($1, 1, 'Chi nhánh mặc định', $2, $2, $3, $4, $5, $6, NOW(), NOW())
            `, [existingId, qty, cost, parseNumber(minStock) || null, parseNumber(maxStock) || null, location || null])
          }
        }
        
        if (sku) skuToIdMap.set(String(sku).trim(), existingId)
        if (barcode) skuToIdMap.set(String(barcode).trim(), existingId)
        imported++
      } else {
        // Insert new product
        const result = await AppDataSource.query(`
          INSERT INTO products (
            name, sku, "managementType", unit, "retailPrice", "wholesalePrice",
            "importPrice", barcode, description, weight, "weightUnit",
            "applyTax", "taxIncluded", tags, "productTypeId", "brandId",
            "expiryWarningDays", "warrantyEnabled", "warrantyPolicy",
            "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
          RETURNING id
        `, [
          name.trim(),
          sku ? String(sku).trim() : null,
          managementType === 'Lô/Date' ? 'batch' : 'normal',
          unit || null,
          parsePrice(retailPrice),
          parsePrice(wholesalePrice),
          parsePrice(importPrice),
          barcode ? String(barcode).trim() : null,
          description || null,
          parseNumber(weight),
          weightUnit || 'g',
          parseBoolean(applyTax),
          parseBoolean(taxIncluded),
          parseTags(tags),
          productTypeId,
          brandId,
          parseNumber(expiryWarningDays) || null,
          parseBoolean(warrantyEnabled),
          warrantyPolicy || null,
        ])
        
        const newId = result[0].id
        
        // Save product image if exists
        if (imageToSave) {
          await AppDataSource.query(`
            INSERT INTO product_images ("productId", url, "isPrimary")
            VALUES ($1, $2, true)
          `, [newId, imageToSave])
        }
        
        // Create inventory
        const qty = parseNumber(initialStock)
        const cost = parseNumber(costPrice) || parseNumber(importPrice)
        
        if (qty > 0 || cost > 0) {
          await AppDataSource.query(`
            INSERT INTO inventory (
              "productId", "branchId", "branchName", quantity, available,
              "costPrice", "minStock", "maxStock", location, "createdAt", "updatedAt"
            ) VALUES ($1, 1, 'Chi nhánh mặc định', $2, $2, $3, $4, $5, $6, NOW(), NOW())
          `, [newId, qty, cost, parseNumber(minStock) || null, parseNumber(maxStock) || null, location || null])
        }
        
        if (sku) skuToIdMap.set(String(sku).trim(), newId)
        if (barcode) skuToIdMap.set(String(barcode).trim(), newId)
        imported++
      }
      
      if (imported % 100 === 0) {
        console.log(`   Processed ${imported} products...`)
      }
    } catch (error: any) {
      errors++
      console.error(`   ❌ Error importing product: ${row[0]}`, error.message)
    }
  }
  
  console.log(`\n   ✅ Products imported: ${imported}`)
  console.log(`   ⏭️  Skipped (no name): ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  
  return skuToIdMap
}

async function importInventory(skuToIdMap: Map<string, number>): Promise<void> {
  console.log('\n📊 Importing Inventory (updating from inventory file)...')
  console.log(`   Reading file: ${INVENTORY_FILE}`)
  
  const workbook = XLSX.readFile(INVENTORY_FILE)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  // Read as array of arrays
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
  
  // Data starts from row 3 (index 2), skip rows 0, 1, 2
  const dataRows = data.slice(2)
  
  console.log(`   Found ${dataRows.length} inventory records`)
  
  let updated = 0
  let skipped = 0
  let errors = 0
  
  for (const row of dataRows) {
    try {
      // Map by column index: A=0, B=1, C=2, etc.
      // const stt = row[0] // A: STT (skip)
      const productName = row[1] // B: Tên sản phẩm
      // const variantName = row[2] // C: Tên phiên bản (skip)
      const sku = row[3] // D: Mã SKU
      const barcode = row[4] // E: Mã Barcode
      // const productType = row[5] // F: Loại sản phẩm (skip)
      // const unit = row[6] // G: Đơn vị tính (skip)
      const quantity = row[7] // H: Tồn kho (Chi nhánh mặc định)
      // const stockValue = row[8] // I: Giá trị tồn kho (skip, calculated)
      const costPrice = row[9] // J: Giá vốn
      // const ratio = row[10] // K: Tỷ trọng (skip)
      // L, M: Tổng hệ thống (skip)
      
      // Find product by SKU or Barcode
      let productId: number | null = null
      
      if (sku && skuToIdMap.has(String(sku).trim())) {
        productId = skuToIdMap.get(String(sku).trim())!
      } else if (barcode && skuToIdMap.has(String(barcode).trim())) {
        productId = skuToIdMap.get(String(barcode).trim())!
      } else if (sku) {
        const result = await AppDataSource.query(
          'SELECT id FROM products WHERE sku = $1',
          [String(sku).trim()]
        )
        if (result.length > 0) {
          productId = result[0].id
        }
      } else if (barcode) {
        const result = await AppDataSource.query(
          'SELECT id FROM products WHERE barcode = $1',
          [String(barcode).trim()]
        )
        if (result.length > 0) {
          productId = result[0].id
        }
      }
      
      if (!productId) {
        skipped++
        continue
      }
      
      const qty = parseNumber(quantity)
      const cost = parseNumber(costPrice)
      
      // Update inventory (should already exist from products import)
      const existing = await AppDataSource.query(
        'SELECT id FROM inventory WHERE "productId" = $1 AND "branchId" = 1',
        [productId]
      )
      
      if (existing.length > 0) {
        await AppDataSource.query(`
          UPDATE inventory SET
            quantity = $1,
            available = $1,
            "costPrice" = $2,
            "updatedAt" = NOW()
          WHERE id = $3
        `, [qty, cost, existing[0].id])
        updated++
      } else {
        // Create if doesn't exist
        await AppDataSource.query(`
          INSERT INTO inventory (
            "productId", "branchId", "branchName", quantity, available,
            "costPrice", "createdAt", "updatedAt"
          ) VALUES ($1, 1, 'Chi nhánh mặc định', $2, $2, $3, NOW(), NOW())
        `, [productId, qty, cost])
        updated++
      }
      
      if (updated % 100 === 0) {
        console.log(`   Processed ${updated} inventory records...`)
      }
    } catch (error: any) {
      errors++
      console.error(`   ❌ Error updating inventory: ${row[1]}`, error.message)
    }
  }
  
  console.log(`\n   ✅ Inventory updated: ${updated}`)
  console.log(`   ⏭️  Skipped (product not found): ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
}

async function main() {
  console.log('=' .repeat(60))
  console.log('🚀 Excel Import Tool - v2 (Index-based mapping)')
  console.log('=' .repeat(60))
  
  try {
    console.log('\n📡 Connecting to database...')
    await AppDataSource.initialize()
    console.log('   ✅ Connected!')
    
    // Import products first (also creates initial inventory)
    const skuToIdMap = await importProducts()
    
    // Update inventory from inventory file
    await importInventory(skuToIdMap)
    
    console.log('\n' + '=' .repeat(60))
    console.log('🎉 Import completed!')
    console.log('=' .repeat(60))
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await AppDataSource.destroy()
  }
}

main()
