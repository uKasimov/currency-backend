import { CronJob } from "cron";
import { updateAll } from "./currencies.service";

const scheduledFunction = async () => {
  await updateAll();
};

const cronJob = new CronJob("0 1 * * *", scheduledFunction); // 0 минут, 1 час, каждый день

export default cronJob;
