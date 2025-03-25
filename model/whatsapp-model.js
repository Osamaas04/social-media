import mongoose, { Schema } from "mongoose";

const whatsSchema = new Schema({
  name: {
    required: true,
    type: String,
  },
  phone_number: {
    required: true,
    type: String,
  },
  whatsapp_business_account_id: {
    required: true,
    type: String,
  },
  phone_number_id: {
    required: true,
    type: String,
  },
  user_access_token: {
    required: true,
    type: String,
  },
  access_token: {
    required: true,
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

export const Whats = mongoose.models.Whats || mongoose.model("Whats", whatsSchema);
