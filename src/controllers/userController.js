import User from "../models/User";
import Video from "../models/Video";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, confirmPassword, location } =
    req.body;
  const pageTitle = "Join";
  if (!password) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Please write Password.",
    });
  }
  if (password != confirmPassword) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "this username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      avatarUrl:
        "https://gotubee.s3.ap-northeast-2.amazonaws.com/images/defaultImage.jpg",
      location,
    });
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
  req.flash("info", `User Created`);
  return res.redirect("/login");
};
export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, email: beforeEmail, username: beforeUsername, avatarUrl },
    },
    body: { email, username, name, location },
    file,
  } = req;
  const pageTitle = "Edit Profile";

  if (beforeEmail != email && (await User.exists({ email }))) {
    return res.status(400).render("edit-profile", {
      pageTitle,
      errorMessage: "this email is already taken.",
    });
  } else if (beforeUsername != username && (await User.exists({ username }))) {
    return res.status(400).render("edit-profile", {
      pageTitle,
      errorMessage: "this username is already taken.",
    });
  }
  const isCloudType = process.env.NODE_ENV === "production";
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      email,
      username,
      name,
      location,
      avatarUrl: file
        ? isCloudType
          ? file.location
          : "/" + file.path
        : avatarUrl,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  req.flash("success", `User Updated`);
  return res.redirect("/users/edit");
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("info", `Hello! ${user.name}`);
  return res.redirect("/");
};
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const { email } = emailData.find(
      (email) => email.primary == true && email.verified
    );
    if (!email) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: !userData.name ? userData.login : userData.name,
        username: userData.login,
        email,
        socialOnly: true,
        password: "",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    req.flash("info", `Hello! ${user.name}`);
    return res.redirect("/");
  } else {
    req.flash("error", `Login failed`);
    return res.redirect("/login");
  }
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly == true) {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { beforePassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(beforePassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }
  user.password = newPassword;
  await user.save();
  req.flash("info", `Password Updated`);
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    options: {
      sort: { createdAt: "desc" },
    },
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(400).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
