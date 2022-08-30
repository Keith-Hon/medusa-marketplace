import { MedusaAuthenticatedRequest, MedusaMiddleware, Middleware } from 'medusa-extender';
import { NextFunction, Response } from 'express';
import UserService from '../../user/services/user.service';
import jwt_decode from "jwt-decode";

@Middleware({ requireAuth: true, routes: [{ method: "all", path: '/admin/*' }] })
export class LoggedInUserMiddleware implements MedusaMiddleware {
    public async consume(req: MedusaAuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {

        let userId;

        if (req.user && req.user.userId) {
            userId = req.user.userId;
        } else if (req.session.jwt) {
            const decoded = jwt_decode(req.session.jwt);
            userId = decoded['userId'];
        }

        if (userId) {
            const userService = req.scope.resolve('userService') as UserService;
            const loggedInUser = await userService.retrieve(userId, {
                select: ['id', 'store_id'],
            });
            req.scope.register({
                loggedInUser: {
                    resolve: () => loggedInUser,
                },
            });
        }

        next();
    }
}