import { TradingViewStrategySignal } from "../handler";
import * as csvtojson from "csvtojson";
import { groupBy } from "lodash";

/**
 * Check that signal pass filter daily indicator.
 *
 * @export
 * @param {TradingViewStrategySignal} signalData
 * @returns {boolean} Filter check result.
 */
export async function filterSignalDailyCsvIndicator(
  signalData: TradingViewStrategySignal,
) {
  const { symbolCode, side } = signalData;
  const indicatorFile = process.cwd() + `/csv_indicators/ml-EOSUSDT-daily.csv`;
  const sideAction = side == "long" ? "buy" : "sell";

  try {
    const dailyIndicator = await csvtojson({
      delimiter: "auto",
      quote: "off",
      trim: true,
      headers: ["Date", "Action"],
    }).fromFile(indicatorFile);

    const dailyIndicatorIndex = groupBy(dailyIndicator, "Date");
    console.log("Indicator: ", dailyIndicatorIndex);
  } catch (e) {
    console.log(`CSV error ${indicatorFile}:`, e);
  }

  return false;
}
