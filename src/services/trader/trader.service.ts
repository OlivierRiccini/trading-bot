import { Injectable } from '@nestjs/common';
import { FILL_ORDER_ABI } from 'src/config/ABIs/fill-order';
import { ADDRESS, GAS_LIMIT, GAS_PRICE } from 'src/config/config';
import { playSound, toBN, toHex, toTokens, toWei } from 'src/utils/utils';
import { Web3Service } from '../web3/web3.service';

@Injectable()
export class TraderService {

    constructor(private web3Service: Web3Service) { }

    public async trade(
        flashTokenSymbol: string,
        flashTokenAddress: string,
        arbTokenAddress: string,
        orderJson: any,
        fillAmount: number,
        oneSplitData: any
        ) {

        try {
          const FLASH_AMOUNT = toTokens('100', flashTokenSymbol); // 100 WETH
          const FROM_TOKEN = flashTokenAddress // WETH
          const FROM_AMOUNT = fillAmount // '1000000'
          const TO_TOKEN = arbTokenAddress
      
          const ONE_SPLIT_SLIPPAGE = '0.995';
      
          const orderTuple = [
            orderJson.makerAddress,
            orderJson.takerAddress,
            orderJson.feeRecipientAddress,
            orderJson.senderAddress,
            orderJson.makerAssetAmount,
            toBN(orderJson.takerAssetAmount),
            orderJson.makerFee,
            orderJson.takerFee,
            orderJson.expirationTimeSeconds,
            orderJson.salt,
            orderJson.makerAssetData,
            orderJson.takerAssetData,
            orderJson.makerFeeAssetData,
            orderJson.takerFeeAssetData
          ];
      
          // Format ZRX function call data
          const takerAssetFillAmount = FROM_AMOUNT;
          const signature = orderJson.signature;
          const data = this.web3Service.web3.eth.abi.encodeFunctionCall(FILL_ORDER_ABI, [orderTuple, takerAssetFillAmount, signature]);
        
          const minReturn = oneSplitData.returnAmount;
          const distribution = oneSplitData.distribution;
      
          // Calculate slippage
          const minReturnWtihSplippage = (toBN(minReturn)).mul(toBN('995')).div(toBN('1000')).toString();
            
          // Perform Trade
          const receipt = await this.web3Service.traderContract.methods.getFlashloan(
            flashTokenAddress, // address flashToken,
            FLASH_AMOUNT, // uint256 flashAmount,
            arbTokenAddress, // address arbToken,p
            data, // bytes calldata zrxData,
            minReturnWtihSplippage.toString(), // uint256 oneSplitMinReturn,
            distribution, // uint256[] calldata oneSplitDistribution
          ).send({
            from: ADDRESS,
            gas: +GAS_LIMIT,
            // gasPrice: toWei(GAS_PRICE, 'gwei')
          });
          playSound();
          playSound();
          playSound();
          playSound();
          playSound();
          console.log(receipt);
        } catch(err) {
          playSound();
          playSound();
          console.error('ERROR TRADER SERVICE => ', err);
        }
    }

}
