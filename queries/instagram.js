import { Insta } from "@/model/insta-model";

export async function createInsta(insta) {
  try {
    await Insta.create(insta);
  } catch (error) {
    throw new Error(error);
  }
}
