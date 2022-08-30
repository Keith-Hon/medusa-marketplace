import { Invite } from "./invite.entity";
import { InviteMigration1661406956529 } from './1661406956529-invite.migration';
import { InviteRepository } from './invite.repository';
import { InviteService } from './invite.service';
import { Module } from "medusa-extender";
import { AttachInviteSubscriberMiddleware } from "./inviteSubscriber.middleware";
import { AcceptInviteRouter } from "./invite.router";

@Module({
    imports: [
        Invite,
        InviteRepository,
        InviteService,
        InviteMigration1661406956529,
        AttachInviteSubscriberMiddleware,
        AcceptInviteRouter]
})
export class InviteModule { }