import { StoreService as MedusaStoreService } from '@medusajs/medusa/dist/services';
import { EntityManager } from 'typeorm';
import { CurrencyRepository } from '@medusajs/medusa/dist/repositories/currency';
import { Store } from '../entities/store.entity';
import { EntityEventType, Service, MedusaEventHandlerParams, OnMedusaEntityEvent } from 'medusa-extender';
import { User } from '../../user/entities/user.entity';
import EventBusService from '@medusajs/medusa/dist/services/event-bus';
import StoreRepository from '../repositories/store.repository';
import { FindConfig } from '@medusajs/medusa/dist/types/common';
import { Store as MedusaStore } from '@medusajs/medusa/dist';
import { Invite } from '../../invite/invite.entity';
import { buildQuery } from '@medusajs/medusa/dist/utils';

interface ConstructorParams {
    loggedInUser?: User;
    manager: EntityManager;
    storeRepository: typeof StoreRepository;
    currencyRepository: typeof CurrencyRepository;
    eventBusService: EventBusService;
}

@Service({ override: MedusaStoreService, scope: 'SCOPED' })
export default class StoreService extends MedusaStoreService {
    private readonly manager: EntityManager;
    private readonly storeRepository: typeof StoreRepository;

    constructor(readonly container: ConstructorParams) {
        super(container);
        this.manager = container.manager;
        this.storeRepository = container.storeRepository;
    }

    withTransaction(transactionManager?: EntityManager): StoreService {
        if (!transactionManager) {
            return this;
        }

        const cloned = new StoreService({
            ...this.container,
            manager: transactionManager,
        });

        cloned.transactionManager_ = transactionManager;
        return cloned;
    }

    @OnMedusaEntityEvent.Before.Insert(User, { async: true })
    public async createStoreForNewUser(
        params: MedusaEventHandlerParams<User, 'Insert'>
    ): Promise<EntityEventType<User, 'Insert'>> {
        const { event } = params;

        let store_id = Object.keys(this.container).includes("loggedInUser")
            ? this.container.loggedInUser.store_id
            : null;

        if (!store_id) {
            const createdStore = await this.withTransaction(event.manager).createForUser(event.entity);
            if (createdStore && createdStore.id) {
                store_id = createdStore.id;
            }

            // TODO: create store currencies and associate with the created store 
        }

        event.entity.store_id = store_id;
        return event;
    }

    public async createForUser(user: User): Promise<Store | void> {
        if (user.store_id) {
            // if the user has already been assigned a store_id
            return;
        }
        const storeRepo = this.manager.getCustomRepository(this.storeRepository);
        const store = storeRepo.create() as Store;
        return storeRepo.save(store);
    }

    public async retrieve(config?: FindConfig<MedusaStore>): Promise<MedusaStore> {
        if (!Object.keys(this.container).includes('loggedInUser')) {
            return super.retrieve(config);
        }

        const query = buildQuery({ id: this.container.loggedInUser.store_id }, config);
        const storeRepo = this.manager.getCustomRepository(this.storeRepository);
        const store = await storeRepo.findOne(query);

        if (!store) {
            throw new Error('Unable to find the user store');
        }

        return store;
    }

    @OnMedusaEntityEvent.Before.Insert(Invite, { async: true })
    public async addStoreToInvite(
        params: MedusaEventHandlerParams<Invite, 'Insert'>
    ): Promise<EntityEventType<Invite, 'Insert'>> {
        const { event } = params; //invite to be created is in event.entity
        const store_id = this.container.loggedInUser.store_id

        if (!event.entity.store_id && store_id) {
            event.entity.store_id = store_id;
        }

        return event;
    }
}