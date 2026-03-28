// Must be used after protect middleware (req.user is already set)
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Only admins can perform this action" });
  next();
};

module.exports = authorizeAdmin;
