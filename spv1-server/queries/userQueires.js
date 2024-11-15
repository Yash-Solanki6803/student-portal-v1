export default {
  registerUser: `INSERT INTO users (username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role;
    `,
  getUserByUsername: `SELECT * FROM users WHERE username = $1`,
  getUserByEmail: `SELECT * FROM users WHERE email = $1`,
  getUserProfileFromId: `SELECT 
                              users.id, 
                              users.username, 
                              users.first_name, 
                              users.middle_name, 
                              users.last_name, 
                              users.profile_picture_url, 
                              users.branch, 
                              users.division, 
                              users.leetcode_id, 
                              users.role, 
                              users.email, 
                              COALESCE(json_agg(titles.title_name) FILTER (WHERE titles.title_name IS NOT NULL), '[]') AS titles
                          FROM 
                              users
                          LEFT JOIN 
                              student_titles ON users.id = student_titles.student_id
                          LEFT JOIN 
                              titles ON student_titles.title_id = titles.id
                          WHERE 
                              users.id = $1
                          GROUP BY 
                              users.id;
`,
  getUserRoleFromName: `SELECT role FROM users WHERE username = $1`,
  updateUserRoleFromName: `UPDATE users SET role = $1 WHERE username = $2`,
  assignTitleFromUsername: `WITH 
                            existing_title AS (
                            SELECT id FROM titles WHERE title_name = $1
                            ),
                            inserted_title AS (
                            INSERT INTO titles (title_name)
                            SELECT $1
                            WHERE NOT EXISTS (SELECT 1 FROM existing_title)
                            RETURNING id
                            )
                            INSERT INTO student_titles (student_id, title_id, assigned_by)
                            SELECT 
                                student.id, 
                                COALESCE(existing_title.id, inserted_title.id), 
                                $2
                            FROM 
                                users AS student
                            LEFT JOIN existing_title ON TRUE
                            LEFT JOIN inserted_title ON TRUE
                            WHERE 
                                student.username = $3
                                AND student.role = 'student';`,
};
