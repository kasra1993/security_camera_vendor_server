import express from "express";
import products from "./products";
import categories from "./categories";
import subCategories from "./subCategories";
import solutions from "./solutions";
import affiliates from "./affiliates";
import users from "./users";
import auth from "./auth";
const router = express.Router();

export default (): express.Router => {
  users(router);
  products(router);
  subCategories(router);
  categories(router);
  solutions(router);
  affiliates(router);
  auth(router);

  return router;
};
