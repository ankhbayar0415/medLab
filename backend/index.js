const express = require("express");

const app = express();
const http = require("http").createServer(app);
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const md5 = require("md5");
const port = 3001;
const jwt = require("jsonwebtoken");

const helper = require("./model/helper");
var register = require("./model/register");
var login = require("./model/login");
var searchuser = require("./model/searchuser");
const { sendMail } = require("./model/sendMail");

app.set("assets", path.join(__dirname, "assets"));
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: "*",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

const extension = (mimetype) => {
  switch (mimetype) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/bmp":
      return ".bmp";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/tiff":
      return ".tiff";
    case "image/x-icon":
      return ".ico";
    case "image/x-ms-bmp":
      return ".bmp";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/ogg":
      return ".ogg";
    case "video/quicktime":
      return ".mov";
    case "video/x-msvideo":
      return ".avi";
    case "video/x-flv":
      return ".flv";
    case "video/x-ms-wmv":
      return ".wmv";

    default:
      return "";
  }
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets/media/images/profile");
  },
  filename: function (req, file, cb) {
    let username = req.user.username;

    cb(null, md5(username, 16) + extension(file.mimetype));
  },
});
var media = multer.diskStorage({
  destination: function (req, file, cb) {
    let mimeType = file.mimetype;
    if (mimeType.includes("image")) {
      cb(null, "./assets/media/images/postImages");
    } else if (mimeType.includes("video")) {
      cb(null, "./assets/media/videos");
    }
  },
  filename: function (req, file, cb) {
    let username = req.user.username;
    let timestamp = new Date().getTime();
    let filename = md5(username + timestamp) + extension(file.mimetype);
    filename = filename.replace(/\s/g, "");
    cb(null, filename);
  },
});
var upload = multer({ storage: storage }).single("profile");
var postUpload = multer({ storage: media });

// get post pictures
app.get("/assets/media/images/postImages/:filename", (req, res) => {
  const filename = req.url.split("/").pop();
  res.sendFile(
    path.join(__dirname, "assets/media/images/postImages", filename)
  );
});

// get profile pictures
app.get("/assets/media/images/profile/:filename", (req, res) => {
  const filename = req.url.split("/").pop();
  res.sendFile(path.join(__dirname, "/assets/media/images/profile", filename));
});

// get videos
app.get("/assets/media/videos/:filename", (req, res) => {
  const filename = req.url.split("/").pop();
  res.sendFile(path.join(__dirname, "/assets/media/videos", filename));
});

// register
app.post("/accounts/register", async (req, res) => {
  let { email, fullname, username, pswd } = req.body;
  email = email.trim();
  username = username.trim();
  username = username.toLowerCase();

  if (await register.isDuplicateEmail(email)) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Email Already Exists",
      field: "email",
    });
  }
  if (await register.isDuplicateUserName(username)) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Username Already Exists",
      field: "username",
    });
  }
  if (register.IsRestrictedUserName(username)) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Username is restricted",
      field: "username",
    });
  }
  if (register.isUsernameHasSpecialCharacters(username)) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Username has special characters",
      field: "username",
    });
  }
  if (register.containsSpaceInUserName(username)) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Username contains space",
      field: "username",
    });
  }
  if (register.passwordStrength(pswd) < 3) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Password is weak",
      field: "password",
    });
  }
  var result = await register.register(email, fullname, username, pswd);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (result === false) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Registration Failed",
    });
  }

  res.send({
    status: 200,
    statusText: "Success",
    message: "Registration Successful",
    token: result.token,
  });
});

// resend verification email
app.post("/accounts/email/resend", async (req, res) => {
  const { token } = req.body;
  let emailVerificationResult = await register.checkEmailVerificationToken(
    token
  );
  if (emailVerificationResult === false) {
    console.log("Can't match the toke");
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Failed to send email",
    });
  }

  let resendEmailVerificationCode = await register.resendEmailVerificationCode(
    emailVerificationResult
  );
  if (resendEmailVerificationCode === false) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Failed to send email",
    });
  }
  res.send({ status: 200, statusText: "Success", message: "Email sent" });
});

// verify email
app.post("/accounts/email/verify", async (req, res) => {
  const { token, code } = req.body;
  let verify_code = await register.verifyCode(token, code);
  if (verify_code === false) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Failed to verify",
    });
  }
  let update_verification = await register.updateVerification(verify_code);
  if (update_verification === false) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Failed to verify",
    });
  }
  res.send({ status: 200, statusText: "Success", message: "Email verified" });
});

// random access token generator
function generateAccessToken(userId, username, useremail) {
  var token = jwt.sign(
    { userId: userId, username: username, useremail: useremail },
    "secret",
    { expiresIn: "48h" }
  );
  return token;
}

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  var result = await login.login(email, password);
  if (result.length > 0) {
    let email = result[0].email;
    if (result[0].verification === 0) {
      let token = await register.getEmailVerificationToken(email);
      console.log(token);
      if (token === undefined) {
        return res.send({
          status: 403,
          statusText: "Failed",
          message: "Something went wrong",
        });
      }
      if (token === false) {
        return res.send({
          status: 403,
          statusText: "Failed",
          message: "Something went wrong",
        });
      }
      let emailVerificationResult = await register.resendEmailVerificationCode(
        email
      );
      if (emailVerificationResult === false) {
        return res.send({
          status: 403,
          statusText: "Failed",
          message: "Something went wrong",
        });
      }
      console.log(token);
      return res.send({
        status: 201,
        statusText: "Failed",
        message: "Email not verified",
        verifyEmail: 0,
        token: token,
      });
    }
    const token = generateAccessToken(
      result[0].userId,
      result[0].username,
      result[0].useremail
    );
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    return res.send({
      status: 200,
      statusText: "OK",
      message: "Login Successful",
      token: token,
      verifyEmail: 1,
      username: result[0].username,
    });
  } else {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Please check your email and password",
    });
  }
});

// check if the user is authenticated
function AuthenticationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.send({
      status: 403,
      statusText: "Failed",
      message: "Please Login",
    });
  }
  jwt.verify(token, "secret", (err, user) => {
    if (err) {
      return res.send({
        status: 403,
        statusText: "Failed",
        message: "Please Login",
      });
    }
    req.user = user;
    next();
  });
}

// home page
app.get("/", AuthenticationToken, async (req, res) => {
  return res.send("Home");
});

// current user info
app.get("/current_user_info", AuthenticationToken, async (req, res) => {
  const userId = req.user.userId;
  const username = req.user.username;

  if (userId != null) {
    var result = await register.getUserInfo(userId);
    if (result === false) {
      return res.send({
        status: 403,
        statusText: "Failed",
        message: "Something went wrong",
      });
    } else if (result.length > 0) {
      return res.send({
        status: 200,
        statusText: "OK",
        email: result[0].email,
        fullname: result[0].fullname,
        website: result[0].website,
        user_type: result[0].user_type,
        verification: result[0].verification,
        profile: result[0].profile,
        gender: result[0].gender,
        description: result[0].description,
        date_of_birth: result[0].date_of_birth,
        account_status: result[0].account_status,
        account_visibility: result[0].account_visibility,
        username: username,
        userId: userId,
      });
    } else {
      return res.send({
        status: 403,
        statusText: "Failed",
        message: "Something went wrong",
      });
    }
  } else {
    res.send({
      status: 403,
      statusText: "Failed",
      message: "Please login",
      redirect: "/login",
    });
  }
});

// get other user's profile
app.post("/other_user_profile", async (req, res) => {
  const { username } = req.body;
  var result = await register.getUserInfoByUsername(username);

  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (result.length > 0) {
    res.status(200).send(result);
  } else res.send({ status: 403, message: "User not found" });
});

// get user info using userId
app.get("/get_user", async (req, res) => {
  const { userId } = req.query;
  var result = await register.getUserInfoByUserId(userId);

  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (result.length > 0) {
    res.status(200).send(result[0]);
  } else res.send({ status: 403, message: "User not found" });
});

//logout
app.post("/logout", (req, res) => {
  return res.send({ status: 200, message: "Logged out" });
});

// search user
app.get("/search?:q", async (req, res) => {
  let q = req.query.q;
  let result = await searchuser.search(q);

  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.status(200).send(result);
});

//explore accounts
app.get("/explore/people", AuthenticationToken, async (req, res) => {
  let limit = 250;
  let offset = 1;
  let userId = req.user.userId;
  let result = await searchuser.explore(userId, limit, offset);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  return res.status(200).send(result);
});

//upload pro pic
app.post("/upload_profile", AuthenticationToken, async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    var profileUrl = req.file.path.replace(/..\\public/g, "");

    register
      .updateProfile(req.user.userId, profileUrl)

      .then((result) => {
        if (result) {
          return res
            .status(200)
            .send({ status: 200, message: "Profile updated", url: profileUrl });
        } else {
          return res
            .status(403)
            .send({ status: 403, message: "Something went wrong" });
        }
      });
  });
});

//follow or unfollow user
app.post("/follow/", AuthenticationToken, async (req, res) => {
  let { followTo } = req.body;
  let currentUserId = req.user.userId;
  if (currentUserId === undefined) {
    return res.status(403).send({ status: 403, message: "Please login" });
  }
  if (currentUserId === followTo) {
    return res
      .status(403)
      .send({ status: 403, message: "You cannot follow yourself" });
  }
  let result = await register.followUser(currentUserId, followTo);
  return res.send(result);
});

//save notification
app.post("/report/post/", AuthenticationToken, async (req, res) => {
  let { notif_to } = req.body;
  let notif_by = req.user.userId;

  console.log("report to: " + notif_to);
  console.log("report by: " + notif_by);

  if (notif_by === undefined) {
    return res.status(403).send({ status: 403, message: "Please login" });
  }
  if (notif_by === notif_to) {
    return res
      .status(403)
      .send({ status: 403, message: "You cannot report yourself" });
  }
  let result = await helper.reportUser(notif_by, notif_to);
  return res.send(result);
});

//check if following
app.get("/is_following?:userId", AuthenticationToken, async (req, res) => {
  let { userId } = req.query;
  let currentUserId = req.user.userId;
  let result = await register.isFollowing(currentUserId, userId);
  return res.send({
    status: 200,
    result: result,
    currentUserId: currentUserId,
  });
});

//current user following and follower info
app.get(
  "/currentUser_follower_following",
  AuthenticationToken,
  async (req, res) => {
    let currentUserId = req.user.userId;

    if (currentUserId == undefined || currentUserId == NaN) {
      return res.status(403).send({ status: 403, message: "Please login" });
    }
    let followers = await helper.getFollowerCount(currentUserId);
    let following = await helper.getFollowingCount(currentUserId);
    let postCount = await helper.getPostCount(currentUserId);
    return res
      .status(200)
      .send({ followers: followers, following: following, post: postCount });
  }
);

//get following and follower info using userId
app.get("/get_follower_following?:userId", async (req, res) => {
  let { userId } = req.query;
  if (userId == undefined || userId == NaN) {
    return res.status(403).send({ status: 403, message: "Please login" });
  }
  let followers = await helper.getFollowerCount(userId);
  let following = await helper.getFollowingCount(userId);
  let postCount = await helper.getPostCount(userId);
  console.log(followers, following, postCount);
  return res
    .status(200)
    .send({ followers: followers, following: following, post: postCount });
});

//get followers info
app.get("/get_followers?:info", AuthenticationToken, async (req, res) => {
  let { info } = req.query;

  let json = JSON.parse(info);
  let { userId, username } = json;

  let currentUserId = req.user.userId;
  let currentUsername = req.user.username;

  if (currentUserId === userId) {
    let result = await helper.getFollowers(userId);
    return res.status(200).send({
      status: 200,
      isSameUser: true,
      followers: result,
    });
  }
  if (currentUsername == undefined) {
    return res.status(200).send({ status: 403, message: "Please login" });
  }

  if (isNaN(userId)) {
    return res
      .status(403)
      .send({ status: 403, message: "userId is not a number" });
  }

  let userInfo = await register.getUserInfo(userId);

  if (userInfo.length === 0) {
    return res.status(200).send({ status: 403, message: "User not found" });
  }
  let account_visibility = userInfo[0].account_visibility;
  if (account_visibility.toLowerCase() === "private".toLowerCase()) {
    return res.status(200).send({ status: 403, message: "private account" });
  }

  let result = await helper.getFollowers(userId);
  return res.status(200).send({
    status: 200,
    isSameUser: false,
    followers: result,
  });
});

//get all followers ids
app.get("/get_all_followers_ids", AuthenticationToken, async (req, res) => {
  let userId = req.user.userId;
  let result = await helper.getFollowers(userId);
  if (result === false) {
    return res
      .status(200)
      .send({ status: 403, message: "Something went wrong" });
  }
  if (result.length === 0) {
    return res.status(200).send({ status: 403, message: "No following" });
  }
  let ids = result.map((item) => item.userId);
  console.log(ids);
  return res.status(200).send({ status: 200, followers: ids });
});

//get followings info
app.get("/get_followings?:info", AuthenticationToken, async (req, res) => {
  let { info } = req.query;

  let json = JSON.parse(info);
  let { userId, username } = json;

  let currentUserId = req.user.userId;
  let currentUsername = req.user.username;

  if (currentUserId === userId) {
    let result = await helper.getFollowing(userId);
    return res.status(200).send({
      status: 200,
      isSameUser: true,
      following: result,
    });
  }
  if (currentUsername == undefined) {
    return res.status(200).send({ status: 403, message: "Please login" });
  }
  if (isNaN(userId)) {
    return res
      .status(403)
      .send({ status: 403, message: "userId is not a number" });
  }
  let userInfo = await register.getUserInfo(userId);

  if (userInfo.length === 0) {
    return res.status(200).send({ status: 403, message: "User not found" });
  }
  let account_visibility = userInfo[0].account_visibility;
  if (account_visibility.toLowerCase() === "private".toLowerCase()) {
    return res.status(200).send({ status: 403, message: "private account" });
  }

  let result = await helper.getFollowing(userId);
  return res.status(200).send({
    status: 200,
    isSameUser: false,
    following: result,
  });
});

//change password
app.post("/change_password", AuthenticationToken, async (req, res) => {
  let { oldPassword, newPassword, confirmPassword } = req.body;
  let currentUserId = req.user.userId;
  if (currentUserId == undefined) {
    return res.send({ status: 403, message: "Please login" });
  }
  let result = await helper.changePassword(
    currentUserId,
    oldPassword,
    newPassword,
    confirmPassword
  );
  return res.send(result);
});

// Update User Information
app.post("/update_user_info", AuthenticationToken, async (req, res) => {
  const {
    account_visibility,
    bio,
    date_of_birth,
    email,
    fullname,
    gender,
    profile,
    username,
    website,
  } = req.body;
  let userId = req.user.userId;

  const userInfo = {
    account_visibility: account_visibility,
    bio: bio,
    date_of_birth: date_of_birth,
    email: email,
    fullname: fullname,
    gender: gender,
    profile: profile,
    username: username,
    website: website,
  };
  if (fullname === "") {
    return res.send({ status: 403, message: "Name field can't be empty" });
  }

  let result = await register.updateUserInfo(userId, userInfo);

  return res.send(result);
});

// create post
app.post(
  "/create-post",
  AuthenticationToken,
  postUpload.array("files"),
  async (req, res) => {
    let uploadedFiles = req.files;
    let currentUserId = req.user.userId;
    let { caption, tags } = req.body;

    let username = req.user.username;

    let result = await helper.postStatus(
      currentUserId,
      username,
      tags,
      uploadedFiles,
      caption
    );

    return res.send(result);
  }
);

// get current userId
app.post("/get_current_user_id", AuthenticationToken, (req, res) => {
  let current_userId = req.user.userId;
  if (current_userId === undefined) {
    return res.send({ status: 403, message: "Please login" });
  }
  res.send({ status: 200, userId: current_userId });
});

function checkAlreadyVisited(visited, postId) {
  for (let i = 0; i < visited.length; i++) {
    if (visited[i] === postId) {
      return true;
    }
  }
  return false;
}

function groupingPosts(posts) {
  let post = [];
  let visited = [];
  for (let i = 0; i < posts.length; i++) {
    let myobject = [];
    if (!checkAlreadyVisited(visited, posts[i].postId)) {
      for (let index = 0; index < posts.length; index++) {
        if (posts[index].postId === posts[i].postId) {
          myobject.push(posts[index]);
        }
      }
      post.push(myobject);
      visited.push(posts[i].postId);
    }
  }
  return post;
}

// get posts
app.get("/posts", AuthenticationToken, async (req, res) => {
  let userId = req.user.userId;
  let offset = req.query.offset;
  let limit = req.query.limit;
  let result = await helper.getPosts(userId, offset, limit);
  let post = groupingPosts(result);
  res.send({
    posts: post,
    userId: userId,
    status: 200,
    message: "Posts fetched successfully",
    reachMax: result.length === 0 ? true : false,
  });
});

// like posts
app.put("/like_post", AuthenticationToken, async (req, res) => {
  let { postId, userId } = req.body;
  let currentUserId = req.user.userId;

  let result = await helper.likePost(postId, userId, currentUserId);
  let result2 = await helper.addLike(currentUserId, userId);
  if (result2 === false || result === false) {
    return res.send({ status: 403, message: "Something went's wrong" });
  }
  res.send({ status: 200, message: "Post liked successfully" });
});

// add comment
app.post("/comment_post", AuthenticationToken, async (req, res) => {
  let { postId, comment, commentParentId } = req.body;

  let currentUserId = req.user.userId;
  let commentType = "text";
  let result = await helper.commentPost(
    postId,
    comment,
    currentUserId,
    commentParentId,
    commentType
  );
  if (result === false) {
    return res.send({ status: 403, message: "Something went's wrong" });
  }
  res.send({ status: 200, message: "Comment posted successfully" });
});

// get comment count and check if the user liked or saved the post
app.get(
  "/get_comment_countAndCheck_user_like",
  AuthenticationToken,
  async (req, res) => {
    let { postId } = req.query;
    let currentUserId = req.user.userId;
    let likes = await helper.checkLike(postId, currentUserId);
    let result = await helper.getCommentCount(postId);

    let isSavedResult = await helper.isSavedPost(postId, currentUserId);
    if (isSavedResult === false) {
      res.send({ status: 403, message: "fail" });
    }
    if (result === false || likes === false) {
      return res.send({ status: 403, message: "Something went's wrong" });
    }
    res.send({
      status: 200,
      message: "Likes fetched successfully",
      isLike: likes.length > 0 ? true : false,
      commentCount: result[0].count,
      isSaved: isSavedResult.length > 0 ? true : false,
    });
  }
);

// get post analysis
app.get("/analyze_post", async (req, res) => {
  let { postId } = req.query;
  let like_result = await helper.getLikeCount(postId);
  let comment_result = await helper.getCommentCount(postId);
  if (like_result === false || comment_result === false) {
    return res.send({ status: 403, message: "Something went's wrong" });
  }
  res.send({
    status: 200,
    message: "Post analyzed successfully",
    likeCount: like_result[0].count,
    commentCount: comment_result[0].count,
  });
});

// get tags
app.get("/tags", async (req, res) => {
  let { tag } = req.query;

  let result = await helper.getPostByTag(tag);
  if (result === false) {
    res.send({ status: 403, message: "No posts found with this tag " + tag });
    res.end();
    return;
  }
  let post = groupingPosts(result);
  if (post.length > 0) {
    res.send({ status: 200, posts: post });
    res.end();
    return;
  } else {
    res.send({ status: 403, message: "No posts found" });
    res.end();
    return;
  }
});

//get post by url
app.get("/p/", async (req, res) => {
  let { postUrl } = req.query;

  let result = await helper.getPostByUrl(postUrl);
  if (result === false) {
    return res.send({
      status: 403,
      message: "No posts found with this id " + postUrl,
    });
  }
  let post = groupingPosts(result);
  res.send({ status: 200, post: post });
});

//get more posts
app.get("/get_more_post", async (req, res) => {
  let { postId, userId } = req.query;
  let result = await helper.getMorePost(postId, userId);
  if (result === false) {
    return res.send({ status: 403, message: "Something went's wrong" });
  }
  let post = groupingPosts(result);
  res.send({ status: 200, posts: post });
});

//get explore
app.get("/explore", AuthenticationToken, async (req, res) => {
  const userId = req.user.userId;

  const result = await helper.getExplores();
  if (result === false) {
    res.send({ status: 403, message: "Something went's wrong" });
  }
  let explore = groupingPosts(result);
  res.send({ status: 200, explores: explore });
});

//get suggestions
app.get("/suggestions", AuthenticationToken, async (req, res) => {
  const userId = req.user.userId;

  const suggestions = await helper.getSuggestions(userId);
  if (suggestions === false) {
    res.send({ status: 403, message: "Something went's wrong" });
  }

  res.send({
    status: 200,
    suggestions: suggestions.suggestedUserInfos,
    followers: suggestions.followers,
  });
});

//current user posts
app.get("/currentuser_posts", AuthenticationToken, async (req, res) => {
  let userId = req.user.userId;
  let result = await helper.getUserPosts(userId);
  console.log(result);
  if (result === false) {
    res.status(403).send({ status: 403, message: "fail" });
  }
  let post = groupingPosts(result);
  res.send({ status: 200, message: "success", posts: post });
});

//get other users posts
app.get("/otheruser_posts", async (req, res) => {
  let { userId } = req.query;

  //Check the user is public or private
  let userInfo = await register.getUserInfo(userId);
  if (userInfo === false) {
    res.send({ status: 403, message: "fail" });
  }

  if (userInfo.length === 0) {
    res.status(200).send({ status: 403, message: "User not found" });
  }
  let account_visibility = userInfo[0].account_visibility;
  if (account_visibility.toLowerCase() === "private") {
    res.status(200).send({ status: 403, message: "Private account" });
    res.end();
  } else {
    let result = await helper.getUserPosts(userId);
    if (result === false) {
      res.status(200).send({ status: 403, message: "fail" });
    }
    let post = groupingPosts(result);
    res.send({ status: 200, message: "success", posts: post });
  }
});

//get logged in user's posts
app.get("/login_user_posts", AuthenticationToken, async (req, res) => {
  let { userId } = req.query;
  let cuserId = req.user.userId;
  //Check the user is public or private
  let userInfo = await register.getUserInfo(userId);
  if (userInfo.length === 0) {
    res.send({ status: 403, message: "fail" });
    res.end();
    return;
  }
  let account_visibility = userInfo[0].account_visibility;
  if (account_visibility.toLowerCase() === "private") {
    //check the user is following the current user or not
    let isFollowing = await helper.isFollowing(userId, cuserId);
    if (isFollowing === false) {
      res.send({ status: 403, message: "Private Account" });
      res.end();
      return;
    } else {
      let result = await helper.getUserPosts(userId);
      if (result === false) {
        res.status(403).send({ status: 403, message: "fail" });
        res.end();
      }
      let post = groupingPosts(result);

      res.send({ status: 200, message: "success", posts: post });
      res.end();
      return;
    }
  } else {
    //Normal flow
    let result = await helper.getUserPosts(userId);
    if (result === false) {
      res.status(403).send({ status: 403, message: "fail" });
      res.end();
      return;
    }
    let post = groupingPosts(result);
    res.send({ status: 200, message: "success", posts: post });
    res.end();
    return;
  }
});

//save posts
app.post("/save_post", AuthenticationToken, async (req, res) => {
  let { postId } = req.body;

  let userId = req.user.userId;
  console.log("saving: " + postId + "userid: " + userId);
  let result = await helper.savePost(postId, userId);
  if (result === false) {
    res.status(403).send({ status: 403, message: "fail" });
  }
  res.send({ status: 200, message: "success" });
});

//get saved posts
app.get("/get_saved_posts", AuthenticationToken, async (req, res) => {
  let userId = req.user.userId;
  let result = await helper.getSavedPosts(userId);
  console.log(result);
  if (result === false) {
    res.status(403).send({ status: 403, message: "fail" });
  }
  let post = groupingPosts(result);
  res.send({ status: 200, message: "success", posts: post });
});

//get notifications
app.get("/get_notifications", AuthenticationToken, async (req, res) => {
  let userId = req.user.userId;

  let admin = await helper.isAdmin(userId);

  if (admin.length === 1) {
    let result = await helper.getReports(userId);
    console.log(result);
    if (result === false) {
      res.status(403).send({ status: 403, message: "fail" });
    }
    res.send({ status: 200, message: "success", notifications: result });
  } else {
    let result = await helper.getNotifications(userId);
    console.log(result);
    if (result === false) {
      res.status(403).send({ status: 403, message: "fail" });
    }
    res.send({ status: 200, message: "success", notifications: result });
  }
});

//get comments
app.get("/get_comments", AuthenticationToken, async (req, res) => {
  let { postId } = req.query;
  let result = await helper.getComments(postId);
  if (result === false) {
    res.status(403).send({ status: 403, message: "fail" });
  }
  res.send({ status: 200, message: "success", comments: result });
});

//send mail
app.get("/sendMail", (req, res) => {
  let email = sendMail("admin@medialab.com", "Subject", "<p>Body<p>");
  res.send(email);
});

//update visited
app.post("/visited_by_someone", AuthenticationToken, async (req, res) => {
  let { userId } = req.body;
  let currentUserId = req.user.userId;
  let result = await helper.saveVisited(userId, currentUserId);
  if (result === false) {
    res.send({ status: 403, message: "fail" });
    res.end();
  }
  res.send({ status: 200, message: "success" });
  res.end();
});

app.post("/visited_by_someone_notlogin", async (req, res) => {
  let { userId } = req.body;
  let result = await helper.saveVisited(userId, null);
  if (result === false) {
    res.send({ status: 403, message: "fail" });
    res.end();
  }
  res.send({ status: 200, message: "success" });
  res.end();
});

//postviewer
app.post("/postviewer", AuthenticationToken, async (req, res) => {
  let { postUrl } = req.body;
  let userId = req.user.userId;
  let result = await helper.savePostViewer(userId, postUrl);
  if (result === false) {
    res.send({ status: 403, message: "fail" });
    res.end();
  }
  res.send({ status: 200, message: "success" });
  res.end();
});

app.post("/postviewer_unknown", async (req, res) => {
  let { postUrl } = req.body;
  let result = await helper.savePostViewer(null, postUrl);
  if (result === false) {
    res.send({ status: 403, message: "fail" });
    res.end();
  }
  res.send({ status: 200, message: "success" });
  res.end();
});

//send reset password code
app.post("/send_reset_password_code", async (req, res) => {
  let { email } = req.body;
  let checkUser = await register.checkUser(email);
  if (checkUser) {
    let result = await helper.sendResetPasswordCode(email);
    if (result === false) {
      res.send({ status: 403, message: "fail" });
      res.end();
    } else {
      let code = result.code;
      sendMail(
        email,
        "Reset Password Code",
        "<h1>Your reset password code is <span style={'background:red;'}>" +
          code +
          "</span> <h1>"
      ).then((sres) => {
        if (sres !== null) {
          console.log(result);
          res.send({
            status: 200,
            message: "Reset email send",
            ucode: result.ucode,
          });
          res.end();
        } else {
          res.send({ status: 403, message: "Failed to send email" });
          res.end();
        }
      });
    }
  } else {
    res.send({ status: 403, message: "User not found" });
    res.end();
  }
});

// ucode checker
app.get("/ucode_checker", async (req, res) => {
  let { ucode } = req.query;
  let result = await helper.verifyUCode(ucode);
  if (result === false) {
    res.status(403).send({ message: "Failed" });
    res.end();
  }
  // console.log(result);
  res.status(200).send({
    message: result.message,
    status: result.status,
  });
});

//verify code
app.post("/verify_code", async (req, res) => {
  let { code, ucode } = req.body;
  let result = await helper.verifyCode(code, ucode);
  res.send(result);
});

// reset password
app.post("/create_new_password", async (req, res) => {
  let { pcode, password, confirmPassword } = req.body;
  let verifyCode = await helper.verifyPasswordChangerCode(pcode);
  if (verifyCode === false) {
    res.send({ status: 403, message: "Failed" });
    res.end();
    return;
  }
  if (password !== confirmPassword) {
    res.send({ status: 403, message: "Password not matched" });
    res.end();
    return;
  }
  let timestamp = new Date().getTime();
  let expiretimestamp = verifyCode[0].timestamp + 1000 * 60 * 10;
  if (expiretimestamp < timestamp) {
    res.send({ status: 403, message: "Expired code used" });
    res.end();
    return;
  }
  if (register.passwordStrength(password) < 3) {
    res.send({
      status: 403,
      message:
        "Password is weak\nPassword should be at least 6 characters in length and should include at least one upper case letter, one number, and one special character",
    });
    res.end();
    return;
  }
  let email = verifyCode[0].email;
  let result = await register.create_new_password(email, password, pcode);
  if (result === false) {
    res.send({ status: 403, message: "Failed" });
    res.end();
    return;
  } else {
    res.send({ status: 200, message: "Password changed" });
    res.end();
    return;
  }
});

// remove follower
app.post("/remove_follower", AuthenticationToken, async (req, res) => {
  let { followerId } = req.body;
  let currentUserId = req.user.userId;
  let result = await helper.removeFollower(followerId, currentUserId);
  if (result === false) {
    res.status(403).send({ status: 403, message: "fail" });
    res.end();
    return;
  }
  res.send({ status: 200, message: "success" });
  res.end();
  return;
});

//delete post
app.delete("/delete/post/", AuthenticationToken, async (req, res) => {
  let { postId } = req.body;

  let userId = req.user.userId;
  let result = await helper.deletePost(postId, userId);
  return res.send({
    status: result ? "Success" : "Fail",
    statusCode: result ? 200 : 403,
  });
});

//delete user
app.delete("/delete/user/", AuthenticationToken, async (req, res) => {
  let { deleteUserId } = req.body;

  let userId = req.user.userId;
  console.log("deleting the user wtidh: " + deleteUserId);
  console.log("my userId: " + userId);

  let admin = await helper.isAdmin(userId);
  if (admin.length === 1) {
    let result = await helper.deleteUser(deleteUserId);
    let result1 = await helper.deleteNotif(deleteUserId);
    return res.send({
      status: result && result1 ? "Success" : "Fail",
      statusCode: result && result1 ? 200 : 403,
    });
  } else {
    return res.send({
      status: "Admin required",
      statusCode: 403,
    });
  }
});

http.listen(port, () => {
  console.log("server started at port " + port);
});
