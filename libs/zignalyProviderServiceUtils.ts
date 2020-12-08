import { fetch } from "cross-fetch";
import { assign } from "lodash";

export async function postSignal(payload: any) {
  const endpointUrl = "https://zignaly.com/api/signals.php";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  try {
    console.log(`POST signal to Zignaly endpoint: ${endpointUrl}:\n`, payload);
    const response = await fetch(endpointUrl, options);
    console.log(
      `Zignaly post status: ${response.status} - ${response.statusText}`,
    );

    const message = await response.text();
    if (message) {
      console.log("Message: ", message);
    }
    return message;
  } catch (e) {
    console.log("Post error: ", e);
    throw new Error("Post signal to Zignaly failed.");
  }
}

function composeBaseEntrySignal(
  exchange: string,
  exchangeType: string,
  orderType: string,
) {
  return {
    type: "entry",
    exchange,
    exchangeAccountType: exchangeType,
    orderType,
  };
}

function composeBaseExitSignal(exchange: string, exchangeType: string) {
  return {
    type: "exit",
    exchange,
    exchangeAccountType: exchangeType,
  };
}

/**
 * Compose Zignaly futures exchange market entry signal.
 *
 * @param {string} symbol Symbol code to trade without currency separation: i.e. BTCUSDT.
 * @param {number} size Percentage position size calculated from provider service allocated balance.
 * @param {string} side Position side: (short or long).
 * @param {number} leverage Leverage factor, position size is multiplied by it, increase the risk.
 * @param {number} [stopLossPercentage] Percentage to calculate the stop loss price from the final entry price.
 * @param {number} [trailingStopTriggerPercent] Percentage that price should move in the trade direction to trigger the trailing stop.
 * @param {number} [trailingStopDistancePercent] Percentage of highest price distance to keep for the trailing stop.
 */
export function composeFuturesMarketEntrySignal(
  symbol: string,
  size: number,
  side: string,
  leverage: number,
  stopLossPercentage: number,
  trailingStopTriggerPercent: number,
  trailingStopDistancePercent: number,
) {
  return assign(composeBaseEntrySignal("Zignaly", "futures", "market"), {
    pair: symbol,
    side: side,
    signalId: `${symbol}_${side}`,
    positionSizePercentage: size,
    stopLossPercentage: stopLossPercentage || false,
    leverage: leverage || 1,
    trailingStopTriggerPercentage: trailingStopTriggerPercent || false,
    trailingStopDistancePercentage: trailingStopDistancePercent || false,
    providerKey: process.env.ZIGNALY_PROVIDER_KEY,
  });
}

/**
 * Compose Zignaly futures exchange market exit signal.
 *
 * @param {string} symbol Symbol code to trade without currency separation: i.e. BTCUSDT.
 */
export function composeFuturesMarketExitSignal(symbol: string, side: string) {
  return assign(composeBaseExitSignal("Zignaly", "futures"), {
    pair: symbol,
    side: side,
    signalId: `${symbol}_${side}`,
    providerKey: process.env.ZIGNALY_PROVIDER_KEY,
  });
}

/**
 * Compose Zignaly spot exchange market entry signal.
 *
 * @param {string} symbol Symbol code to trade without currency separation: i.e. BTCUSDT.
 * @param {number} size Percentage position size calculated from provider service allocated balance.
 * @param {string} side Position side: (short or long).
 * @param {number} leverage Leverage factor, position size is multiplied by it, increase the risk.
 * @param {number} [stopLossPercentage] Percentage to calculate the stop loss price from the final entry price.
 * @param {number} [trailingStopTriggerPercent] Percentage that price should move in the trade direction to trigger the trailing stop.
 * @param {number} [trailingStopDistancePercent] Percentage of highest price distance to keep for the trailing stop.
 */
export function composeSpotMarketEntrySignal(
  symbol: string,
  size: number,
  side: string,
  leverage: number,
  stopLossPercentage: number,
  trailingStopTriggerPercent: number,
  trailingStopDistancePercent: number,
) {
  return assign(composeBaseEntrySignal("Zignaly", "spot", "market"), {
    pair: symbol,
    side: side,
    positionSizePercentage: size,
    stopLossPercentage: stopLossPercentage || false,
    leverage: leverage || 1,
    trailingStopTriggerPercentage: trailingStopTriggerPercent || false,
    trailingStopDistancePercentage: trailingStopDistancePercent || false,
    providerKey: process.env.ZIGNALY_PROVIDER_KEY,
  });
}
