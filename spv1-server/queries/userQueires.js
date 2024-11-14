export default {
  registerUser: `INSERT INTO users (username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role;
    `,
  // Query to get user by username
  getUserByUsername: `SELECT * FROM users WHERE username = $1`,

  // Query to get user by email
  getUserByEmail: `SELECT * FROM users WHERE email = $1`,
  getUserProfileFromId: `SELECT id, username, first_name, middle_name, last_name, profile_picture_url, 
       branch, division, leetcode_id, role, email FROM users WHERE id = $1`,
};
