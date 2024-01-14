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
import { categoryModel } from "../db/categories";
import { solutionModel } from "../db/solutions";
// const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

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
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const product: any = await deleteProductById(id);
    if (product.image) {
      const imgId = product?.image?.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
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
    params: any;
  }>,
  res: express.Response
) => {
  console.log(req.body, "reqbody");

  try {
    const _id = req.params.id;
    const oldProduct: any = await ProductModel.findOne({ _id });
    console.log(oldProduct, "old product");

    const updatedProduct = <any>{
      series: req.body.series ? req.body.series : oldProduct.series,
      model: req.body.model ? req.body.model : oldProduct.model,
      title: req.body.title ? req.body.title : oldProduct.title,
      price: req.body.price ? req.body.price : oldProduct.price,
      description: req.body.description
        ? req.body.description
        : oldProduct.description,
      features: req.body.features ? req.body.features : oldProduct.features,
      slug: req.body.slug ? req.body.slug : oldProduct.slug,
      instock: req.body.instock ? req.body.instock : oldProduct.instock,
      // subcategories: req.body.subcategories,
      // categories: req.body.categories,
      // solutions: req.body.solutions,
      quantity: req.body.quantity ? req.body.quantity : oldProduct.quantity,
    };

    if (!updatedProduct) {
      return res.sendStatus(400);
    }
    if (req.body.image) {
      console.log("this shouldnt be shown");

      // const imgId = oldSubCategory[0].image.public_id;
      const imgId = oldProduct.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }

      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "products",
      });
      updatedProduct.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }
    // else {
    //   updatedProduct.image = {
    //     public_id: oldProduct.image.public_id,
    //     url: oldProduct.image.url,
    //   };
    // }

    if (req.body.categories) {
      var newCategories: any = req.body.categories;
      var oldCategories: any = oldProduct!.categories;
      var newCategoryIds = [];

      newCategoryIds.push(new mongoose.Types.ObjectId(newCategories));
      const newCatId = new mongoose.Types.ObjectId(newCategories);
      console.log(newCatId, "new Cat Id");
      updatedProduct.categories = newCatId;

      const catAdded = difference(newCategoryIds, oldCategories);
      const catRemoved = difference(oldCategories, newCategoryIds);
      console.log(catAdded, "catAdded");
      console.log(catRemoved, "catRemoved");

      await categoryModel.updateMany(
        { _id: catRemoved },
        { $pull: { products: oldProduct!._id } }
      );
      await categoryModel.updateMany(
        { _id: catAdded },
        { $addToSet: { products: oldProduct!._id } }
      );
    }
    if (req.body.subcategories) {
      const newSubCategories: any = req.body.subcategories;
      const oldSubCategories: any = oldProduct!.subcategories;
      let newSubCategoryIds = [];
      newSubCategoryIds.push(new mongoose.Types.ObjectId(newSubCategories));
      const newSubCatId = new mongoose.Types.ObjectId(newSubCategories);
      updatedProduct.subcategories = newSubCatId;
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
    }
    if (req.body.solutions) {
      const newSolutions: any = req.body.solutions;
      const oldSolutions: any = oldProduct!.solutions;
      let newSolutionIds = [];
      newSolutionIds.push(new mongoose.Types.ObjectId(newSolutions));
      const newSolutionId = new mongoose.Types.ObjectId(newSolutions);
      updatedProduct.solutions = newSolutionId;
      const solutionAdded = difference(newSolutionIds, oldSolutions);
      const solutionRemoved = difference(oldSolutions, newSolutionIds);
      await solutionModel.updateMany(
        { _id: solutionRemoved },
        { $pull: { products: oldProduct!._id } }
      );
      await solutionModel.updateMany(
        { _id: solutionAdded },
        { $addToSet: { products: oldProduct!._id } }
      );
    }

    if (oldProduct) {
      var newProduct = Object.assign(oldProduct, updatedProduct);
    }
    console.log(newProduct, "new product");
    const result = await ProductModel.findOneAndUpdate(
      { _id: newProduct._id },
      newProduct,
      {
        new: true,
      }
    );
    console.log(result, "this is result");

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
  // const url = req.protocol + "://" + req.get("host");
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "products",
    });
    const newProduct = <any>new ProductModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newProduct.save();

    await subCategoryModel.updateMany(
      { _id: newProduct!.subcategories },
      { $addToSet: { products: newProduct!._id } }
    );
    await categoryModel.updateMany(
      { _id: newProduct!.categories },
      { $addToSet: { products: newProduct!._id } }
    );
    await solutionModel.updateMany(
      { _id: newProduct!.solutions },
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
