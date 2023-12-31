import express from "express";
import {
  getAllAffiliates,
  deleteAffiliate,
  updateAffiliate,
  createAffiliate,
  getAffiliate,
} from "../controllers/affiliates";

export default (router: express.Router) => [
  router.get("/affiliates", getAllAffiliates),
  router.delete("/affiliate/:id", deleteAffiliate),
  router.patch("/affiliate/:id", updateAffiliate),
  // router.post("/createAffiliate", isAuthenticated, isOwner, createAffiliate),
  router.post("/createAffiliate", createAffiliate),
  // router.post("/createAffiliate", createAffiliate),
  router.get("/getAffiliate/:id", getAffiliate),
  // router.get("/getCategory/:id", isAuthenticated, isOwner, getCategory),
];
