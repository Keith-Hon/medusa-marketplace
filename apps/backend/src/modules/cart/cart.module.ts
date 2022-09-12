import { Module } from "medusa-extender";
import { CartService } from "./cart.service";

@Module({
    imports: [CartService]
})
export class CartModule {}
