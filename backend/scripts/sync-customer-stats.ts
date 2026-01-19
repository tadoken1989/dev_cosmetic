import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { CustomersService } from '../src/modules/customers/customers.service'

async function bootstrap() {
  console.log('🔄 Đang kết nối database...')
  
  const app = await NestFactory.createApplicationContext(AppModule)
  const customersService = app.get(CustomersService)
  
  try {
    console.log('📊 Đang đồng bộ thống kê khách hàng...')
    const result = await customersService.syncAllCustomerStats()
    console.log(`✅ Đã đồng bộ thành công ${result.synced} khách hàng!`)
  } catch (error) {
    console.error('❌ Lỗi:', error.message)
    process.exit(1)
  } finally {
    await app.close()
  }
}

bootstrap()
