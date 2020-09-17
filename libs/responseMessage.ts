export const responseSuccess = (message: string) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: message,
    }),
  };

  return new Promise((resolve) => {
    resolve(response);
  });
};

export const responseError = (message: string, error: string) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message,
      error,
    }),
  };

  return new Promise((resolve) => {
    resolve(response);
  });
};
