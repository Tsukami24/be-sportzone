import { IsString, IsEmail, MinLength } from "class-validator";

export class RegisterDto{
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsEmail()
    @MinLength(6)
    password: string;
}