import { Cart } from "medusa";
import { CartService as MedusaCartService } from "@medusajs/medusa/dist/services";
import { FilterableCartProps } from "@medusajs/medusa/dist/types/cart";
import { FindConfig } from "@medusajs/medusa/dist/types/common";
import { Service } from 'medusa-extender';

type InjectedDependencies = {
    manager,
    cartRepository, shippingMethodRepository, lineItemRepository, eventBusService,
    paymentProviderService, productService, productVariantService, taxProviderService, regionService,
    lineItemService, shippingOptionService, customerService, discountService, giftCardService, totalsService,
    addressRepository, paymentSessionRepository, inventoryService, customShippingOptionService, lineItemAdjustmentService,
    priceSelectionStrategy, salesChannelService, featureFlagRouter, storeService,
}

@Service({ scope: 'SCOPED', override: MedusaCartService })
export class CartService extends MedusaCartService {

    constructor(container: InjectedDependencies) {
        super(container);
    }

    authorizePayment(cartId: string, context?: Record<string, unknown>): Promise<Cart> {
        return super.authorizePayment(cartId, context);
    }

    retrieve(cartId: string, options?: FindConfig<Cart>, totalsConfig?: any): Promise<Cart> {
        return super.retrieve(cartId, options, totalsConfig);
    }

    list(selector: FilterableCartProps, config?: FindConfig<Cart>): Promise<Cart[]> {
        return super.list(selector, config);
    }
}