import express from "express";
import { home, search } from "../controllers/videoController";
import { publicOnlyMiddleware } from "../middleware";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";

const root = express.Router();

root.get("/", home);
root.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
root.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin);
root.get("/search", search);

export default root;
