import { Module } from 'medusa-extender';
import { Customer } from './entities/customer.entity';
import CustomerRepository from './repositories/customer.repository';
import { CustomerService } from './services/customer.service';

@Module({
    imports: [CustomerService, CustomerRepository, Customer]
})

export class CustomerModule { }