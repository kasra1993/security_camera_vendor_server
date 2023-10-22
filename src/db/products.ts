import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    series: { type: String, required: false },
    model: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    Features: { type: String, required: false },

    slug: { type: String, required: false },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
      },
    ],
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
      },
    ],
    // countInStock: {
    //   type: Number,
    //   required: false,
    //   min: 0,
    //   max: 255,
    // },
    instock: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel = mongoose.model("Product", ProductSchema);
export const getProducts = () => ProductModel.find().populate("subcategories");

export const getProductById = (id: any) => ProductModel.findById(id);

export const deleteProductById = (id: any) =>
  ProductModel.findOneAndDelete({ _id: id });
// export const updateProductById = (id: string, values: Record<string, any>) =>
//   ProductModel.findByIdAndUpdate(id, values);
