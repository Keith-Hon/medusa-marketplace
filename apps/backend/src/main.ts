import { Medusa } from "medusa-extender";
import express from "express";
import { StoreModule } from "./modules/store/store.module";
import { UserModule } from "./modules/user/user.module";
import { ProductModule } from "./modules/product/product.module";
import { OrderModule } from "./modules/order/order.module";
import { InviteModule } from "./modules/invite/invite.module";
import { RoleModule } from "./modules/role/role.module";
import { PermissionModule } from "./modules/permission/permission.module";
import { CartModule } from "./modules/cart/cart.module";
import { RegionModule } from "./modules/region/region.module";
import { CustomerModule } from "./modules/customer/customer.module";

async function bootstrap() {
    const expressInstance = express();

    await new Medusa(__dirname + "/../", expressInstance).load([
        CustomerModule,
        RegionModule,
        CartModule,
        StoreModule,
        UserModule,
        ProductModule,
        OrderModule,
        InviteModule,
        RoleModule,
        PermissionModule
    ]);

    expressInstance.listen(9000, () => {
        console.info("Server successfully started on port 9000");
    });
}

bootstrap();
