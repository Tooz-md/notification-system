import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Notification, NotificationStatus } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  // Logger mostra mensagens organizadas no terminal
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Busca todas as notificações
  findAll(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }

  // Busca uma notificação pelo id
  findOne(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { id } });
  }

  // Cria uma notificação — status 'pendente' por padrão
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      titulo: dto.titulo,
      mensagem: dto.mensagem,
      // status não precisa ser passado — o banco usa o default 'pendente'
    });
    return this.notificationRepository.save(notification);
  }

  // Cron job — roda a cada 1 minuto
  @Cron('*/1 * * * *')
  async processarNotificacoesPendentes(): Promise<void> {
    this.logger.log('Verificando notificacoes pendentes...');

    // Busca todas as notificações com status pendente
    const pendentes = await this.notificationRepository.find({
      where: { status: NotificationStatus.PENDING },
    });

    if (pendentes.length === 0) {
      this.logger.log('Nenhuma notificacao pendente.');
      return;
    }

    this.logger.log(
      `${pendentes.length} notificacao(oes) pendente(s) encontrada(s).`,
    );

    // Para cada notificação pendente
    for (const notification of pendentes) {
      this.logger.log(
        `Processando notificacao #${notification.id} para userId ${notification.userId}`,
      );

      // Atualiza o status para enviada
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.SENT,
      });

      this.logger.log(`Notificacao #${notification.id} marcada como enviada.`);
    }
  }
}
