import { Injectable } from '@nestjs/common';
import { DAI, USDC, WETH } from 'src/config/symbols/assets';
import { displayTokens, now, playSound } from 'src/utils/utils';
import { ASSET_ADDRESSES } from 'src/config/adresses/adresses';
import axios from 'axios';
import { Web3Service } from '../web3/web3.service';
import { ESTIMATED_GAS, GAS_PRICE } from 'src/config/config';
import { TraderService } from '../trader/trader.service';

@Injectable()
export class ArbitrageService {
    private checkingMarkets = false;
    private checkedOrders = [];
    public profitableArbFound = false

    constructor(private web3Serivce: Web3Service, private traderService: TraderService) { }
    
    public async checkMarkets(): Promise<void> {
        if(this.checkingMarkets) {
            return;
        }

        // Stop checking markets if already found
        // if(this.profitableArbFound) {
        //     clearInterval(marketChecker)
        // }

        console.log(`Fetching market data @ ${now()} ...\n`);
        this.checkingMarkets = true;
        try {
            await this.checkOrderBook(WETH, DAI);
        } catch (error) {
            console.error(error);
            this.checkingMarkets = false;
            return;
        }

        this.checkingMarkets = false;
    }

    private async checkOrderBook(baseAssetSymbol: string, quoteAssetSymbol: string) {
        const baseAssetAddress = ASSET_ADDRESSES[baseAssetSymbol].substring(2,42);
        const quoteAssetAddress = ASSET_ADDRESSES[quoteAssetSymbol].substring(2,42);
        const apiUrl = `https://api.0x.org/sra/v3/orderbook?baseAssetData=0xf47261b0000000000000000000000000${baseAssetAddress}&quoteAssetData=0xf47261b0000000000000000000000000${quoteAssetAddress}&perPage=1000`;
        const zrxResponse = await axios.get(apiUrl);
        const zrxData = zrxResponse.data;
        const bids = zrxData.bids.records;
        bids.forEach((o) => {
          this.checkArb({ zrxOrder: o.order, assetOrder: [baseAssetSymbol, quoteAssetSymbol, baseAssetSymbol] }) // E.G. WETH, DAI, WETH
        });
    }

    private async checkArb(args) {
        const { assetOrder, zrxOrder } = args
      
        // Track order
        const tempOrderID = JSON.stringify(zrxOrder);
      
        // Skip if order checked
        if(this.checkedOrders.includes(tempOrderID)) {
        //   console.log('Order already checked', tempOrderID);
          return; // Don't log
        }
      
        // Add to checked orders
        this.checkedOrders.push(tempOrderID);
      
        // Skip if Maker Fee
        if(zrxOrder.makerFee.toString() !== '0') {
          console.log('Order has maker fee');
          return;
        }
      
        // Skip if Taker Fee
        if(zrxOrder.takerFee.toString() !== '0') {
          console.log('Order has taker fee');
          return;
        }
      
        // This becomes the input amount
        const inputAssetAmount = +zrxOrder.takerAssetAmount;
      
        // Build order tuple
        const orderTuple = [
          zrxOrder.makerAddress,
          zrxOrder.takerAddress,
          zrxOrder.feeRecipientAddress,
          zrxOrder.senderAddress,
          zrxOrder.makerAssetAmount,
          zrxOrder.takerAssetAmount,
          zrxOrder.makerFee,
          zrxOrder.takerFee,
          zrxOrder.expirationTimeSeconds,
          zrxOrder.salt,
          zrxOrder.makerAssetData,
          zrxOrder.takerAssetData,
          zrxOrder.makerFeeAssetData,
          zrxOrder.takerFeeAssetData
        ];
      
        // Fetch order status
        const orderInfo = await this.web3Serivce.zrxExchangeContract.methods.getOrderInfo(orderTuple).call();
      
        if(orderInfo.orderTakerAssetFilledAmount.toString() !== '0') {
          console.log('Order partially filled');
          return;
        }
      
        // Fetch 1Split Data
        const oneSplitData = await this.fetchOneSplitData({
          fromToken: ASSET_ADDRESSES[assetOrder[1]],
          toToken: ASSET_ADDRESSES[assetOrder[2]],
          amount: zrxOrder.makerAssetAmount,
        });
      
        // This becomes the outputAssetAmount
        const outputAssetAmount = +oneSplitData.returnAmount;
      
        // Calculate estimated gas cost
        let estimatedGasFee = +ESTIMATED_GAS * +this.web3Serivce.web3.utils.toWei(GAS_PRICE.toString(), 'gwei');
        estimatedGasFee = +this.web3Serivce.web3.utils.fromWei(estimatedGasFee.toString(), 'ether');
      
        // Calculate net profit
        let netProfit = outputAssetAmount - inputAssetAmount - estimatedGasFee;
        netProfit = Math.floor(netProfit); // Round down
      
        // Determine if profitable
        const profitable = netProfit.toString() > '0';
        
        // If profitable, then stop looking and trade!
        if(profitable) {
          // Skip if another profitable arb has already been found
          if(this.profitableArbFound) {
            console.log('this.profitableArbFound => ', this.profitableArbFound);
            return;
          }
      
          // Tell the app that a profitable arb has been found
          this.profitableArbFound = true;
      
          // Log the arb
          console.table([{
            'Profitable?': profitable,
            'Asset Order': assetOrder.join(', '),
            'Exchange Order': 'ZRX, 1Split',
            'Input': displayTokens(inputAssetAmount.toString(), assetOrder[0]).padEnd(22, ' '),
            'Output': displayTokens(outputAssetAmount.toString(), assetOrder[0]).padEnd(22, ' '),
            'Profit': displayTokens(netProfit.toString(), assetOrder[0]).padEnd(22, ' '),
            'Timestamp': now(),
          }]);
      
          // Play alert tone
          playSound();
          
          // Call arb contract
          await this.traderService.trade(
              assetOrder[0],
              ASSET_ADDRESSES[assetOrder[0]],
              ASSET_ADDRESSES[assetOrder[1]],
              zrxOrder,
              inputAssetAmount,
              oneSplitData
            )
        }
    }

    private async fetchOneSplitData(args) {
        const ONE_SPLIT_PARTS = 10;
        const ONE_SPLIT_FLAGS = 0;
        const { fromToken, toToken, amount } = args;
        const data = await this.web3Serivce.oneSplitContract.methods.getExpectedReturn(fromToken, toToken, amount, ONE_SPLIT_PARTS, ONE_SPLIT_FLAGS).call();
        return(data);
    }
}
