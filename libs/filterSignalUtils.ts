import { TradingViewStrategySignal } from "../types/signalTypes";
import { every, isEmpty, groupBy } from "lodash";
import moment from "moment";
import csvtojson from "csvtojson";
import S3 from "aws-sdk/clients/s3";

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
  const { symbolCode, side, date } = signalData;
  const indicatorFile = `ml-${symbolCode}-daily.csv`;
  const sideAction = side == "long" ? "buy" : "sell";
  const exchangeDateMoment = moment.utc(date, "YYYY-M-D");
  const signalIndex = exchangeDateMoment.format("YYYY-MM-DD");
  let dailyIndicator: any = null;

  try {
    const awsS3 = new S3();
    const fileStream = awsS3
      .getObject({
        Bucket: process.env.S3_INDICATORS_BUCKET || "",
        Key: indicatorFile,
      })
      .createReadStream();

    dailyIndicator = await csvtojson({
      delimiter: "auto",
      quote: "off",
      trim: true,
      headers: ["Date", "Action"],
    }).fromStream(fileStream);
  } catch (e) {
    console.log("CSV indicator load error: ", e);
    throw new Error(`Load CSV indicator ${indicatorFile} failed`);
  }

  if (isEmpty(dailyIndicator)) {
    throw new Error(`CSV indicator ${indicatorFile} is empty`);
  }

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
