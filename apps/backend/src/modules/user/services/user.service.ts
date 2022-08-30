import { Service } from 'medusa-extender';
import { EntityManager } from 'typeorm';
import EventBusService from '@medusajs/medusa/dist/services/event-bus';
import { FindConfig, Selector } from '@medusajs/medusa/dist/types/common';
import { UserService as MedusaUserService } from '@medusajs/medusa/dist/services';
import { buildQuery, validateId } from '@medusajs/medusa/dist/utils';
import { User } from '../entities/user.entity';
import UserRepository from '../repositories/user.repository';
import { MedusaError } from 'medusa-core-utils';
import { FilterableUserProps } from '@medusajs/medusa/dist/types/user';
import { User as MedusaUser } from '@medusajs/medusa/dist/models';
import { FindWithoutRelationsOptions } from '@medusajs/medusa/dist/repositories/product';

type ConstructorParams = {
    manager: EntityManager;
    userRepository: typeof UserRepository;
    eventBusService: EventBusService;
    loggedInUser?: User;
};

@Service({ scope: 'SCOPED', override: MedusaUserService })
export default class UserService extends MedusaUserService {
    private readonly manager: EntityManager;
    private readonly userRepository: typeof UserRepository;
    private readonly eventBus: EventBusService;

    constructor(readonly container: ConstructorParams) {
        super(container);
        this.manager = container.manager;
        this.userRepository = container.userRepository;
        this.eventBus = container.eventBusService;
    }

    // Also, add the withTransaction method to override the parent’s method and make sure it returns the custom user service:
    withTransaction(transactionManager: EntityManager): UserService {
        if (!transactionManager) {
            return this;
        }

        const cloned = new UserService({
            ...this.container,
            manager: transactionManager
        });

        cloned.transactionManager_ = transactionManager;
        return cloned;
    }

    list(selector: FilterableUserProps): Promise<MedusaUser[]> {
        if (Object.keys(this.container).includes('loggedInUser')) {
            const loggedInUser = this.container.loggedInUser
            if (loggedInUser) {
                selector['store_id'] = loggedInUser.store_id
            }
        }
        return super.list(selector);
    }

    public async retrieve(userId: string, config?: FindConfig<User>): Promise<User> {
        const userRepo = this.manager.getCustomRepository(this.userRepository);
        const validatedId = validateId(userId);

        if (Object.keys(this.container).includes('loggedInUser') && this.container.loggedInUser.store_id) {
            config['store_id'] = this.container.loggedInUser.store_id;
        }

        const query = buildQuery({ id: validatedId }, config);
        const user = await userRepo.findOne(query);

        if (!user) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, `User with id: ${userId} was not found`);
        }

        return user as User;
    }

    public async addUserToStore(user_id, store_id) {
        await this.atomicPhase_(async (m) => {
            const userRepo = m.getCustomRepository(this.userRepository);
            const query = buildQuery({ id: user_id });

            const user = await userRepo.findOne(query);
            if (user) {
                user.store_id = store_id;
                await userRepo.save(user);
            }
        })
    }

}