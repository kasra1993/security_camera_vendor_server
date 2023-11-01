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
  const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const deletedSubCategory = await deleteSubCategoryById(id);
    const prevImage = deletedSubCategory!.image.replace(url + "/", "");
    if (prevImage) {
      fs.unlink("public/" + prevImage, (err: any) => {
        if (err) {
          throw err;
        }

        console.log("Delete File successfully.");
      });
    }
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
  // if (req.body || req.file || req.params) {
  //   console.log(req.body, "body request");
  //   console.log(req.params, "params request");
  //   console.log(req.file, "file request");
  // }
  const url = req.protocol + "://" + req.get("host");

  try {
    const _id = req.params.id;

    const updatedSubCategory = {
      ...req.body,
      image:
        url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
    };
    if (!updatedSubCategory) {
      return res.sendStatus(400);
    }
    const newCategories = updatedSubCategory!.categories || [];
    const oldSubCategory = await subCategoryModel.findOne({ _id });
    const oldCategories = oldSubCategory?.categories;
    // these are new ids turned into objectIDs with looping
    let newCategoryIds = [];
    if (newCategories instanceof Array) {
      newCategoryIds = newCategories.map(
        (cat: { _id: string }) => new mongoose.Types.ObjectId(cat._id)
      );
    } else {
      newCategoryIds.push(new mongoose.Types.ObjectId(newCategories._id));
    }

    const prevImage = oldSubCategory?.image?.replace(url + "/", "");
    if (oldSubCategory) {
      Object.assign(oldSubCategory, updatedSubCategory);
    }
    const newSubCategory = await oldSubCategory!.save();
    if (prevImage) {
      fs.unlink("public/" + prevImage, (err: any) => {
        if (err) {
          throw err;
        }

        console.log("Delete File successfully.");
      });
    }

    const added = difference(newCategoryIds, oldCategories);
    const removed = difference(oldCategories, newCategoryIds);

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
  const url = req.protocol + "://" + req.get("host");
  const newSubCategory = new subCategoryModel({
    ...req.body,
    image:
      url + "/subcategory/" + (req as unknown as MulterRequest).file.filename,
  });

  try {
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
