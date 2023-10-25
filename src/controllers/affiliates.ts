import express from "express";
import {
  deleteAffiliateById,
  getAffiliates,
  getAffiliateById,
  updateAffiliateById,
  affiliateModel,
} from "../db/affiliates";
// import { subCategoryModel } from "../db/subCategories";
// const multer = require("multer");
const fs = require("fs");

interface MulterRequest extends express.Request {
  file: any;
}

export const getAllAffiliates = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const affiliates = await getAffiliates();
    return res.status(200).json(affiliates);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteAffiliate = async (
  req: express.Request,
  res: express.Response
) => {
  const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedAffiliate = await deleteAffiliateById(id);
    // console.log(deletedAffiliate, "deleted affiliate");

    const prevImage = deletedAffiliate?.image?.replace(url + "/", "");
    // console.log(prevImage, "previous image");

    fs.unlink("public/" + prevImage, (err: any) => {
      if (err) {
        throw err;
      }

      console.log("Delete File successfully.");
    });

    // await subCategoryModel.updateMany(
    //   { _id: deletedAffiliate.subcategories },
    //   { $pull: { categories: deletedCategory._id } }
    // );
    return res.status(200).json("old category got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateAffiliate = async (
  req: express.Request,
  res: express.Response
) => {
  const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const previousAffiliate = await affiliateModel.find({ _id: id });
    const prevImage = previousAffiliate[0]?.image?.replace(url + "/", "");

    const updatedAffiliate = {
      ...req.body,
      image:
        url + "/affiliate/" + (req as unknown as MulterRequest).file.filename,
    };

    const newAffiliate = await updateAffiliateById(id, updatedAffiliate);
    fs.unlink("public/" + prevImage, (err: any) => {
      if (err) {
        throw err;
      }

      console.log("Delete File successfully.");
    });
    return res.status(200).json(newAffiliate).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const createAffiliate = async (
  req: express.Request,
  res: express.Response
) => {
  const url = req.protocol + "://" + req.get("host");
  const newAffiliate = new affiliateModel({
    ...req.body,
    image:
      url + "/affiliate/" + (req as unknown as MulterRequest).file.filename,
  });
  // const imageName = req.file.filename;
  // const description = req.body.description;
  // const title = req.body.title;
  // const subcategories = req.body.subCategories;

  // Save this data to a database probably

  // console.log(description, title, subcategories);
  // const upload = multer({ dest: "images/" });
  try {
    await newAffiliate.save();

    return res.status(200).json(newAffiliate).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getAffiliate = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    // console.log(id, "this is ID");

    const affiliate = await getAffiliateById(id);
    // console.log(category);

    return res.status(200).json(affiliate);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
