import { extractList, extractRecord } from "./apiResponse";

test("extractList returns a bare array unchanged", () => {
  expect(extractList([1, 2, 3])).toEqual([1, 2, 3]);
});

test("extractList unwraps data arrays", () => {
  expect(extractList({ success: true, data: [1, 2] })).toEqual([1, 2]);
});

test("extractList can drill into a named key", () => {
  expect(
    extractList({ data: { teachers: [{ id: 1 }], total: 1 } }, "teachers"),
  ).toEqual([{ id: 1 }]);
});

test("extractList returns an empty array for unknown shapes", () => {
  expect(extractList(null)).toEqual([]);
  expect(extractList({ data: {} })).toEqual([]);
});

test("extractRecord unwraps a data object", () => {
  expect(extractRecord({ data: { id: "x" } })).toEqual({ id: "x" });
});

test("extractRecord returns the record directly when not wrapped", () => {
  expect(extractRecord({ id: "x" })).toEqual({ id: "x" });
  expect(extractRecord(null)).toBeNull();
});
