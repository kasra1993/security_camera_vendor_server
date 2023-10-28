import express from "express";
import {
  deleteSolutionById,
  getSolutions,
  getSolutionById,
  updateSolutionById,
  solutionModel,
} from "../db/solutions";
// import { subSolutionModel } from "../db/subSolutions";
// const multer = require("multer");
const fs = require("fs");

interface MulterRequest extends express.Request {
  file: any;
}

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
  const url = req.protocol + "://" + req.get("host");
  try {
    const { id } = req.params;
    const deletedSolution = await deleteSolutionById(id);

    var prevImage = deletedSolution?.image?.replace(url + "/", "");

    fs.unlink("public/" + prevImage, (err: any) => {
      if (err) {
        throw err;
      }

      console.log("Delete File successfully.");
    });

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
  if (req.body || req.file || req.params) {
    console.log(req.body, "body request");
    console.log(req.params, "params request");
    console.log(req.file, "file request");
  }
  const url = req.protocol + "://" + req.get("host");

  try {
    const { id } = req.params;
    const previousSolution = await solutionModel.find({ _id: id });
    if (previousSolution[0]) {
      var prevImage = previousSolution[0]?.image?.replace(url + "/", "");
    }
    // console.log(prevImage, "this is prev image");

    const updatedSolution = {
      ...req.body,
      image:
        url + "/solution/" + (req as unknown as MulterRequest).file.filename,
    };

    const newSolution = await updateSolutionById(id, updatedSolution);
    fs.unlink("public/" + prevImage, (err: any) => {
      if (err) {
        throw err;
      }

      console.log("Delete File successfully.");
    });
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
  console.log(req.body, "this is the body of request");

  const url = req.protocol + "://" + req.get("host");
  const newSolution = new solutionModel({
    ...req.body,
    image: url + "/solution/" + (req as unknown as MulterRequest).file.filename,
  });
  // const imageName = req.file.filename;
  // const description = req.body.description;
  // const title = req.body.title;
  // const subsolutions = req.body.subSolutions;

  // Save this data to a database probably

  // console.log(description, title, subsolutions);
  // const upload = multer({ dest: "images/" });
  try {
    await newSolution.save();

    return res.status(200).json(newSolution).end();
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
export const getSolution = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    // console.log(id, "this is ID");

    const solution = await getSolutionById(id);
    // console.log(solution);

    return res.status(200).json(solution);
  } catch (error) {
    // console.log(error);
    res.sendStatus(400);
  }
};
