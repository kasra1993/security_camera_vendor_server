import express from "express";
import {
  deleteCategoryById,
  getCategories,
  getCategoryById,
  updateCategoryById,
  categoryModel,
} from "../db/categories";
import { subCategoryModel } from "../db/subCategories";
// const multer = require("multer");
// const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

interface MulterRequest extends express.Request {
  file: any;
}
// interface previousCategory extends express. {
//   image: any;
// }

export const getAllCategories = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const categories = await getCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteCategory = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedCategory: any = await deleteCategoryById(id);
    // console.log(deletedCategory, "deleted category");

    if (deletedCategory.image) {
      const imgId = deletedCategory.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // const prevImage = deletedCategory?.image?.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    await subCategoryModel.updateMany(
      { _id: deletedCategory!.subcategories },
      { $pull: { categories: deletedCategory!._id } }
    );
    return res.status(200).json("old category got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateCategory = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;

    const previousCategory: any = await categoryModel.find({
      _id: id,
    });
    // console.log(previousCategory[0], "prev category");
    const updatedCategory: any = {
      title: req.body.title ? req.body.title : previousCategory[0]?.title,
      description: req.body.description
        ? req.body.description
        : previousCategory[0]?.description,
      subcategories: previousCategory[0]?.subcategories,

      // image:
      //   url +
      //     "/category/" +
      //     (req as unknown as MulterRequest)!.file!.filename! ||
      //   previousCategory[0].image,
    };

    if (previousCategory.image !== "") {
      const imgId = previousCategory[0].image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "categories",
      });
      updatedCategory.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // const prevImage = previousCategory[0]?.image?.replace(url + "/", "");
    // console.log(updatedCategory, "updatedCat");

    const newCategory = await updateCategoryById(id, updatedCategory);

    // prevImage &&
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    return res.status(200).json(newCategory).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const createCategory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "categories",
    });
    // console.log(result);

    // const url = req.protocol + "://" + req.get("host");
    const newCategory = new categoryModel({
      ...req.body,
      // image: url + "/category/" + (req as unknown as MulterRequest).file.filename,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
    // console.log(newCategory);
    await newCategory.save();

    return res.status(200).json(newCategory).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getCategory = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    // console.log(id, "this is ID");

    const category = await getCategoryById(id);
    // console.log(category);

    return res.status(200).json(category);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
