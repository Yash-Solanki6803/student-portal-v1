export default {
  registerUser: `INSERT INTO users (username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role;
                `,
  getUserByUsername: `SELECT * FROM users WHERE username = $1`,
  getUserByEmail: `SELECT * FROM users WHERE email = $1`,
  getUserProfileFromId: `SELECT 
                              users.*, 
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
  assignTitleFromUsername: ` WITH 
                                existing_title AS (
                                    SELECT id FROM titles WHERE slug = $4
                                ),
                                inserted_title AS (
                                    INSERT INTO titles (title_name, slug)
                                    SELECT $1, $4
                                    WHERE NOT EXISTS (SELECT 1 FROM existing_title)
                                    RETURNING id
                                ),
                                student_data AS (
                                    SELECT id 
                                    FROM users 
                                    WHERE username = $3 
                                    AND role = 'student'
                                ),
                                student_has_title AS (
                                    SELECT 1 
                                    FROM student_titles
                                    WHERE student_id = (SELECT id FROM student_data)
                                    AND title_id = COALESCE((SELECT id FROM existing_title), (SELECT id FROM inserted_title))
                                ),
                                title_assignment AS (
                                    INSERT INTO student_titles (student_id, title_id, assigned_by)
                                    SELECT 
                                        student.id, 
                                        COALESCE(existing_title.id, inserted_title.id), 
                                        $2
                                    FROM 
                                        student_data AS student
                                    LEFT JOIN existing_title ON TRUE
                                    LEFT JOIN inserted_title ON TRUE
                                    WHERE NOT EXISTS (SELECT 1 FROM student_has_title)
                                    RETURNING 'success' AS status
                                )
                            SELECT 
                                CASE 
                                    WHEN NOT EXISTS (SELECT 1 FROM student_data) THEN 'student_not_found'
                                    WHEN EXISTS (SELECT 1 FROM student_has_title) THEN 'title_already_assigned'
                                    WHEN EXISTS (SELECT 1 FROM title_assignment) THEN 'title_assigned'
                                    ELSE 'unknown_error'
                                END AS result;

                            `,
  updatePassword: `UPDATE users SET password = $1 WHERE id = $2;`,
  checkEmailExists: `SELECT id FROM users WHERE email = $1 AND id != $2`,
};
