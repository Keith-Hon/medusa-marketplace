import * as dedent from "dedent";

/**
 * Provide a basic template for the router component generation.
 * @param routerName
 */
export function getRouterTemplate(routerName: string): string {
    return dedent`
        import { MedusaAuthenticatedRequest, Router } from 'medusa-extender';
        import { UserService } from "@medusajs/medusa/dist/services";
        import { Response, NextFunction } from "express";
        import { User } from "medusa";
        
        @Router({
            routes: [{
                requiredAuth: true,
                path: '/admin/custom-route',
                method: 'get',
                handlers: [
                    async (req: MedusaAuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<User[]>> => {
                        /* You can create a function in a separate find and just imported it here. */
                        const userService = req.scope.resolve('userService') as UserService;
                        const users = await userService.list({})
                        return res.send(users);
                    }
                ]
            }] 
        })
        export class ${routerName} {}
    `;
}
