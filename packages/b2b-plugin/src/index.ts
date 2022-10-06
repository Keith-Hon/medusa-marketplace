import { Module } from "medusa-extender";
import { CompanyModule } from "./modules/company/company.module";

@Module({
    imports: [CompanyModule]
})
export class B2BPlugin {}
