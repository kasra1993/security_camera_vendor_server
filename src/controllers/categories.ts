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
const fs = require("fs");

interface MulterRequest extends express.Request {
  file: any;
}

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
  const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedCategory = await deleteCategoryById(id);

    const prevImage = deletedCategory?.image?.replace(url + "/", "");

    fs.unlink("public/" + prevImage!, (err: any) => {
      if (err) {
        throw err;
      }

      console.log("Delete File successfully.");
    });

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
  // if (req!.body || req!.file || req!.params) {
  //   console.log(req!.body, "body request");
  //   console.log(req!.params, "params request");
  //   console.log(req!.file, "file request");
  // }
  console.log(req);
  const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const previousCategory = await categoryModel.find({ _id: id });
    const prevImage = previousCategory[0]?.image?.replace(url + "/", "");

    const updatedCategory = {
      ...req.body,
      image:
        url + "/category/" + (req as unknown as MulterRequest)!.file!.filename,
    };

    const newCategory = await updateCategoryById(id, updatedCategory);

    prevImage &&
      fs.unlink("public/" + prevImage!, (err: any) => {
        if (err) {
          throw err;
        }

        console.log("Delete File successfully.");
      });
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
  const url = req.protocol + "://" + req.get("host");
  const newCategory = new categoryModel({
    ...req.body,
    image: url + "/category/" + (req as unknown as MulterRequest).file.filename,
  });
  // const imageName = req.file.filename;
  // const description = req.body.description;
  // const title = req.body.title;
  // const subcategories = req.body.subCategories;

  // Save this data to a database probably

  // console.log(description, title, subcategories);
  // const upload = multer({ dest: "images/" });
  try {
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
