import { Whats } from "@/model/whatsapp-model";

export async function createWhats(whats) {
  try {
    await Whats.create(whats);
  } catch (error) {
    throw new Error(error);
  }
}
