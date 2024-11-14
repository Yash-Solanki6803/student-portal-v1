export default {
  registerUser: `INSERT INTO users (username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role;
    `,
  getUserByUsername: `SELECT * FROM users WHERE username = $1`,
  getUserByEmail: `SELECT * FROM users WHERE email = $1`,
  getUserProfileFromId: `SELECT id, username, first_name, middle_name, last_name, profile_picture_url, branch, division, leetcode_id, role, email FROM users WHERE id = $1`,
  getUserRoleFromName: `SELECT role FROM users WHERE username = $1`,
  updateUserRoleFromName: `UPDATE users SET role = $1 WHERE username = $2`,
};
