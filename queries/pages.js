import { Page } from "@/model/page-model";

export async function createPage(page) {
  try {
    await Page.create(page);
  } catch (error) {
    throw new Error(error);
  }
}
