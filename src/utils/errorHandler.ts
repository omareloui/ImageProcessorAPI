import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(err.statusCode || 500);
  if (res.statusCode === 500 || res.statusCode === 404)
    res.render("error", {
      statusCode: err.statusCode,
      message: err.message,
      statusMessage: err.statusMessage,
    });
  else res.send(err.message);
};
