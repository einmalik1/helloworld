import { expect, test } from "@playwright/test";

test("web shell renders brand", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello World")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Web shell" })).toBeVisible();
});
