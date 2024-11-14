const role = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    console.log(req.user);
    // If the user does not have the required role, deny access
    if (userRole !== requiredRole) {
      return res.status(403).json({
        message: `Access Denied: You do not have the required role : Your role:${userRole} - ${requiredRole}`,
      });
    }

    next();
  };
};

export default role;
