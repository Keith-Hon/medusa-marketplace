import { EntityRepository, Repository } from "typeorm";
import { Repository as MedusaRepository } from "medusa-extender";

import { Company } from "../entities/company.entity";

@MedusaRepository()
@EntityRepository(Company)
export default class CompanyRepository extends Repository<Company> {}
