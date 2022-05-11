import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  res.status(err.statusCode || 500).send(err.message);
};
