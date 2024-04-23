import express, { Express, json, Request, Response } from "express";
import { indexRouter } from "./api/index.router";
import config from "config";
import cronJob from "./service/cron.service";

const app: Express = express();

cronJob.start();
// { strict: false } allows literals to be parsed instead of just objects
app.use(json({ strict: false }));

app.use("/api", indexRouter);

app.get("/", (_: Request, res: Response) => {
  return res.status(200).send(`${config.get("meta.title")} is running...`);
});

const port = config.get("server.port");

app.listen(port, () =>
  console.log(`${config.get("meta.title")} is running on ${port}`)
);

