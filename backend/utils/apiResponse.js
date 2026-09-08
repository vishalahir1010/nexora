export const success = (res, statusCode, message, data = null, extra = {}) => {
  return res.status(statusCode).json({ success: true, message, data, ...extra });
};

export const failure = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({ success: false, message, data: null, errors });
};
