const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs")

const User = require('../models/User');
const Post = require('../models/Post');
const Comments = require('../models/Comments');

const upload = require("../middleware/multer");
const app = express();
//upload 
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully" });
});

router.get("/fetchPfp", (req, res) => {
  const username = req.query.username;
  const filePath = path.join(__dirname, "../../uploads", username, "pfp.png");

  res.sendFile(filePath, (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(404).send("File not found");
      }
    }
  });
});

router.post("/postMedia", async (req, res, next) => {
  const username = req.query.username;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).send("User not found");

  user.posts += 1;
  req.postCount = user.posts; // store in req for multer to use
  await user.save();

  next();
}, upload.single("file"), async (req, res) => {
  const username = req.query.username;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).send("User not found");


  await Post.create({
    author: username,
    post_name: `${username}_${user.posts}`,
    post_description: req.body.description
  });

  res.send("File uploaded successfully");
});

router.post("/fetchPostData", async (req, res) => {
  try {
    const { type, username } = req.body;

    let output;

    if (type === "all") {
      output = await Post.find(); // fetch all posts
    } else if (username) {
      output = await Post.find({ author: username }); // fetch specific user’s posts
    } else {
      return res.status(400).json({ error: "Username required for non-'all' types" });
    }

    // Add dir_path to each post
    const updatedPosts = output.map((post, index) => ({
      ...post.toObject(),
      dir_path: path.join(
        __dirname,
        "../../uploads",
        post.author,
        "posts",
        `${post.author}_${index + 1}.png`
      )
    }));

    res.json(updatedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/fetchPostFile/:username/:index", (req, res) => {
  const { username, index } = req.params;
  const filePath = path.join(__dirname, "../../uploads", username, "posts", `${index}.png`);

  res.sendFile(filePath, (err) => {
    // Don't log "File not found" errors
    if (err && err.code !== 'ENOENT') {
      console.error("Unexpected error:", err.message);
    }

    if (err && !res.headersSent) {
      res.status(404).send("File not found");
    }
  });
});

router.get("/fetchInfo", async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.send({ count });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


router.post("/deletePost", async (req, res) => {

  const { DelBy, postAuthor, postName } = req.body;

  if (DelBy === postAuthor) {
    const filePath = path.join(__dirname, "../../uploads", postAuthor, "posts", `${postName}.png`);



    try {
      // Delete the image file
      await fs.promises.unlink(filePath);
      await Post.deleteOne({ post_name: postName });

      await Comments.deleteMany({postName});

      //console.log("File deleted:", filePath);

      res.status(200).send("Post deleted successfully.");
    } catch (err) {
      console.error("Error deleting file:", err.message);
      res.status(500).send("Failed to delete post.");
    }



  } else {
    res.status(500).send("you dont have authority to delete this post")
  }
});


//Comments 

router.post("/addComment", async (req, res) => {
  try {
    const { postName, CommentAuthor, Comment } = req.body;

    if (!postName || !CommentAuthor || !Comment) {
      return res.status(400).send("Missing fields");
    }

    await Comments.create({
      postName,
      CommentAuthor,
      Comment,
      date: new Date()
    });

    res.status(201).send("Comment added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Fetch comments by post name
router.post("/fetchComment", async (req, res) => {
  try {
    const { postName } = req.body;

    if (!postName) {
      return res.status(400).send("Post name required");
    }

    const comments = await Comments.find({ postName }).sort({ date: -1 });

    if (!comments || comments.length === 0) {
      return res.status(200).send([]); // Return empty array for no comments
    }

    res.status(200).send(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete a specific comment
router.post("/deleteComment", async (req, res) => {
  try {
    const { postName, CommentAuthor, Comment } = req.body;

    if (!postName || !CommentAuthor || !Comment) {
      return res.status(400).send("Missing fields");
    }

    const deleted = await Comments.findOneAndDelete({ postName, CommentAuthor, Comment });

    if (!deleted) {
      return res.status(404).send("Comment not found");
    }

    res.status(200).send("Comment deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router