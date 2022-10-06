import { Router } from "medusa-extender";
import routeHandlerController from "../controllers/company.controller";

@Router({
    routes: [
        {
            requiredAuth: false,
            path: "/admin/company/example",
            method: "post",
            handlers: [routeHandlerController]
        }
    ]
})
export class CompanyRouter {}
