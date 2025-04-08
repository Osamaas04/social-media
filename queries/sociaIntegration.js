import { SocialIntegrations } from "@/model/sociaIntegration-model";

export async function createSocialIntegrations(socialIntegrations) {
  try {
    await SocialIntegrations.create(socialIntegrations);
  } catch (error) {
    throw new Error(error);
  }
}
