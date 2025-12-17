<template>
  <div class="product-list">
    <!-- Header -->
    <div class="page-header">
      <h1>Danh sách sản phẩm</h1>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/products/create')">
          + Thêm sản phẩm
        </el-button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <el-button-group>
        <el-button>Xuất file</el-button>
        <el-button>Nhập file</el-button>
        <el-button>Loại sản phẩm</el-button>
        <el-button>Lô - HSD</el-button>
        <el-button>Combo</el-button>
        <el-button>Sản phẩm quy đổi</el-button>
      </el-button-group>
      <el-link type="primary" class="active-tab">Tất cả sản phẩm</el-link>
    </div>

    <!-- Filters and Search -->
    <el-card class="filters-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="Q Tìm kiếm theo mã sản phẩm, tên sản phẩm, barcode"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.productTypeId" placeholder="Loại sản phẩm" clearable>
            <el-option
              v-for="type in productTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.brandId" placeholder="Nhãn hiệu" clearable>
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.dateFilter" placeholder="Ngày tạo" clearable>
            <el-option label="Hôm nay" value="today" />
            <el-option label="Tuần này" value="week" />
            <el-option label="Tháng này" value="month" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button>Bộ lọc khác</el-button>
          <el-button type="primary" text>Lưu bộ lọc</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Product Table -->
    <el-card>
      <el-table
        :data="productStore.products"
        v-loading="productStore.loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="#" width="50" />
        <el-table-column label="Ảnh" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.images?.[0]"
              :src="row.images[0].url"
              :alt="row.name"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <div v-else class="no-image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Sản phẩm" min-width="200" />
        <el-table-column label="Loại" width="120">
          <template #default="{ row }">
            {{ row.productType?.name || '---' }}
          </template>
        </el-table-column>
        <el-table-column label="Nhãn hiệu" width="120">
          <template #default="{ row }">
            {{ row.brand?.name || '---' }}
          </template>
        </el-table-column>
        <el-table-column label="Có thể bán" width="120">
          <template #default="{ row }">
            {{ row.allowSale ? 'Có' : 'Không' }}
          </template>
        </el-table-column>
        <el-table-column label="Tồn kho" width="120">
          <template #default="{ row }">
            <!-- TODO: Show inventory quantity -->
            0 (1 phiên bản)
          </template>
        </el-table-column>
        <el-table-column label="Ngày khởi tạo" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/products/${row.id}`)">
              Xem
            </el-button>
            <el-button size="small" @click="$router.push(`/products/${row.id}/edit`)">
              Sửa
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="productStore.pagination.page"
        :page-size="productStore.pagination.pageSize"
        :total="productStore.pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useProductStore } from '@/stores/product.store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Picture } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import dayjs from 'dayjs'

const productStore = useProductStore()

const searchQuery = ref('')
const selectedProducts = ref<any[]>([])
const productTypes = ref<any[]>([])
const brands = ref<any[]>([])

const filters = reactive({
  productTypeId: null as number | null,
  brandId: null as number | null,
  dateFilter: null as string | null,
})

onMounted(() => {
  productStore.fetchProducts(true)
  loadProductTypes()
  loadBrands()
})

const handleSearch = useDebounceFn(() => {
  productStore.setFilters({ search: searchQuery.value })
  productStore.fetchProducts(true)
}, 500)

function handlePageChange() {
  productStore.fetchProducts()
}

function handleSizeChange(size: number) {
  productStore.pagination.pageSize = size
  productStore.fetchProducts(true)
}

function handleSelectionChange(selection: any[]) {
  selectedProducts.value = selection
}

function formatDate(date: string) {
  return dayjs(date).format('DD/MM/YYYY')
}

function loadProductTypes() {
  // TODO: Load from API
  productTypes.value = [
    { id: 1, name: 'Gọng kính' },
    { id: 2, name: 'Hỗ trợ sức khỏe' },
    { id: 3, name: 'Kem dưỡng mắt' },
  ]
}

function loadBrands() {
  // TODO: Load from API
  brands.value = []
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn xóa sản phẩm này?', 'Xác nhận', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    })
    await productStore.deleteProduct(id)
    ElMessage.success('Xóa sản phẩm thành công')
    productStore.fetchProducts(true)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Xóa sản phẩm thất bại')
    }
  }
}
</script>

<style scoped lang="scss">
.product-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
    }
  }

  .tabs-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #409eff;

    .active-tab {
      font-weight: 600;
    }
  }

  .filters-card {
    margin-bottom: 20px;
  }

  .no-image-placeholder {
    width: 50px;
    height: 50px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
  }
}
</style>
