import { IsNumber, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  mensagem: string;
}
