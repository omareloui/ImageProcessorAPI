import type { ErrorRequestHandler, RequestHandler, Response } from "express";

interface ErrorPageData {
  statusCode: number;
  statusMessage: string;
  message: string;
  stack?: string;
}

function renderErrorPage(res: Response, data: ErrorPageData) {
  res.status(data.statusCode || 500);
  res.render("error", {
    statusCode: data.statusCode,
    statusMessage: data.statusMessage,
    message: data.message,
    stack: data.stack,
  });
}

function render404(res: Response) {
  renderErrorPage(res, {
    statusCode: 404,
    statusMessage: "Not Found",
    message: `Can't find this page any where on the app. Sorry! :(`,
  });
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  render404(res);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err.statusCode === 404) render404(res);
  else if (err.statusCode === 500) renderErrorPage(res, err as ErrorPageData);
  else res.send(err.message);
};
