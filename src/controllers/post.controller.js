const Post = require("../models/post.model");
const utils = require("../helpers/utils");
const s3 = require("../helpers/aws-s3.helper");
const og = require("open-graph");
const axios = require("axios");
const environment = require("../environments/environment");

exports.findAll = async function (req, res) {
  const postData = await Post.findAll(req.body);
  return res.send(postData);
};

exports.getPostByProfileId = async function (req, res) {
  console.log(req.body);
  const postList = await Post.getPostByProfileId(req.body);
  if (postList) {
    res.send({ data: postList });
  }
};

exports.getAllPosts = async function (req, res) {
  console.log(req.body);
  const postList = await Post.getAllPosts(req.body);
  if (postList) {
    res.send({ data: postList });
  }
};

exports.getPostByPostId = function (req, res) {
  console.log(req.params.id);
  Post.getPostByPostId(req.params.id, function (err, post) {
    if (err) return utils.send500(res, err);
    res.send(post);
  });
};

exports.getPdfsFile = function (req, res) {
  console.log(req.params.id);
  Post.getPdfsFile(req.params.id, function (err, post) {
    if (err) return utils.send500(res, err);
    res.send(post);
  });
};

exports.createPost = async function (req, res) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: "Error in application" });
  } else {
    const postData = new Post(req.body);
    console.log(postData);
    const post = await Post.create(postData);
    if (post) {
      return res.json({
        error: false,
        mesage: "Post created",
        data: post,
      });
    } else {
      return utils.send500(res, "something went wrong!");
    }
    //   , function (err, post) {
    //   if (err) {
    //     return utils.send500(res, err);
    //   } else {
    //     return res.json({
    //       error: false,
    //       mesage: "Post created",
    //       data: post,
    //     });
    //   }
    // });
  }
};

exports.uploadVideo = async function (req, res) {
  try {
    console.log("req file ==>", req.files);
    const { roomId, groupId } = req.query;
    const imageList = [];

    for (const file of req.files) {
      const url = await s3.uploadFileToWasabi(
        file,
        file.originalname.replace(" ", "-")
      );
      console.log("url", url);
      file?.mimetype?.includes("application")
        ? imageList.push({ pdfUrl: url })
        : imageList.push({ imageUrl: url });
    }
    console.log("imagesList", imageList);

    if (imageList?.length > 0) {
      return res.json({
        error: false,
        // url: url,
        imagesList: imageList,
        roomId: +roomId || null,
        groupId: +groupId || null,
      });
    }
  } catch (error) {
    console.error(error);
    return utils.send500(res, error);
  }
};

function getMetaData(url) {
  return new Promise((resolve, reject) => {
    og(url, (err, meta) => {
      if (err) {
        reject(new Error(`Failed to fetch metadata for ${url}`));
      } else {
        resolve(meta);
      }
    });
  });
}

exports.getMeta = async function (req, res) {
  const url = req.body.url;
  if (url) {
    const isYouTube =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i.test(
        url
      );
    console.log(isYouTube);
    if (isYouTube) {
      const data = await getYouTubeMeta(url);
      if (data) {
        res.json(data);
      }
    } else {
      getMetaData(url)
        .then((metaData) => {
          if (metaData) {
            const meta = {
              title: metaData?.title || "",
              description: metaData?.description || "",
              site_name: metaData?.site_name || "",
              url: url,
              type: metaData?.type || "website",
              image: metaData?.image || "",
            };

            console.log("meta===>", meta);
            return res.json({ meta });
          }
        })
        .catch((err) => {
          return res.json(err);
        });
    }
  } else {
    return res.json({});
  }
};

async function getYouTubeMeta(url) {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = regex.exec(url);

  if (match) {
    const videoId = match[1];
    const apiKey = environment.google_api_key; // Ensure environment.google_api_key is set
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    try {
      const { data } = await axios.get(apiUrl);

      if (data.items.length >= 0) {
        const snippet = data.items[0].snippet;
        const meta = {
          title: snippet.title || "",
          description: snippet.description || "",
          site_name: "YouTube",
          url: url,
          type: data.items[0]?.kind || "website",
          image:
            snippet.thumbnails?.default || snippet.thumbnails?.medium || "",
        };

        return { meta };
      } else {
        throw new Error("No video data found");
      }
    } catch (error) {
      console.error("Error fetching YouTube data:", error);
      return { meta: {} };
    }
  }

  return { meta: {} }; // Default return if URL is not a YouTube URL or extraction fails
}

exports.deletePost = function (req, res) {
  if (req.params.id) {
    const data = Post.deletePost(req.params.id);
    if (data) {
      res.send({
        error: false,
        message: "Post deleted successfully",
      });
    } else {
      return utils.send500(res, err);
    }
  } else {
    return utils.send404(res, err);
  }
};
exports.hidePost = function (req, res) {
  if (req.params.id) {
    const isDeleted = req.query.isDeleted;
    const data = Post.hidePost(req.params.id, isDeleted);
    if (data) {
      res.send({
        error: false,
        message: "Post hide successfully",
      });
    } else {
      return utils.send500(res, err);
    }
  } else {
    return utils.send404(res, err);
  }
};

exports.getPostComments = async function (req, res) {
  if (req.body) {
    // Post.getPostComments(req.params.id, function (err, comments) {
    //   if (err) {
    //     return utils.send500(res, err);
    //   } else {
    //     res.send({
    //       error: false,
    //       data: comments,
    //     });
    //   }
    // });
    const { profileId, postId } = req.body;
    const data = await Post.getPostComments(profileId, postId);
    if (data) {
      res.send({
        error: false,
        data: data,
      });
    }
  } else {
    return utils.send404(res, err);
  }
};

exports.deletePostComment = function (req, res) {
  if (req.params.id) {
    Post.deletePostComment(req.params.id, function (err) {
      if (err) {
        return utils.send500(res, err);
      } else {
        res.send({
          error: false,
          message: "Comment deleted sucessfully",
        });
      }
    });
  } else {
    return utils.send404(res, err);
  }
};
exports.deleteAllData = async function (req, res) {
  if (req.params.id) {
    await Post.deleteAllData(req.params.id);
    res.send({
      error: false,
      message: "Data deleted successfully",
    });
  } else {
    return utils.send404(res, err);
  }
};

exports.updateViewCount = async function (req, res) {
  const { viewcount } = req.body;
  if (req.params.id) {
    const postData = await Post.updateViewCount(req.params.id, viewcount);
    if (postData) {
      res.send({
        error: false,
        message: "Data update successfully",
        data: postData,
      });
    }
  } else {
    return utils.send404(res, err);
  }
};
