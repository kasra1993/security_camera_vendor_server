import mongoose from "mongoose";
const AffiliateSchema = new mongoose.Schema(
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
    lng: { type: Number, required: false },
    lat: { type: Number, required: false },
    name: { type: String, required: true },
    link: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
    description: { type: String, required: false },
    // subaffiliates: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "SubAffiliate",
    //     required: false,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

export const affiliateModel = mongoose.model("Affiliate", AffiliateSchema);
export const getAffiliates = () => affiliateModel.find();

export const getAffiliateById = (id: string) => affiliateModel.findById(id);
// export const createAffiliate = (values: Record<string, any>) =>
//   new affiliateModel(values).save().then((user) => user.toObject());
export const deleteAffiliateById = (id: string) =>
  affiliateModel.findOneAndDelete({ _id: id });
export const updateAffiliateById = (id: string, values: Record<string, any>) =>
  affiliateModel.findByIdAndUpdate(id, values, {
    new: true,
  });
