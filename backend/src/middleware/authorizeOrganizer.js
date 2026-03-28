// Must be used after protect middleware (req.user is already set)
const authorizeOrganizer = (req, res, next) => {
  if (req.user.role !== "organizer" && req.user.role !== "admin")
    return res.status(403).json({ message: "Only organizers can perform this action" });
  next();
};

module.exports = authorizeOrganizer;
