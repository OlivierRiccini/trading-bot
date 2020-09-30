export interface IArbitrageResult {
    lowest: IPairPrice;
    highest: IPairPrice;
    pairPrices: IPairPrice[];
}

export interface IPairPrice {
    exchange: string;
    fromToken: string;
    toToken: string;
    price: number;
}