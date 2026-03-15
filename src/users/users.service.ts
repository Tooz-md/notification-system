import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    // O TypeORM injeta o repositório da tabela users automaticamente
    // graças ao TypeOrmModule.forFeature([User]) que registramos no módulo
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Busca todos os usuários do banco
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Busca um usuário pelo id
  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // Cria um novo usuário no banco
  async create(dto: CreateUserDto): Promise<User> {
    // create() monta o objeto User com os dados do DTO
    const user = this.userRepository.create(dto);
    // save() persiste no banco e retorna o objeto com id preenchido
    return this.userRepository.save(user);
  }
}
