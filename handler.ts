import { Handler } from "aws-lambda";
import { isObject, isEmpty, isNumber, inRange } from "lodash";
import {
  composeFuturesMarketEntrySignal,
  composeFuturesMarketExitSignal,
  postSignal,
} from "./libs/zignalyProviderServiceUtils";
import { responseSuccess, responseError } from "./libs/responseMessage";
import filterSignalManager from "./libs/filterSignalManagerService";
import { filterSignalDailyCsvIndicator } from "./libs/filterSignalUtils";
import { TradingViewStrategySignal } from "./types/signalTypes";

const getPositionParamDefaults = () => {
  const positionSizePercent: number = 20;
  const leverage: number = 1;
  const stopLossPercent: number = 2;
  const trailingStopLongPercent: number = 2;
  const trailingStopShortPercent: number = 2;
  const trailingStopTriggerPercent: number = 2;

  return {
    leverage,
    positionSizePercent,
    stopLossPercent,
    trailingStopLongPercent,
    trailingStopShortPercent,
    trailingStopTriggerPercent,
  };
};

const mapTradingViewSignalToZignaly = (
  signalData: TradingViewStrategySignal,
) => {
  const defaults = getPositionParamDefaults();
  const {
    action,
    side,
    symbolCode,
    stopLossPercent,
    trailingStopTriggerPercent,
    trailingStopLongPercent,
    trailingStopShortPercent,
    exchangeId,
    providerEnvKey,
  } = signalData;

  const isValidPercentage = (value: number) => {
    return isNumber(value) && inRange(0.01, 100.01);
  };

  let finalStopLossPercent = defaults.stopLossPercent;
  if (isValidPercentage(stopLossPercent)) {
    finalStopLossPercent = stopLossPercent;
  }

  let finalTrailingStopTriggerPercent = defaults.trailingStopTriggerPercent;
  if (isValidPercentage(trailingStopTriggerPercent)) {
    finalTrailingStopTriggerPercent = trailingStopTriggerPercent;
  }

  let finalTrailingStopDistancePercent =
    side == "long"
      ? defaults.trailingStopLongPercent
      : defaults.trailingStopShortPercent;

  if (side == "long" && isValidPercentage(trailingStopLongPercent)) {
    finalTrailingStopDistancePercent = trailingStopLongPercent;
  }

  if (side == "short" && isValidPercentage(trailingStopShortPercent)) {
    finalTrailingStopDistancePercent = trailingStopShortPercent;
  }

  const finalPositionSizePercent = defaults.positionSizePercent;
  const finalLeverage = defaults.leverage;
  process.env.ZIGNALY_PROVIDER_KEY = process.env[providerEnvKey] || null;

  if (!process.env.ZIGNALY_PROVIDER_KEY) {
    throw new Error(
      `Zignaly provider key not found for env var: '${providerEnvKey}'`,
    );
  }

  switch (action) {
    case "entry":
      return composeFuturesMarketEntrySignal(
        symbolCode,
        finalPositionSizePercent,
        side,
        finalLeverage,
        finalStopLossPercent,
        finalTrailingStopTriggerPercent,
        finalTrailingStopDistancePercent,
      );
      break;

    case "exit":
      return composeFuturesMarketExitSignal(symbolCode, side);
      break;

    default:
      break;
  }

  throw new Error("Invalid Trading View strategy signal received.");
};

const parseTradingViewPayload = (payload: any) => {
  const signalData: TradingViewStrategySignal = JSON.parse(payload);

  if (!isObject(signalData) || isEmpty(signalData)) {
    throw new Error("Trading View strategy signal is empty.");
  }

  return signalData;
};

export const trading_view_strategy_signal: Handler = async (event: any) => {
  try {
    const payload = event.body || "{}";
    const signalData = parseTradingViewPayload(payload);
    console.log("TV Signal: ", signalData);

    const { skipProcessingFilters } = signalData;
    const zignalySignal = mapTradingViewSignalToZignaly(signalData);
    console.log("Composed Zignaly Signal: ", zignalySignal);

    // Consider CSV signals for entry signals only.
    let filterPass: boolean = true;
    if (zignalySignal.type === "entry") {
      filterPass = skipProcessingFilters
        ? true
        : await filterSignalDailyCsvIndicator(signalData);
    }

    if (filterPass && isObject(zignalySignal)) {
      // Post to Zignaly if filter checks passed.
      await postSignal(zignalySignal);
    } else {
      console.log("Ignored signal due to not pass filtering checks.");
    }

    return responseSuccess("OK");
  } catch (e) {
    console.error("ERROR: ", e);
  }

  return responseError("KO", "Error processing Trading View strategy signal.");
};
