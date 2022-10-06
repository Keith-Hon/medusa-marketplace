import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { OnMedusaEntityEvent, Utils, eventEmitter } from "medusa-extender";
import { Company } from "../entities/company.entity";

@EventSubscriber()
export default class CompanySubscriber implements EntitySubscriberInterface<Company> {
    static attachTo(connection: Connection): void {
        Utils.attachOrReplaceEntitySubscriber(connection, CompanySubscriber);
    }

    public listenTo(): typeof Company {
        return Company;
    }

    public async beforeInsert(event: InsertEvent<Company>): Promise<void> {
        return await eventEmitter.emitAsync(OnMedusaEntityEvent.Before.InsertEvent(Company), {
            event,
            transactionalEntityManager: event.manager
        });
    }
}
