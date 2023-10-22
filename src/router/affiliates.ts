import express from "express";
import {
  getAllAffiliates,
  deleteAffiliate,
  updateAffiliate,
  createAffiliate,
  getAffiliate,
} from "../controllers/affiliates";
import { isAuthenticated, isOwner } from "../middlewares";
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const DIR = "./public/affiliate/";
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
  router.get("/affiliates", getAllAffiliates),
  router.delete("/affiliate/:id", deleteAffiliate),
  router.patch("/affiliate/:id", upload.single("image"), updateAffiliate),
  // router.post("/createAffiliate", isAuthenticated, isOwner, createAffiliate),
  router.post("/createAffiliate", upload.single("image"), createAffiliate),
  // router.post("/createAffiliate", createAffiliate),
  router.get("/getAffiliate/:id", getAffiliate),
  // router.get("/getCategory/:id", isAuthenticated, isOwner, getCategory),
];
