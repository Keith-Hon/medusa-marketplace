import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { eventEmitter, Utils as MedusaUtils, OnMedusaEntityEvent } from "medusa-extender";
import { User } from "../entities/user.entity";

@EventSubscriber()
export default class UserSubscriber implements EntitySubscriberInterface<User> {
    static attachTo(connection: Connection): void {
        MedusaUtils.attachOrReplaceEntitySubscriber(connection, UserSubscriber);
    }

    public listenTo(): typeof User {
        return User;
    }

    public async beforeInsert(event: InsertEvent<User>): Promise<void> {
        return await eventEmitter.emitAsync(OnMedusaEntityEvent.Before.InsertEvent(User), {
            event,
            transactionalEntityManager: event.manager
        });
    }
}
