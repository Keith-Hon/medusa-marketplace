import { Module } from "medusa-extender";
import { Company } from "./entities/company.entity";
import CompanyRepository from "./repositories/company.repository";
import { CompanyService } from "./services/company.service";
import { CompanyRouter } from "./routers/company.router";
import AttachCompanySubscriberMiddleware from "./middlewares/company.middleware";

@Module({
    imports: [Company, CompanyRepository, CompanyService, CompanyRouter, AttachCompanySubscriberMiddleware]
})
export class CompanyModule {}
