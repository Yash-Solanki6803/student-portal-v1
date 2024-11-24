// controllers/roleController.js
import db from "../config/db.js"; // Import database connection
import userQueires from "../queries/userQueries.js";

const assignRole = async (req, res) => {
  const { username, newRole } = req.body; // newRole is the role to be assigned
  const requestingUserId = req.user.userId; // The ID of the user making the request
  const requestingUserRole = req.user.role; // The role of the user making the request

  // Validate newRole
  if (!["student", "faculty", "hod"].includes(newRole)) {
    return res.status(400).json({ message: "Invalid role to assign" });
  }

  try {
    // Check if the requesting user is authorized to assign this role
    let authorized = false;

    // Dev can assign any role
    if (requestingUserRole === "dev") {
      authorized = true;
    }
    // HOD can assign Faculty only
    else if (
      requestingUserRole === "hod" &&
      (newRole === "faculty" || newRole === "student")
    ) {
      authorized = true;
    }

    if (!authorized) {
      return res
        .status(403)
        .json({ message: "You are not authorized to assign this role" });
    }

    // Check if the user already has a role of equal or higher authority
    const query = userQueires.getUserRoleFromName;
    const userRole = await db.query(query, [username]);

    if (userRole.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = userRole.rows[0].role;

    if (currentRole === "dev" || currentRole === "hod") {
      return res
        .status(400)
        .json({ message: "Cannot change role of a dev or hod directly" });
    }

    // Update the user's role in the database
    const updateRoleQuery = userQueires.updateUserRoleFromName;
    await db.query(updateRoleQuery, [newRole, username]);

    res.status(200).json({
      message: `Role ${newRole} assigned to user ${username} successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export { assignRole };
