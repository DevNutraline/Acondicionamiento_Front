import { RolPermission } from "src/app/models/rol-permission";
export class Rol {
    id: number;
    name: string;
    descriptions: string;
    role_permissions: RolPermission[];
    created_at: Date;
    updated_at: Date;
}