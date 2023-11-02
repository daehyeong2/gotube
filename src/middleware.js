import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Gotube";
  res.locals.loggedInUser = req.session.user || {};
  return next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 50 * 1000 * 1000, // MB * 1000 * 1000
  },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 1 * 1000 * 1000 * 1000, // GB * 1000 * 1000 * 1000
  },
});
