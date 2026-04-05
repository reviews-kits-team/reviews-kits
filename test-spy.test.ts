import { spyOn, mock, expect, test } from "bun:test";
const obj = { getReviews: () => "real" };
const spy = spyOn(obj, 'getReviews').mockImplementation(() => "fake");
test("spy works", () => {
  expect(obj.getReviews()).toBe("fake");
});
