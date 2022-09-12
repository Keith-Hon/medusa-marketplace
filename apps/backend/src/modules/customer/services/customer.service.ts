import { Service } from "medusa-extender";
import { CustomerService as MedusaCustomerService } from '@medusajs/medusa/dist/services';
import { FindConfig } from "@medusajs/medusa/dist/types/common";
import { Customer } from "medusa";

type InjectedDependencies = { manager, customerRepository, eventBusService, addressRepository, }

@Service({ scope: 'SCOPED', override: MedusaCustomerService })
export class CustomerService extends MedusaCustomerService {

    constructor({ manager, customerRepository, eventBusService, addressRepository }: InjectedDependencies) {
        super({ manager, customerRepository, eventBusService, addressRepository });
    }

    retrieveByEmail(email: string, config?: FindConfig<Customer>): Promise<Customer | never> {
        return super.retrieveByEmail(email, config);
    }

    retrieve(customerId: string, config?: FindConfig<Customer>): Promise<Customer> {
        return super.retrieve(customerId, config);
    }
}