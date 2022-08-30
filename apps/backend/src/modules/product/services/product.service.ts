import { EntityEventType, MedusaEventHandlerParams, OnMedusaEntityEvent, Service } from 'medusa-extender';
import { EntityManager } from "typeorm";
import { ProductService as MedusaProductService } from '@medusajs/medusa/dist/services';
import { Product } from '../entities/product.entity';
import { User } from '../../user/entities/user.entity';
import UserService from '../../user/services/user.service';
import { FilterableProductProps, FindProductConfig } from '@medusajs/medusa/dist/types/product';
import { FindConfig, Selector } from '@medusajs/medusa/dist/types/common';
import { FindWithoutRelationsOptions } from '@medusajs/medusa/dist/repositories/product';
import { Product as MedusaProduct } from '@medusajs/medusa/dist/models';
import ProductRepository from '../repositories/product.repository';
import { buildQuery } from '@medusajs/medusa/dist/utils';
import { MedusaError } from 'medusa-core-utils';

type ConstructorParams = {
    manager: any;
    loggedInUser?: User;
    productRepository: any;
    productVariantRepository: any;
    productOptionRepository: any;
    eventBusService: any;
    productVariantService: any;
    productCollectionService: any;
    productTypeRepository: any;
    productTagRepository: any;
    imageRepository: any;
    searchService: any;
    userService: UserService;
    featureFlagRouter: any
}

@Service({ scope: 'SCOPED', override: MedusaProductService })
export class ProductService extends MedusaProductService {
    readonly manager: EntityManager;
    private readonly productRepository: typeof ProductRepository;

    constructor(readonly container: ConstructorParams) {
        super(container);
        this.manager = container.manager;
        this.productRepository = container.productRepository;
    }

    public async retrieve(productId: string, config?: FindConfig<Product>): Promise<Product> {

        const productRepo = this.manager.getCustomRepository(this.productRepository);
        const validatedId = productId;
        const query = buildQuery({ id: validatedId }, config);
        const product = await productRepo.findOne(query);

        if (!product) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product with id: ${productId} was not found`);
        }

        return product as Product;
    }

    retrieveByHandle(productHandle: string, config?: FindProductConfig): Promise<MedusaProduct> {
        return super.retrieveByHandle(productHandle, config);
    }

    retrieveByExternalId(externalId: string, config?: FindProductConfig): Promise<MedusaProduct> {
        return super.retrieveByExternalId(externalId, config);
    }

    retrieve_(selector: Selector<Product>, config?: FindProductConfig): Promise<MedusaProduct> {
        return super.retrieve_(selector, config);
    }

    list(selector?: FilterableProductProps | Selector<Product>, config?: FindProductConfig): Promise<MedusaProduct[]> {
        return super.list(selector, config);
    }

    listAndCount(selector?: FilterableProductProps | Selector<MedusaProduct>, config?: FindProductConfig): Promise<[MedusaProduct[], number]> {
        if (config.relations) {
            config.relations.push("store");
        } else {
            config.relations = ['store'];
        }
        return super.listAndCount(selector, config);
    }

    prepareListQuery_(selector: FilterableProductProps | Selector<MedusaProduct>, config: FindProductConfig): {
        q: string;
        relations: (keyof MedusaProduct)[];
        query: FindWithoutRelationsOptions;
    } {

        if (Object.keys(this.container).includes('loggedInUser')) {
            const loggedInUser = this.container.loggedInUser
            if (loggedInUser) {
                selector['store_id'] = loggedInUser.store_id
            }
        }

        return super.prepareListQuery_(selector, config);
    }

    @OnMedusaEntityEvent.Before.Insert(Product, { async: true })
    public async attachStoreToProduct(
        params: MedusaEventHandlerParams<Product, 'Insert'>
    ): Promise<EntityEventType<Product, 'Insert'>> {
        const { event } = params;
        const loggedInUser = this.container.loggedInUser;
        event.entity.store_id = loggedInUser.store_id;
        return event;
    }

}