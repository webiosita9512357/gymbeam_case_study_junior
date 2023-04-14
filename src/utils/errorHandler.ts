import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`${error.name}: ${error.message}`);

  res.status(getStatus(error)).json({
    message: error.message,
  });
};

const getStatus = (error: Error) => {
  switch (error.name) {
    case "BAD_REQUEST":
      return 400;
    case "NOT_FOUND":
      return 404;
    default:
      return 500;
  }
};
