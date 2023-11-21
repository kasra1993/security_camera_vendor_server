import express from "express";
import {
  deleteSolutionById,
  getSolutions,
  getSolutionById,
  updateSolutionById,
  solutionModel,
} from "../db/solutions";

const cloudinary = require("../utils/cloudinary");

export const getAllSolutions = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const solutions = await getSolutions();
    return res.status(200).json(solutions);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const deleteSolution = async (
  req: express.Request,
  res: express.Response
) => {
  // const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedSolution: any = await deleteSolutionById(id);
    if (deletedSolution.image) {
      const imgId = deletedSolution.image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
    }
    // var prevImage = deletedSolution?.image?.replace(url + "/", "");
    // if (prevImage) {
    //   fs.unlink("public/" + prevImage, (err: any) => {
    //     if (err) {
    //       throw err;
    //     }

    //     console.log("Delete File successfully.");
    //   });
    // }

    // await subSolutionModel.updateMany(
    //   { _id: deletedSolution.subsolutions },
    //   { $pull: { solutions: deletedSolution._id } }
    // );
    return res.status(200).json("old solution got deleted").end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const updateSolution = async (
  req: express.Request,
  res: express.Response
) => {
  // if (req.body || req.file || req.params) {
  //   console.log(req.body, "body request");
  //   console.log(req.params, "params request");
  //   console.log(req.file, "file request");
  // }
  // const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const previousSolution: any = await solutionModel.find({ _id: id });
    // if (previousSolution[0]) {
    //   var prevImage = previousSolution[0]?.image?.replace(url + "/", "");
    // }
    // console.log(prevImage, "this is prev image");

    const updatedSolution: any = {
      title: req.body.title ? req.body.title : previousSolution.title,
      description: req.body.description
        ? req.body.description
        : previousSolution.description,
    };
    if (previousSolution.image !== "") {
      const imgId = previousSolution[0].image.public_id;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
      }
      const newImg = await cloudinary.uploader.upload(req.body.image, {
        folder: "solutions",
      });
      updatedSolution.image = {
        public_id: newImg.public_id,
        url: newImg.secure_url,
      };
    }

    const newSolution = await updateSolutionById(id, updatedSolution);

    return res.status(200).json(newSolution).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};

export const createSolution = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "solutions",
    });
    const newSolution = new solutionModel({
      ...req.body,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    await newSolution.save();

    return res.status(200).json(newSolution).end();
  } catch (error) {
    res.sendStatus(400);
  }
};
export const getSolution = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    const solution = await getSolutionById(id);

    return res.status(200).json(solution);
  } catch (error) {
    res.sendStatus(400);
  }
};
