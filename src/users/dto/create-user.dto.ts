import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
