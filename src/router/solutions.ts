import express from "express";
import {
  getAllSolutions,
  deleteSolution,
  updateSolution,
  createSolution,
  getSolution,
} from "../controllers/solutions";
import { isAuthenticated, isOwner } from "../middlewares";
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const DIR = "./public/solution/";
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
  router.get("/solutions", getAllSolutions),
  router.delete("/solution/:id", deleteSolution),
  router.patch("/solution/:id", upload.single("image"), updateSolution),
  // router.post("/createSolution", isAuthenticated, isOwner, createSolution),
  router.post("/createSolution", upload.single("image"), createSolution),
  // router.post("/createSolution", createSolution),
  router.get("/getSolution/:id", getSolution),
  // router.get("/getSolution/:id", isAuthenticated, isOwner, getSolution),
];
