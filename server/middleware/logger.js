const logger = (req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${req.ip} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

module.exports = logger;