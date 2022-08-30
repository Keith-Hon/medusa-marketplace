import { Customer as MedusaCustomer } from '@medusajs/medusa/dist';
import { Entity } from 'typeorm';
import { Entity as MedusaEntity } from 'medusa-extender';

@MedusaEntity({ override: MedusaCustomer })
@Entity()
export class Customer extends MedusaCustomer {

}