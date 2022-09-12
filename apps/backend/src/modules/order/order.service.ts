import { EntityManager } from "typeorm";
import { OrderService as MedusaOrderService } from "@medusajs/medusa/dist/services";
import { OrderRepository } from "./order.repository";
import { Service } from "medusa-extender";
import { User } from "../user/entities/user.entity";
import { buildQuery } from "@medusajs/medusa/dist/utils";
import { FindConfig } from "@medusajs/medusa/dist/types/common";
import { Order } from "./order.entity";
import { MedusaError } from "medusa-core-utils";

type InjectedDependencies = {
    manager: EntityManager;
    orderRepository: typeof OrderRepository;
    customerService: any;
    paymentProviderService: any;
    shippingOptionService: any;
    shippingProfileService: any;
    discountService: any;
    fulfillmentProviderService: any;
    fulfillmentService: any;
    lineItemService: any;
    totalsService: any;
    regionService: any;
    cartService: any;
    addressRepository: any;
    giftCardService: any;
    draftOrderService: any;
    inventoryService: any;
    eventBusService: any;
    loggedInUser?: User;
    orderService: OrderService;
};

@Service({ scope: "SCOPED", override: MedusaOrderService })
export class OrderService extends MedusaOrderService {
    private readonly manager: EntityManager;
    private readonly orderRepository: typeof OrderRepository;
    readonly container: InjectedDependencies;

    constructor(container: InjectedDependencies) {
        super(container);

        this.manager = container.manager;
        this.container = container;
        this.orderRepository = container.orderRepository;
    }

    buildQuery(selector: object, config: { relations: string[]; select: string[] }): object {
        if (Object.keys(this.container).includes("loggedInUser") && this.container.loggedInUser.store_id) {
            selector["store_id"] = this.container.loggedInUser.store_id;
        }

        config.select.push("store_id");
        config.relations = config.relations ?? [];
        config.relations.push("children", "parent", "store");
        return buildQuery(selector, config);
    }

    public async retrieve(orderId: string, config?: FindConfig<Order>): Promise<Order> {
        const orderRepo = this.manager.getCustomRepository(this.orderRepository);
        const validatedId = orderId;
        const query = buildQuery({ id: validatedId }, config);
        const order = await orderRepo.findOne(query);

        if (!order) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order with id: ${orderId} was not found`);
        }

        return order as Order;
    }
}
