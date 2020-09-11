import { fetch } from "cross-fetch";

async function postSignal(payload: any) {
  const endpointUrl = "https://zignaly.com/api/signals.php";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(endpointUrl, options);
    const data = await response.text();
    console.log("STATUS: ", response.status);
    console.log("DATA: ", data);
    return data;
  } catch (e) {
    console.error("ERROR: ", e);
  }
}

/**
 * Compose Zignaly futures market short entry signal.
 *
 * @param {string} symbol Symbol code to trade without currency separation: i.e. BTCUSDT.
 * @param {number} positionSize Percentage position size calculated from provider service allocated balance.
 * @param {number} leverage Leverage factor, position size is multiplied by it, increase the risk.
 * @param {number} [stopLossPercentage] Percentage to calculate the stop loss price from the final entry price.
 * @param {number} [trailingStopTriggerPercent] Percentage that prices shold move in the expected trade direction to trigger the trailing stop.
 * @param {number} [trailingStopDistancePercent] Percentage of the distance to keep from hightest price when trailing stop follows the trend.
 */
async function composeFuturesMarketEntryShortSignal(
  symbol,
  positionSize,
  leverage,
  stopLossPercentage = undefined,
  trailingStopTriggerPercent = undefined,
  trailingStopDistancePercent = undefined,
) {
  const marketSignal = {
    type: "entry",
    side: "short",
    orderType: "market",
    exchange: "Zignaly",
    pair: symbol,
    positionSizePercentage: positionSize,
    stopLossPercentage: stopLossPercentage || false,
    leverage: leverage || 1,
    exchangeAccountType: "futures",
    trailingStopTriggerPercent: trailingStopTriggerPercent || false,
    trailingStopPercentage: trailingStopDistancePercent || false,
    providerKey: process.env.ZIGNALY_PROVIDER_KEY,
  };
}
