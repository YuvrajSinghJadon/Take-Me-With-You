import Users from "../models/userModel.js";
import Posts from "../models/postModel.js"; // Assuming you have a post model

export const searchResults = async (req, res) => {
  const query = req.query.q;

  try {
    // Search users by name
    const users = await Users.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    }).select("firstName lastName profileUrl");

    // Search posts by description
    const posts = await Posts.find({
      description: { $regex: query, $options: "i" },
    }).populate("userId", "firstName lastName profileUrl");

    res.json({ users, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
};
