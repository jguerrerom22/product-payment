import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './modules/product/domain/product.entity';
import { ProductModule } from './modules/product/product.module';
import { Transaction } from './modules/transaction/domain/transaction.entity';
import { TransactionModule } from './modules/transaction/transaction.module';
import { Customer } from './modules/customer/domain/customer.entity';
import { CustomerModule } from './modules/customer/customer.module';
import { Delivery } from './modules/delivery/domain/delivery.entity';
import { DeliveryModule } from './modules/delivery/delivery.module';
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
        entities: [Product, Transaction, Customer, Delivery],
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/migrations/*.js'],
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        extra: configService.get<string>('DB_SSL') === 'true' ? {
          ssl: {
            rejectUnauthorized: false,
          },
        } : {},
      }),
      inject: [ConfigService],
    }),
    ProductModule,
    TransactionModule,
    CustomerModule,
    DeliveryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
