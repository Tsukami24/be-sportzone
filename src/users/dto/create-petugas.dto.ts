import { IsString, IsEmail, MinLength } from "class-validator";

export class CreatePetugasDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;
}