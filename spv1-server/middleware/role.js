const role = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    // If the user does not have the required role, deny access
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access Denied: You do not have the required role : Your role:${userRole} - ${allowedRoles}`,
      });
    }

    next();
  };
};

export default role;
