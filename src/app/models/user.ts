import { Rol } from "src/app/models/rol";
export class Status {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
}
export class User {
    id: number;
    name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    id_rol: number; 
    rol: Rol; 
    status: Status; 
    created_at: Date;
    updated_at: Date;
}
