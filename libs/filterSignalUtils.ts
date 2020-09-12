import { TradingViewStrategySignal } from "../handler";
import * as moment from "moment";
import * as csvtojson from "csvtojson";
import { every, groupBy } from "lodash";

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
  const { symbolCode, side, exchangeDate } = signalData;
  const indicatorFile =
    process.cwd() + `/csv_indicators/ml-${symbolCode}-daily.csv`;
  const sideAction = side == "long" ? "buy" : "sell";
  const exchangeDateMoment = moment.utc(exchangeDate, "YYYY-M-D");
  const signalIndex = exchangeDateMoment.format("YYYY-MM-DD");

  const dailyIndicator = await csvtojson({
    delimiter: "auto",
    quote: "off",
    trim: true,
    headers: ["Date", "Action"],
  }).fromFile(indicatorFile);

  const dailyIndicatorIndex = groupBy(dailyIndicator, "Date");
  const signalDateIndicatorSignals = dailyIndicatorIndex[signalIndex] || null;

  if (!signalDateIndicatorSignals) {
    throw new Error(
      `No CSV ${indicatorFile} indicator signals found for date ${signalIndex}`,
    );
  }

  const signalDateActions = signalDateIndicatorSignals.map(
    (signal) => signal.Action,
  );

  console.log(
    `Confirm TV signal "${sideAction}" with CSV ${signalIndex} signals:`,
    signalDateActions,
  );

  const signalFilterPass = every(signalDateActions, (value) => {
    return value === sideAction;
  });

  console.log("Signal filter pass: ", signalFilterPass);

  return signalFilterPass;
}
