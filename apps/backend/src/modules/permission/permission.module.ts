import { Module } from "medusa-extender";
import { Permission } from "./permission.entity";
import { PermissionMigration1661408184620 } from "./1661408184620-permission.migration";
import { PermissionRepository } from "./permission.repository";

@Module({
    imports: [
        Permission,
        PermissionRepository,
        PermissionMigration1661408184620
    ]
})
export class PermissionModule { }