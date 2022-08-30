import { Service } from "medusa-extender";
import { RegionService as MedusaRegionService } from '@medusajs/medusa/dist/services';
import StoreService from "../../store/services/store.service";


type ConstructorParams = {
    manager, regionRepository,
    countryRepository, storeService, eventBusService, currencyRepository,
    paymentProviderRepository, fulfillmentProviderRepository, taxProviderRepository,
    paymentProviderService, fulfillmentProviderService
}

@Service({ scope: 'SCOPED', override: MedusaRegionService })
export class RegionService extends MedusaRegionService {

    private readonly storeService: typeof StoreService;

    constructor(readonly container: ConstructorParams) {
        super(container);
        this.storeService = container.storeService;
    }
}