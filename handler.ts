import { Handler } from "aws-lambda";
import { composeFuturesMarketEntrySignal } from "./libs/zignalyProviderServiceUtils";
import { responseSuccess, responseError } from "./libs/responseMessage";

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

const mapTradingViewSignalToZignaly = (
  signalData: TradingViewStrategySignal,
) => {
  const {
    orderType,
    side,
    symbolCode,
    stopLossPercent,
    exchangeId,
  } = signalData;
  const defaultPositionSizePercent: number = 3;
  const defaultStopLossPercentage: number = 2;
  const defaultLeverage: number = 1;
  const trailingStopPercentage: number = 2;
  const trailingStopDistancePercent: number = 2;
  const stopLossPercentageDigested = stopLossPercent
    ? stopLossPercent * 100
    : null;

  switch (signalData.orderType) {
    case "entry":
      return composeFuturesMarketEntrySignal(
        symbolCode,
        defaultPositionSizePercent,
        side,
        defaultLeverage,
        stopLossPercentageDigested || defaultStopLossPercentage,
        trailingStopPercentage,
        trailingStopDistancePercent,
      );
      break;

    default:
      break;
  }

  return null;
};

export const trading_view_strategy_signal: Handler = (event: any) => {
  const payload = event.body || "{}";
  const signalData = JSON.parse(payload);
  console.log("TV Signal: ", signalData);
  const zignalySignal = mapTradingViewSignalToZignaly(signalData);

  if (zignalySignal) {
    console.log("Zignaly Signal: ", zignalySignal);
    return responseSuccess("OK");
  } else {
    return responseError("KO", "Invalid Trading View signal received.");
  }
};
