import { TradingViewStrategySignal } from "../types/signalTypes";
import { flatten, every, isEmpty, groupBy, pick, values } from "lodash";
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
  const { symbolCode, side, date, hour } = signalData;
  const indicatorFile = `ml-${symbolCode}-daily-consensus.csv`;
  const sideAction = side == "long" ? "buy" : "sell";
  const dateTime = `${date} ${hour}`;
  const exchangeDateMoment = moment.utc(dateTime, "YYYY-M-D H:m:s");
  const currentHour: number = new Date().getUTCHours();
  let dailyIndicator: any = null;

  console.log("Using to determine day index the UTC hour:", currentHour);
  let signalIndex1 = exchangeDateMoment.format("YYYY-MM-DD");
  // When more than half of current day is elapsed use trend indicator signals from next days.
  if (currentHour >= 11) {
    signalIndex1 = exchangeDateMoment.add(1, "days").format("YYYY-MM-DD");
  }

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
  const signalIndexes = [signalIndex1];
  const signalDateIndicatorSignals = flatten(
    values(pick(dailyIndicatorIndex, signalIndexes)),
  );

  if (!signalDateIndicatorSignals) {
    throw new Error(
      `No CSV ${indicatorFile} indicator signals found for date(s) ${signalIndexes.toString()}`,
    );
  }

  const signalDateActions = signalDateIndicatorSignals.map((signal: any) => {
    return signal.Action;
  });

  console.log(
    `Confirm TV signal "${sideAction}" with CSV ${signalIndexes.toString()} signals:`,
    signalDateActions,
  );

  const signalFilterPass = every(signalDateActions, (value) => {
    return value === sideAction;
  });

  console.log("Signal filter pass: ", signalFilterPass);

  return signalFilterPass;
}
