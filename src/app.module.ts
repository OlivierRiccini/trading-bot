import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArbitrageService } from './services/arbitrage/arbitrage.service';
import { FlashLoanService } from './services/flash-loan/flash-loan.service';
import { TraderService } from './services/trader/trader.service';
import { Web3Service } from './services/web3/web3.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService, ArbitrageService, FlashLoanService, TraderService, Web3Service],
})
export class AppModule {}
