import { Store as MedusaStore } from '@medusajs/medusa/dist';
import { Entity, JoinColumn, OneToMany } from 'typeorm';
import { Entity as MedusaEntity } from 'medusa-extender';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Order } from '../../order/order.entity';
import { Invite } from './../../invite/invite.entity';
import { Role } from '../../role/role.entity';

@MedusaEntity({ override: MedusaStore })
@Entity()
export class Store extends MedusaStore {
    @OneToMany(() => User, (user) => user.store)
    @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
    members: User[];

    @OneToMany(() => Product, (product) => product.store)
    @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
    products: Product[];

    @OneToMany(() => Order, (order) => order.store)
    @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
    orders: Order[];

    @OneToMany(() => Invite, (invite) => invite.store)
    @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
    invites: Invite[];

    @OneToMany(() => Role, (role) => role.store)
    @JoinColumn({ name: 'id', referencedColumnName: 'store_id' })
    roles: Role[];
}