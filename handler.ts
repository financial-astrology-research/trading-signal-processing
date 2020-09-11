import { Handler } from "aws-lambda";

export const trading_view_strategy_signal: Handler = (event: any) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "OK",
    }),
  };

  const payload = event.body || "{}";
  const signalData = JSON.parse(payload);
  console.log("TV Signal: ", signalData);

  return new Promise((resolve) => {
    resolve(response);
  });
};
