import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3ImageUploader = multerS3({
  s3,
  bucket: "gotubee/images",
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3,
  bucket: "gotubee/videos",
  acl: "public-read",
});

const isCloudType = process.env.NODE_ENV === "production";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Gotube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isCloudType = isCloudType;
  return next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Log in First");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 1 * 1000 * 1000, // MB * 1000 * 1000
  },
  storage: isCloudType ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 30 * 1000 * 1000, // MB * 1000 * 1000
  },
  storage: isCloudType ? s3VideoUploader : undefined,
});
