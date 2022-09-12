import { Module } from "medusa-extender";
import { OrderSubscriber } from "./order.subscriber";
import { Order } from "./order.entity";
import { OrderMigration1661401588606 } from "./1661401588606-order.migration";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
@Module({
    imports: [Order, OrderRepository, OrderService, OrderMigration1661401588606, OrderSubscriber]
})
export class OrderModule {}
