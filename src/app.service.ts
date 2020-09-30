import { Injectable } from '@nestjs/common';
import { ArbitrageService } from './services/arbitrage/arbitrage.service';
import { playSound } from './utils/utils';

@Injectable()
export class AppService {

  constructor(
    private arbitrageService: ArbitrageService
  ) {
    this.bootTradingBot();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private bootTradingBot(): void {
    playSound();

    const marketChecker = setInterval(async () => {
      if (this.arbitrageService.profitableArbFound) {
        clearInterval(marketChecker);
      }
      await this.arbitrageService.checkMarkets();
    }, 3000);
  }
}
