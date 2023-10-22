import express from "express";
import {
  getAllCategories,
  deleteCategory,
  updateCategory,
  createCategory,
  getCategory,
} from "../controllers/categories";
import { isAuthenticated, isOwner } from "../middlewares";
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const DIR = "./public/category/";
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: (arg0: any, arg1: any) => void) => {
    cb(null, DIR);
  },
  filename: (
    req: any,
    file: { originalname: any },
    cb: (arg0: null, arg1: any) => void
  ) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});
var upload = multer({
  storage: storage,
  fileFilter: (
    req: any,
    file: { mimetype: any },
    cb: (arg0: any, arg1: boolean) => void
  ) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return new Error("Only .png, .jpg and .jpeg format allowed!");
    }
  },
});

export default (router: express.Router) => [
  router.get("/categories", getAllCategories),
  router.delete("/category/:id", deleteCategory),
  router.patch("/category/:id", upload.single("image"), updateCategory),
  // router.post("/createCategory", isAuthenticated, isOwner, createCategory),
  router.post("/createCategory", upload.single("image"), createCategory),
  // router.post("/createCategory", createCategory),
  router.get("/getCategory/:id", getCategory),
  // router.get("/getCategory/:id", isAuthenticated, isOwner, getCategory),
];
