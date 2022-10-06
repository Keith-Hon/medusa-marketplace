import { Service } from "medusa-extender";
import CompanyRepository from "../repositories/company.repository";

type InjectedDependencies = {
    manager: EntityManager;
    companyRepository: typeof CompanyRepository;
};

@Service()
export class CompanyService {
    private readonly manager: EntityManager;
    private readonly companyRepository: typeof CompanyRepository;
    readonly container: InjectedDependencies;

    constructor(container: InjectedDependencies) {
        super(container);

        this.container = container;
        this.manager = container.manager;
        this.companyRepository = container.companyRepository;
    }
}
