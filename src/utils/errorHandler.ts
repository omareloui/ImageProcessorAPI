import { APIError } from "../lib";
import type { ErrorRequestHandler } from "express";

function validateIsApiError(err: any): asserts err is APIError {
  if (!err.message || !err.statusCode)
    throw new Error("The provided error is not a valid error.");
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  validateIsApiError(err);
  res.status(err.statusCode).send(err.message);
};
