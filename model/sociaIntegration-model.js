import mongoose, { Schema } from "mongoose";

const TokenInfoSchema = new Schema({
    page_access_token: { type: String, default: null },
    user_access_token: { type: String, default: null },
}, { _id: false });

const FacebookSchema = new Schema({
    page_name: String,
    page_id: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    connected_at: { type: Date, default: null },
}, { _id: false });

const InstagramSchema = new Schema({
    ig_business_id: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    connected_at: { type: Date, default: null },
}, { _id: false });

const WhatsAppSchema = new Schema({
    verified_name: String,
    business_phone_number: String,
    business_account_id: String,
    phone_number_id: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    connected_at: { type: Date, default: null },
}, { _id: false });


const PlatformDataSchema = new Schema({
    facebook: { type: FacebookSchema, default: () => ({}) },
    instagram: { type: InstagramSchema, default: () => ({}) },
    whatsapp: { type: WhatsAppSchema, default: () => ({}) },
}, { _id: false });

const SocialIntegrationsSchema = new Schema({
    user_id: { type: String, required: true },
    token_info: { type: TokenInfoSchema, default: () => ({}) },
    isActive: { type: Boolean, default: false },
    platform_data: { type: PlatformDataSchema, default: () => ({}) },
}, { timestamps: true });

SocialIntegrationsSchema.index({ user_id: 1 });

export const SocialIntegrations =
    mongoose.models.SocialIntegrations ||
    mongoose.model("SocialIntegrations", SocialIntegrationsSchema);
