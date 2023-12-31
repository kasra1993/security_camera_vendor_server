import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
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
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: false,
      },
    ],
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

export const categoryModel = mongoose.model("Category", CategorySchema);
export const getCategories = () =>
  categoryModel.find().populate({
    path: "subcategories",
    populate: {
      path: "products",
      model: "Product",
    },
  });

export const getCategoryById = (id: string) =>
  categoryModel.findById(id).populate({
    path: "subcategories",
    populate: {
      path: "products",
      model: "Product",
    },
  });
// export const createCategory = (values: Record<string, any>) =>
//   new categoryModel(values).save().then((user) => user.toObject());
export const deleteCategoryById = (id: string) =>
  categoryModel.findOneAndDelete({ _id: id });
export const updateCategoryById = (id: string, values: Record<string, any>) =>
  categoryModel.findByIdAndUpdate(id, values, {
    new: true,
  });
