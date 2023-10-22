import express from "express";
// import authentication from "./authentication";
// import users from "./users";
import products from "./products";
import categories from "./categories";
import subCategories from "./subCategories";
import solutions from "./solutions";
import affiliates from "./affiliates";
const router = express.Router();

export default (): express.Router => {
  // authentication(router);
  // users(router);
  products(router);
  subCategories(router);
  categories(router);
  solutions(router);
  affiliates(router);

  return router;
};
