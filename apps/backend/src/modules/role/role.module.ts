import { Module } from "medusa-extender";
import { Role } from "./role.entity";
import { RoleMigration1661407989236 } from './1661407989236-role.migration';
import { RoleRepository } from "./role.repository";

@Module({
    imports: [
        Role,
        RoleRepository,
        RoleMigration1661407989236
    ]
})
export class RoleModule { }