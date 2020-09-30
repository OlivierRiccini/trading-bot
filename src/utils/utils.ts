import moment from 'moment-timezone';
import { DAI, USDC, WETH } from 'src/config/symbols/assets';
const Web3 = require("web3");
const web3 = new Web3();

const player = require('play-sound')();

export const now = () => (moment().tz('America/Chicago').format());

export const playSound = () => {
  const SOUND_FILE = 'src/assets/ding.mp3';
  player.play(SOUND_FILE, (err) => {
    if(err) {
      console.error('Error playing sound!', err);
    }
  })
}

export const toTokens = (tokenAmount: string, symbol: string) => {
  switch (symbol) {
    case DAI: // 18 decimals
      return web3.utils.toWei(tokenAmount, 'ether');
    case WETH: // 18 decimals
      return web3.utils.toWei(tokenAmount, 'ether');
    case USDC: // 6 decimals
      return web3.utils.fromWei(web3.utils.toWei(tokenAmount), 'szabo');
  }
}

export const displayTokens = (amount: string, symbol: string): string  => {
  let tokens: string;
  tokens = tokensWithDecimalPlaces(amount, symbol);
  return(tokens);
}

export const  tokensWithDecimalPlaces = (amount: string, symbol: string): string => {
  amount = amount.toString();
  switch (symbol) {
    case DAI: // 18 decimals
      return web3.utils.fromWei(amount, 'ether');
    default:
      return web3.utils.fromWei(amount, 'ether');
  }
}

export const toHex = (el: string | number) => web3.utils.toHex(el);

export const toBN = (el: string | number) => web3.utils.toBN(el);
