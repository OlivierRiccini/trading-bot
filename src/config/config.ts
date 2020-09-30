import * as dotenv from "dotenv";

dotenv.config();
let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../.env.test`;
    break;
  case "production":
    path = `${__dirname}/../../.env.production`;
    break;
  default:
    path = `${__dirname}/../../.env.development`;
}

dotenv.config({ path: path });

export const RPC_URL = process.env.RPC_URL;
export const ADDRESS = process.env.ADDRESS;
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
export const GAS_LIMIT = process.env.GAS_LIMIT;
export const GAS_PRICE = process.env.GAS_PRICE;
export const ESTIMATED_GAS = process.env.ESTIMATED_GAS;
