const { validationResult } = require("express-validator");
const BlogPost = require("../models/blog");
const path = require("path");
const fs = require("fs");

exports.createBlogPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error("Input value tidak sesuai");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!req.file) {
    const err = new Error("Image harus di upload");
    err.errorStatus = 422;
    throw err;
  }

  const title = req.body.title;
  const image = req.file.path;
  const body = req.body.body;

  const Posting = new BlogPost({
    title: title,
    body: body,
    image: image,
    author: {
      uid: 1,
      name: "Rizkan Firmansyah",
    },
  });

  Posting.save()
    .then((result) => {
      res.status(201).json({
        message: "Create Blog Post Success",
        data: result,
      });
    })
    .catch((err) => {
      console.log(error);
    });
};

exports.getAllBlogPost = (req, res, next) => {
  const currentPage = parseInt(req.query.page )|| 1;
  const perPage = parseInt(req.query.perPage) || 5;
  let totalItems;

  BlogPost.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return BlogPost.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    })
    .then((result) => {
      res.status(200).json({
        message: "Data Blog Post Berhasil dipanggil",
        data: result,
        total_data:totalItems,
        per_page : perPage,
        current_page : currentPage
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getBlogPostById = (req, res, next) => {
  const id = req.params.id;
  BlogPost.findById(id)
    .then((result) => {
      if (!result) {
        const error = new Error("Blog post tidak ditemukan!!!");
        err.errorStatus = 404;
        throw error;
      }
      res.status(200).json({
        messsage: "Data blog berhasil dipanggil",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateBlogPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error("Input value tidak sesuai");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!req.file) {
    const err = new Error("Image harus di upload");
    err.errorStatus = 422;
    throw err;
  }

  const title = req.body.title;
  const image = req.file.path;
  const body = req.body.body;
  const id = req.params.id;

  BlogPost.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("Blog post tidak ditemukan!!!");
        err.errorStatus = 404;
        throw err;
      }

      post.title = title;
      post.body = body;
      post.image = image;

      return post.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Data Berhasil di Update",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteBlogPost = (req, res, next) => {
  const id = req.params.id;

  BlogPost.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("Blog post tidak ditemukan!!!");
        err.errorStatus = 404;
        throw err;
      }

      removeImage(post.image);
      return BlogPost.findByIdAndRemove(id);
    })
    .then((result) => {
      res.status(200).json({
        message: "Hapus Data Blog Berhasil!",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
    });
};

const removeImage = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
