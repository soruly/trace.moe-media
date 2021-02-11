const { TRACE_API_SECRET } = process.env;

export default async (req, res, next) => {
  if (req.header("x-trace-secret") !== TRACE_API_SECRET) {
    res.status(401).send("Unauthorized");
    return;
  }
  next();
};
