import { AttachUserSubscriberMiddleware } from './middlewares/userSubscriber.middleware';
import { UserMigration1661408010608 } from './1661408010608-user.migration';
import { LoggedInUserMiddleware } from "./middlewares/loggedInUser.middleware";
import { Module } from 'medusa-extender';
import { User } from './entities/user.entity';
import UserRepository from './repositories/user.repository';
import { UserRouter } from "./routers/user.router";
import UserService from './services/user.service';
import addStoreIdToUser1644946220401 from './user.migration';

@Module({
    imports: [
        User,
        UserService,
        UserRepository,
        addStoreIdToUser1644946220401,
        UserRouter,
        LoggedInUserMiddleware,
        AttachUserSubscriberMiddleware,
        UserMigration1661408010608]
})
export class UserModule { }