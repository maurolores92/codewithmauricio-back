import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class SignInAuthDto {
    
    @IsEmail({}, { message: "El email no es válido" })
    email: string;

    @IsString({ message: "La contraseña debe ser válida" })
    @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })  
    @MaxLength(20, { message: "La contraseña no debe superar los 20 caracteres" })
    password: string;
}