import express from "express";
import {
  deleteAffiliateById,
  getAffiliates,
  getAffiliateById,
  updateAffiliateById,
  affiliateModel,
} from "../db/affiliates";
// import { log } from "console";
// import { subCategoryModel } from "../db/subCategories";
// const multer = require("multer");
// const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

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
  // const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedAffiliate = await deleteAffiliateById(id);
    // console.log(deletedAffiliate, "deleted affiliate");

    // const prevImage = deletedAffiliate?.image?.replace(url + "/", "");
    // console.log(prevImage, "previous image");
    if (deletedAffiliate.image) {
      const imgId = deletedAffiliate.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    // await subCategoryModel.updateMany(
    //   { _id: deletedAffiliate.subcategories },
    //   { $pull: { categories: deletedCategory._id } }
    // );
    return res.status(200).json("old Affiliate got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateAffiliate = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // const url = req.protocol + "://" + req.get("host");

    const { id } = req.params;
    const previousAffiliate: any = await affiliateModel.find({ _id: id });
    // const prevImage = previousAffiliate[0]?.image?.replace(url + "/", "");

    const updatedAffiliate: any = {
      name: req.body.name ? req.body.name : previousAffiliate.name,
      lng: req.body.lng ? req.body.lng : previousAffiliate.lng,
      lat: req.body.lat ? req.body.lat : previousAffiliate.lat,
      link: req.body.link ? req.body.link : previousAffiliate.link,
      email: req.body.email ? req.body.email : previousAffiliate.email,
      description: req.body.description
        ? req.body.description
        : previousAffiliate.description,
    };
    if (previousAffiliate.image !== "") {
      const imgId = previousAffiliate[0].image?.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg: any = await cloudinary.uploader.upload(req.body.image, {
        folder: "products",
      });
      updatedAffiliate.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    const newAffiliate = await updateAffiliateById(id, updatedAffiliate);

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
  // const url = req.protocol + "://" + req.get("host");
  try {
    const result: any = await cloudinary.uploader.upload(req.body.image, {
      folder: "affiliates",
    });
    const newAffiliate = new affiliateModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

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
