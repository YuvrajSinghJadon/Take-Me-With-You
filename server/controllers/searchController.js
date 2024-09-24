import Users from "../models/userModel.js";
import Posts from "../models/PostModel.js"; // Assuming you have a post model

export const searchResults = async (req, res) => {
  const query = req.query.q.trim(); // Get the search query and trim whitespace

  if (!query) {
    return res.status(400).json({ message: "Search query is missing" });
  }

  const queryWords = query.split(" "); // Split query into individual words

  try {
    // Build a dynamic search condition using the split words
    const searchConditions = queryWords.map((word) => ({
      $or: [
        { firstName: { $regex: word, $options: "i" } },
        { lastName: { $regex: word, $options: "i" } },
      ],
    }));

    // Search for users matching any of the words in firstName or lastName
    const users = await Users.find({
      $and: searchConditions,
    }).select("firstName lastName profileUrl");

    // Search for posts by description
    const posts = await Posts.find({
      description: { $regex: query, $options: "i" },
    }).populate("userId", "firstName lastName profileUrl");

    res.json({ users, posts });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Search failed" });
  }
};
