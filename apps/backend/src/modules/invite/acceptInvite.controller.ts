import { AdminPostInvitesInviteAcceptReq } from "medusa"
import { InviteService } from './invite.service';
import { MedusaError } from 'medusa-core-utils';
import UserService from '../user/services/user.service';
import { validator } from "@medusajs/medusa/dist/utils/validator"
import { EntityManager } from "typeorm";

export default async (req, res) => {

    const validated = await validator(AdminPostInvitesInviteAcceptReq, req.body);
    const inviteService: InviteService = req.scope.resolve(InviteService.resolutionKey);
    const manager: EntityManager = req.scope.resolve("manager");

    await manager.transaction(async (m) => {
        //retrieve invite
        let decoded;
        try {
            decoded = inviteService.withTransaction(m).verifyToken(validated.token);
        } catch (err) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Token is not valid"
            );
        }

        const invite = await inviteService.withTransaction(m).retrieve(decoded.invite_id);

        const store_id = invite ? invite.store_id : null;

        const user = await inviteService
            .withTransaction(m)
            .accept(validated.token, validated.user);

        if (store_id) {
            const userService: UserService = req.scope.resolve("userService");
            await userService.withTransaction(m).addUserToStore(user.id, store_id);
            res.sendStatus(200);
        } else {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `No store id assocaited with the invite of id: ${decoded.invite_id}`
            );
        }
    });
}