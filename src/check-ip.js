const { IP_WHITELIST } = process.env;

export default async (req, res, next) => {
  if (req.ip !== IP_WHITELIST) {
    res.status(401).send("Unauthorized");
    return;
  }
  next();
};
