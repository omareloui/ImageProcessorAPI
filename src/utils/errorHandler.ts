import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(err.statusCode || 500).render("error", {
    statusCode: err.statusCode,
    message: err.message,
    statusMessage: err.statusMessage,
  });
};
