import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { OrderReturn } from './entities/order-return.entity'
import { InventoryModule } from '../inventory/inventory.module'
import { CustomersModule } from '../customers/customers.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderReturn]),
    forwardRef(() => InventoryModule),
    CustomersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
