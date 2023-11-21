import mongoose from "mongoose";
const SubCategorySchema = new mongoose.Schema(
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
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
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

export const subCategoryModel = mongoose.model(
  "SubCategory",
  SubCategorySchema
);
export const getSubCategories = () =>
  subCategoryModel.find().populate("categories");

export const getSubCategoryById = (id: string) => subCategoryModel.findById(id);
// export const createSubCategory = (values: any) =>
//   new subCategoryModel(values).save().then((sub) => sub.toObject());
export const deleteSubCategoryById = (id: string) =>
  subCategoryModel.findOneAndDelete({ _id: id });
export const updateSubCategoryById = (
  id: string,
  values: Record<string, any>
) => subCategoryModel.findByIdAndUpdate(id, values);
