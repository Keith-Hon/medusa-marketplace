import { EntityRepository } from 'typeorm';
import { CustomerRepository as MedusaCustomerRepository } from '@medusajs/medusa/dist/repositories/customer';
import { Repository as MedusaRepository, Utils } from 'medusa-extender';
import { Customer } from '../entities/customer.entity';

@MedusaRepository({ override: MedusaCustomerRepository })
@EntityRepository(Customer)
export default class CustomerRepository extends Utils.repositoryMixin<Customer, MedusaCustomerRepository>(MedusaCustomerRepository) {

}