import { Permission } from "src/app/models/permission";
export class RolPermission {
    id: number;
    id_role: number;
    id_permission: number;
    permission:Permission;
    created_at: Date;
    updated_at: Date;
}