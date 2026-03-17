import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<User, 'senhaHash'>> {
    // Verifica se já existe um usuário com este email
    const usuarioExistente = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (usuarioExistente) {
      // 409 Conflict — o recurso já existe
      throw new ConflictException('Email já cadastrado');
    }

    // Gera o hash da senha — nunca salvamos a senha original
    // 10 é o número de rounds — quanto maior mais seguro e mais lento
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    // Cria e salva o usuário com o hash
    const user = this.userRepository.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
    });

    const salvo = await this.userRepository.save(user);

    // Remove o senhaHash antes de retornar
    // nunca devolvemos dados de senha para o cliente
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senhaHash: _, ...resultado } = salvo;
    return resultado;
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // Busca o usuário pelo email
    // addSelect força o TypeORM a incluir senhaHash
    // mesmo com select: false na entidade
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.senhaHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) {
      // Mensagem genérica — não revelamos se o email existe ou não
      throw new UnauthorizedException('Credenciais invalidas');
    }

    // Compara a senha digitada com o hash do banco
    const senhaCorreta = await bcrypt.compare(dto.senha, user.senhaHash);

    if (!senhaCorreta) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    // Monta o payload do token JWT
    const payload = { sub: user.id, email: user.email };

    // Gera e retorna o token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
