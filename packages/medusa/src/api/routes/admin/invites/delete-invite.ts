import InviteService from "../../../../services/invite"
import { EntityManager } from "typeorm"

/**
 * @oas [delete] /invites/{invite_id}
 * operationId: "DeleteInvitesInvite"
 * summary: "Create an Invite"
 * description: "Creates an Invite and triggers an 'invite' created event"
 * x-authenticated: true
 * parameters:
 *   - (path) invite_id=* {string} The id of the Invite
 * tags:
 *   - Invites
 * responses:
 *   200:
 *     description: OK
 */
export default async (req, res) => {
  const { invite_id } = req.params

  const inviteService: InviteService = req.scope.resolve("inviteService")
  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    await inviteService.withTransaction(transactionManager).delete(invite_id)
  })

  res.status(200).send({
    id: invite_id,
    object: "invite",
    deleted: true,
  })
}
