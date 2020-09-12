import { Handler } from "aws-lambda";
import { isObject } from "lodash";
import {
  composeFuturesMarketEntrySignal,
  postSignal,
} from "./libs/zignalyProviderServiceUtils";
import { responseSuccess, responseError } from "./libs/responseMessage";
import filterSignalManager from "./libs/filterSignalManagerService";
import { filterSignalDailyCsvIndicator } from "./libs/filterSignalUtils";

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
  const defaultPositionSizePercent: number = 2;
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

  throw new Error("Invalid Trading View strategy signal received.");
};

export const trading_view_strategy_signal: Handler = async (event: any) => {
  const payload = event.body || "{}";
  const signalData = JSON.parse(payload);
  console.log("TV Signal: ", signalData);

  try {
    const filterCheck = await filterSignalDailyCsvIndicator(signalData);
    const zignalySignal = mapTradingViewSignalToZignaly(signalData);

    // Post to Zignaly if filter checks passed.
    if (filterCheck && isObject(zignalySignal)) {
      postSignal(zignalySignal);
    } else {
      console.log("Ignored signal due to not pass filtering checks.");
    }

    return responseSuccess("OK");
  } catch (e) {
    console.error("ERROR: ", e);
  }

  return responseError("KO", "Error processing Trading View strategy signal.");
};
