import { Router } from "express";
import { ResizeArguments } from "../@types";

const routes = Router();

routes.get("/", async (req, res) => {
  const options = req.query as ResizeArguments;

  res.send("resizing...");
});

export default routes;
