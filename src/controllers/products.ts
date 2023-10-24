import express from "express";
var mongoose = require("mongoose");
import {
  deleteProductById,
  getProductById,
  getProducts,
  ProductModel,
} from "../db/products";
import { subCategoryModel } from "../db/subCategories";
import { difference } from "../helpers";
const fs = require("fs");

interface MulterRequest extends express.Request {
  file: any;
}

export const getAllProducts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const products = await getProducts();
    return res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteProduct = async (
  req: express.Request,
  res: express.Response
) => {
  const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const product = await deleteProductById(id);
    if (product!.image) {
      const prevImage = product!.image.replace(url + "/", "");
      fs.unlink("public/" + prevImage, (err: any) => {
        if (err) {
          throw err;
        }

        console.log("Delete File successfully.");
      });
    }

    await subCategoryModel.updateMany(
      { _id: product!.subcategories },
      { $pull: { products: product!._id } }
    );

    return res.json(product);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateProduct = async (
  req: express.Request<{
    id: any;
    file: any;
    params: any;
  }>,
  res: express.Response
) => {
  const url = req.protocol + "://" + req.get("host");

  try {
    const _id = req.params.id;

    const updatedProduct = <any>{
      ...req.body,
      image:
        url + "/product/" + (req as unknown as MulterRequest).file.filename,
    };

    if (!updatedProduct) {
      return res.sendStatus(400);
    }

    const newSubCategories = updatedProduct!.subcategories || [];
    const oldProduct = await ProductModel.findOne({ _id });
    const oldSubCategories = oldProduct!.subcategories;

    // these are new ids turned into objectIDs with looping

    // const newSubCategoryIds = newSubCategories.map(
    //   (sub: { _id: string }) => new mongoose.Types.ObjectId(sub._id)
    // );
    let newSubCategoryIds = [];
    if (newSubCategories instanceof Array) {
      newSubCategoryIds = newSubCategories!.map(
        (sub: { _id: string }) => new mongoose.Types.ObjectId(sub._id)
      );
    } else {
      newSubCategoryIds.push(
        new mongoose.Types.ObjectId(newSubCategories!._id)
      );
    }
    if (oldProduct!.image) {
      var prevImage = oldProduct!.image.replace(url + "/", "");
    }

    Object.assign(oldProduct!, updatedProduct!);
    const newProduct = await oldProduct!.save();

    if (oldProduct!.image) {
      fs.unlink("public/" + prevImage!, (err: any) => {
        if (err) {
          throw err;
        }

        console.log("Delete File successfully.");
      });
    }

    const added = difference(newSubCategoryIds, oldSubCategories);
    const removed = difference(oldSubCategories, newSubCategoryIds);

    await subCategoryModel.updateMany(
      { _id: removed },
      { $pull: { products: oldProduct!._id } }
    );
    await subCategoryModel.updateMany(
      { _id: added },
      { $addToSet: { products: oldProduct!._id } }
    );

    return res.status(200).json(newProduct).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const createProduct = async (
  req: express.Request<{ file: any }>,
  res: express.Response
) => {
  const url = req.protocol + "://" + req.get("host");

  const newProduct = <any>new ProductModel({
    ...req.body,
    image: url + "/product/" + (req as unknown as MulterRequest).file!.filename,
  });

  try {
    await newProduct.save();

    await subCategoryModel.updateMany(
      { _id: newProduct!.subcategories },
      { $addToSet: { products: newProduct!._id } }
    );
    return res.status(200).json(newProduct!).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
export const getProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    console.log(id);

    const product = await getProductById(id);
    return res.status(200).json(product);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
