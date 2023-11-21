import express from "express";
var mongoose = require("mongoose");
const fs = require("fs");
import {
  getSubCategories,
  getSubCategoryById,
  deleteSubCategoryById,
  updateSubCategoryById,
} from "../db/subCategories";
import { subCategoryModel } from "../db/subCategories";
import { difference } from "../helpers";
import { categoryModel } from "../db/categories";
import { ProductModel } from "../db/products";
import { Description } from "@material-ui/icons";
const cloudinary = require("../utils/cloudinary");

// import { stringify } from "querystring";

interface MulterRequest extends express.Request {
  file: any;
}

export const getAllSubCategories = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const subCategories = await getSubCategories();
    return res.status(200).json(subCategories);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteSubCategory = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const deletedSubCategory: any = await deleteSubCategoryById(id);
    if (deletedSubCategory.image) {
      const imgId = deletedSubCategory.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedSubCategory!.image.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }
    await categoryModel.updateMany(
      { _id: deletedSubCategory!.categories },
      { $pull: { subcategories: deletedSubCategory!._id } }
    );
    await ProductModel.updateMany(
      { _id: deletedSubCategory!.products },
      { $pull: { subcategories: deletedSubCategory!._id } }
    );

    return res.status(200).json("subCategory got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateSubCategory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const _id = req.params.id;
    const oldSubCategory: any = await subCategoryModel.findOne({ _id });
    const updatedSubCategory: any = {
      // ...req.body,
      title: req.body.title ? req.body.title : oldSubCategory.title,
      description: req.body.description
        ? req.body.description
        : oldSubCategory.description,
      slug: req.body.slug ? req.body.slug : oldSubCategory.slug,
      categories: req.body.categories,
    };
    if (oldSubCategory.image !== "") {
      // const imgId = oldSubCategory[0].image.public_id;
      const imgId = oldSubCategory.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "subcategories",
      });
      updatedSubCategory.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // if (!updatedSubCategory) {
    //   return res.sendStatus(400);
    // }
    const newCategories: any = updatedSubCategory!.categories || [];
    // console.log(newCategories, "newCategories");

    const oldCategories: any = oldSubCategory?.categories;
    // console.log(oldCategories, "oldCategories");
    // these are new ids turned into objectIDs with looping
    let newCategoryIds = [];
    if (newCategories !== "") {
      //   newCategoryIds = newCategories.map(
      //     (cat: { _id: string }) => new mongoose.Types.ObjectId(cat._id)
      //   );
      // } else {
      // newCategoryIds.push(new mongoose.Types.ObjectId(newCategories._id));
      newCategoryIds.push(new mongoose.Types.ObjectId(newCategories));
    }
    // console.log(newCategoryIds, "new category ids");

    if (oldSubCategory) {
      Object.assign(oldSubCategory, updatedSubCategory);
    }
    // console.log(oldSubCategory, "old sub cateogry");

    const newSubCategory = await oldSubCategory!.save();
    console.log(newSubCategory, "new sub category");

    const added = difference(newCategoryIds, oldCategories);
    console.log(added, "added");

    const removed = difference(oldCategories, newCategoryIds);
    console.log(removed, "removed");

    await categoryModel.updateMany(
      { _id: removed },
      { $pull: { subCategories: oldSubCategory!._id } }
    );
    await categoryModel.updateMany(
      { _id: added },
      { $addToSet: { subCategories: oldSubCategory!._id } }
    );

    return res.status(200).json(newSubCategory).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const createSubCategory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "subcategories",
    });
    // const url = req.protocol + "://" + req.get("host");
    const newSubCategory = new subCategoryModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      // url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    });
    // console.log(newSubCategory);

    await newSubCategory.save();

    await categoryModel.updateMany(
      { _id: newSubCategory.categories },
      { $addToSet: { subcategories: newSubCategory._id } }
    );
    return res.status(200).json(newSubCategory).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getSubCategory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const product = await getSubCategoryById(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
