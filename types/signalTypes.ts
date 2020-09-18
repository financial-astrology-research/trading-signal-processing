export interface TradingViewStrategySignal {
  date: string;
  hour: string;
  timezone: string;
  orderType: string;
  action: string;
  side: string;
  symbolCode: string;
  symbolId: string;
  symbolMinTick: string;
  exchangeId: string;
  signalPrice: string;
  indicatorType: string;
  indicatorPeriod: number;
  stopLossPercent: number;
  trailingStopTriggerPercent: number;
  trailingStopShortPercent: number;
  trailingStopLongPercent: number;
  providerEnvKey: string;
}
