import jwt from "jsonwebtoken";

// Middleware to authenticate user using JWT
const auth = (req, res, next) => {
  // Get the token from the Authorization header
  // const token = req.header('x-auth-token'); // Or use 'Authorization' depending on your frontend setup
  const token = req.cookies["spv1-auth"];
  // If no token is provided
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request object
    req.user = decoded.user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If token is invalid or expired
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default auth;
