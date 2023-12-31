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

// interface MulterRequest extends express.Request {
//   file: any;
// }

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
    // if (product!.image) {
    //   const prevImage = product!.image.replace(url + "/", "");
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

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
  // if (req.body || req.file || req.params) {
  //   console.log(req.body, "body request");
  //   console.log(req.params, "params request");
  //   console.log(req.file, "file request");
  // }
  // const url = req.protocol + "://" + req.get("host");

  try {
    const _id = req.params.id;
    const oldProduct: any = await ProductModel.findOne({ _id });

    const updatedProduct = <any>{
      // ...req.body,
      series: req.body.series ? req.body.series : oldProduct.series,
      model: req.body.model ? req.body.model : oldProduct.model,
      price: req.body.price ? req.body.price : oldProduct.price,
      description: req.body.description
        ? req.body.description
        : oldProduct.description,
      features: req.body.features ? req.body.features : oldProduct.features,
      slug: req.body.slug ? req.body.slug : oldProduct.slug,
      instock: req.body.instock ? req.body.instock : oldProduct.instock,
      subcategories: req.body.subcategories,
    };

    if (!updatedProduct) {
      return res.sendStatus(400);
    }
    if (oldProduct.image !== "") {
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

    const newSubCategories: any = updatedProduct!.subcategories || [];
    // const oldProduct = await ProductModel.findOne({ _id });
    const oldSubCategories = oldProduct!.subcategories;

    // these are new ids turned into objectIDs with looping

    // const newSubCategoryIds = newSubCategories.map(
    //   (sub: { _id: string }) => new mongoose.Types.ObjectId(sub._id)
    // );
    let newSubCategoryIds = [];
    // if (newSubCategories instanceof Array) {
    if (newSubCategories !== "") {
      //   newSubCategoryIds = newSubCategories!.map(
      //     (sub: { _id: string }) => new mongoose.Types.ObjectId(sub._id)
      //   );
      // } else {
      newSubCategoryIds.push(new mongoose.Types.ObjectId(newSubCategories));
    }
    // if (oldProduct!.image) {
    //   var prevImage = oldProduct!.image.replace(url + "/", "");
    // }
    if (oldProduct) {
      Object.assign(oldProduct, updatedProduct);
    }
    const newProduct = await oldProduct!.save();

    // if (oldProduct!.image) {
    //   fs.unlink("public/" + prevImage!, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

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
