import db from "../config/db.js"; // Import database connection
import leetcodeQueries from "../queries/leetcodeQueries.js";

const updateLeetcodeDetails = async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id; //From auth middleware

  if (!username) {
    return res.status(400).send({ message: "Leetcode username is required" });
  }

  const gqlQuery = leetcodeQueries.LeetcodeProfileGQL;

  try {
    //Fetch Leetcode data
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: { username },
      }),
    });

    const { data } = await response.json();

    if (!data || !data.matchedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    //Extract data
    const userProfile = data.matchedUser.profile;
    const contribution = data.matchedUser.contributions || {};
    const badges = data.matchedUser.badges || [];
    const activeBadge = data.matchedUser.activeBadge || {};
    const submittedStats = data.matchedUser.submitStats.acSubmissionNum || [];

    //Update the database
    try {
      await db.query("BEGIN");

      //Update leetcode profile table
      await db.query(leetcodeQueries.updateSetLeetcodeProfile, [
        userId,
        username,
        userProfile.realName || null,
        userProfile.userAvatar || null,
        userProfile.aboutMe || null,
        userProfile.reputation || 0,
        userProfile.ranking || null,
        userProfile.starRating || null,
        contribution.points || 0,
      ]);

    //   Update leetcode badges table
      const badgeValues = badges.map((badge) => [
        userId,
        badge.id,
        badge.displayName,
        badge.icon,
        badge.creationDate,
        activeBadge && activeBadge.id === badge.id, // is_active
      ]);

      //Handle condition of empty badges
      if (badges.length === 0) {
        badgeValues.push([userId, null, null, null, null, false]);
      }

      const query = `
      INSERT INTO leetcode_badges (user_id, badge_id, display_name, icon_url, creation_date, is_active)
      VALUES ${badgeValues
        .map(
          (_, i) =>
            `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
        )
        .join(",")}
      ON CONFLICT (user_id, badge_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        icon_url = EXCLUDED.icon_url,
        creation_date = EXCLUDED.creation_date,
        is_active = EXCLUDED.is_active;
    `;
      await db.query(query, badgeValues.flat());

      //Update leetcode submissions table
      const submissionValues = submittedStats.map((stat) => [
        userId,
        stat.difficulty ,
        stat.submissions,
        stat.count,
      ]);
      const submissionQuery = `
      INSERT INTO leetcode_submissions (user_id, difficulty, total_submissions, accepted_submissions, updated_at)
      VALUES ${submissionValues
        .map(
          (_, i) =>
            `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, NOW())`
        )
        .join(",")}   
      ON CONFLICT (user_id, difficulty) DO UPDATE SET
        total_submissions = EXCLUDED.total_submissions,
        accepted_submissions = EXCLUDED.accepted_submissions,
        updated_at = NOW();
    `;
      await db.query(submissionQuery, submissionValues.flat());

      db.query("COMMIT");
      return res.status(200).send({
        message: "Leetcode details updated successfully",
      });
    } catch (error) {
      console.log(error);
      await db.query("ROLLBACK");
      console.error(error);
      throw error;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

export { updateLeetcodeDetails };
