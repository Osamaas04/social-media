import mongoose, { Schema } from "mongoose";

const instaSchema = new Schema({
  access_token: {
    required: true,
    type: String,
  },
  instagram_id: {
    required: true,
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

export const Insta = mongoose.models.Insta || mongoose.model("Insta", instaSchema);
