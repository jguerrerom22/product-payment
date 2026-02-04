import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './modules/product/domain/product.entity';
import { ProductModule } from './modules/product/product.module';
import { Transaction } from './modules/transaction/domain/transaction.entity';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Product, Transaction],
        synchronize: true, // Only for dev/test environments
      }),
      inject: [ConfigService],
    }),
    ProductModule,
    TransactionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
