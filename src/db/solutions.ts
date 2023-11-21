import mongoose from "mongoose";
const SolutionSchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const solutionModel = mongoose.model("Solution", SolutionSchema);
export const getSolutions = () =>
  solutionModel.find().populate({
    path: "products",
  });

export const getSolutionById = (id: string) =>
  solutionModel.findById(id).populate({
    path: "products",
  });
// export const createSolution = (values: Record<string, any>) =>
//   new solutionModel(values).save().then((user) => user.toObject());
export const deleteSolutionById = (id: string) =>
  solutionModel.findOneAndDelete({ _id: id });
export const updateSolutionById = (id: string, values: Record<string, any>) =>
  solutionModel.findByIdAndUpdate(id, values, {
    new: true,
  });
