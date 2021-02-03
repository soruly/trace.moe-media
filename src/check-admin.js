const { ADMIN_TOKEN } = process.env;

export default async (req, res, next) => {
  if (req.query.token !== ADMIN_TOKEN) {
    res.status(403).send("403 Forbidden");
    return;
  }
  next();
};
