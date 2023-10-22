import express from "express";
import {
  getAllSubCategories,
  getSubCategory,
  deleteSubCategory,
  updateSubCategory,
  createSubCategory,
} from "../controllers/subCategories";
// import { isAuthenticated, isOwner } from "../middlewares";
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const DIR = "./public/subcategory";
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: (arg0: any, arg1: any) => void) => {
    cb(null, DIR);
  },
  filename: (
    req: any,
    file: { originalname: any },
    cb: (arg0: any, arg1: any) => void
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
  router.get("/subCategories", getAllSubCategories),
  router.get("/subCategory/:id", getSubCategory),
  router.delete(
    "/subCategory/:id",

    deleteSubCategory
  ),
  router.patch("/subCategory/:id", upload.single("image"), updateSubCategory),
  router.post("/createSubCategory", upload.single("image"), createSubCategory),
];
