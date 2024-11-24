export default {
  LeetcodeProfileGQL: `
    query getUserProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          aboutMe
          reputation
          ranking
          starRating
        }
        contributions {
          points
        }
        submitStats {
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        badges {
          id
          displayName
          icon
          creationDate
        }
        activeBadge {
          id
          displayName
          icon
          creationDate
        }
      }
    }`,
  updateSetLeetcodeProfile: `
        INSERT INTO leetcode_profiles 
        (user_id, username, real_name, user_avatar, about_me, reputation, ranking, star_rating, contributions_points, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (username) DO UPDATE SET 
        real_name = EXCLUDED.real_name,
        user_avatar = EXCLUDED.user_avatar,
        about_me = EXCLUDED.about_me,
        reputation = EXCLUDED.reputation,
        ranking = EXCLUDED.ranking,
        star_rating = EXCLUDED.star_rating,
        contributions_points = EXCLUDED.contributions_points,
        updated_at = NOW()`,
};
