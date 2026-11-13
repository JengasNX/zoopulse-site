import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeComparison, toggleComparison, COMPARISON_LIMIT } from "../src/lib/comparison.ts";

test("only known ids, no duplicates, at most three", () => {
  assert.deepEqual(sanitizeComparison(["a1", "a1", null, "unknown", "a2", "a3", "a4"], ["a1", "a2", "a3", "a4"]), ["a1", "a2", "a3"]);
});
test("invalid stored payload is ignored", () => {
  for (const input of [null, {}, "a1", 42]) assert.deepEqual(sanitizeComparison(input, ["a1"]), []);
});
test("toggle adds, removes, and preserves source", () => {
  const original = ["a1"];
  assert.deepEqual(toggleComparison(original, "a2"), ["a1", "a2"]);
  assert.deepEqual(toggleComparison(original, "a1"), []);
  assert.deepEqual(original, ["a1"]);
});
test("fourth selection is rejected, removal still works", () => {
  const full = ["a1", "a2", "a3"];
  assert.equal(full.length, COMPARISON_LIMIT);
  assert.deepEqual(toggleComparison(full, "a4"), full);
  assert.deepEqual(toggleComparison(full, "a2"), ["a1", "a3"]);
});
