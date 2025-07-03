module.exports = (client) => {
  process.on("unhandledRejection", (reason, p) => {
    console.error("🔴 [AntiCrash]: Unhandled Rejection/Catch");
    console.error(reason);
  });
  process.on("uncaughtException", (err, origin) => {
    console.error("🔴 [AntiCrash]: Uncaught Exception/Catch");
    console.error(err);
  });
  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.error("🔴 [AntiCrash]: Uncaught Exception/Catch (MONITOR)");
    console.error(err);
  });
};
