import { Body, Controller, Post, Get, Param, ParseUUIDPipe, NotFoundException, Query } from '@nestjs/common';
import { CreateTransactionUseCase, CreateTransactionDto } from '../application/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from '../application/check-transaction-status.use-case';
import { Transaction } from '../domain/transaction.entity';
import { TransactionRepository, TRANSACTION_REPOSITORY } from '../domain/transaction.repository';
import { Inject } from '@nestjs/common';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly checkTransactionStatusUseCase: CheckTransactionStatusUseCase,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.createTransactionUseCase.execute(createTransactionDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
       throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  @Get(':id/status')
  async getStatus(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
    return this.checkTransactionStatusUseCase.execute(id);
  }

  @Get()
  async findMany(
    @Query('status') status?: any,
    @Query('customer_id') customer_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ): Promise<Transaction[]> {
    return this.transactionRepository.findAll({
      status,
      customer_id,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
    });
  }
}
