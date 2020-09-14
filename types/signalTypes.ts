export interface TradingViewStrategySignal {
  exchangeDate: string;
  exchangeHour: string;
  exchangeTimezone: string;
  orderType: string;
  side: string;
  symbolCode: string;
  symbolId: string;
  symbolMinTick: string;
  exchangeId: string;
  signalPrice: string;
  entryName: string;
  channelPeriod: number;
  crossUnderLimit: number;
  crossUpperLimit: number;
  stopLossPercent: number;
}
