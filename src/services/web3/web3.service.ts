import { Injectable } from '@nestjs/common';
import { PRIVATE_KEY, RPC_URL } from 'src/config/config';
const Web3 = require("web3");
import { ONE_SPLIT_ADDRESS, TRADER_ADDRESS, ZRX_EXCHANGE_ADDRESS } from 'src/config/adresses/adresses';
import { ONE_SPLIT_ABI } from 'src/config/ABIs/one-split';
import { ZRX_EXCHANGE_ABI } from 'src/config/ABIs/zrx-exchange';
import { TRADER_ABI } from 'src/config/ABIs/trader';

@Injectable()
export class Web3Service {
  public web3: any;
  public oneSplitContract: any;
  public zrxExchangeContract: any;
  public traderContract: any;

  constructor() {
    this.initWeb3();
    this.initContracts();
  }

  private initWeb3(): void {
    this.web3 = new Web3(RPC_URL);
    this.web3.eth.accounts.wallet.add(PRIVATE_KEY);
  }

  private initContracts(): void {
    this.oneSplitContract = new this.web3.eth.Contract(ONE_SPLIT_ABI, ONE_SPLIT_ADDRESS);
    this.zrxExchangeContract = new this.web3.eth.Contract(ZRX_EXCHANGE_ABI, ZRX_EXCHANGE_ADDRESS);
    this.traderContract = new this.web3.eth.Contract(TRADER_ABI, TRADER_ADDRESS);
  }

}
