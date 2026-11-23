const ApiFeatures = require("../utils/ApiFeatures");

// Chainable stand-in for a Mongoose query that records the calls made on it.
function fakeQuery() {
  const calls = [];
  const q = { calls };
  ["find", "sort", "select", "skip", "limit"].forEach((m) => {
    q[m] = (arg) => (calls.push([m, arg]), q);
  });
  return q;
}
const last = (q, name) => q.calls.filter((c) => c[0] === name).pop()[1];

describe("ApiFeatures.filter", () => {
  test("turns gt, gte, lt, lte into Mongo operators", () => {
    const q = fakeQuery();
    const f = new ApiFeatures(q, { price: { gte: "100", lt: "500" } }).filter();
    expect(last(q, "find")).toEqual({ price: { $gte: "100", $lt: "500" } });
    expect(f.filterQuery).toEqual({ price: { $gte: "100", $lt: "500" } });
  });

  test("drops sort, search, fields, page, limit and skip", () => {
    const q = fakeQuery();
    new ApiFeatures(q, { sort: "a", search: "b", fields: "c", page: 1, limit: 2, skip: 3, brand: "acme" }).filter();
    expect(last(q, "find")).toEqual({ brand: "acme" });
  });
});

describe("ApiFeatures.search", () => {
  test("does nothing without a keyword", () => {
    const q = fakeQuery();
    new ApiFeatures(q, {}).search();
    expect(q.calls).toHaveLength(0);
  });

  test("searches name (prefix) and description, case-insensitive, and remembers the query", () => {
    const q = fakeQuery();
    const f = new ApiFeatures(q, { search: "shoe" }).search();
    const { $or } = last(q, "find");
    expect($or[0]).toEqual({ name: { $regex: "^shoe", $options: "i" } });
    expect($or[1]).toEqual({ description: { $regex: "shoe", $options: "i" } });
    expect(f.searchQuery.$or).toHaveLength(2);
  });
});

describe("ApiFeatures.sort, fields and pagination", () => {
  test("sorts newest first by default and uses a comma list when given", () => {
    const a = fakeQuery();
    new ApiFeatures(a, {}).sort();
    expect(last(a, "sort")).toBe("-createdAt");
    const b = fakeQuery();
    new ApiFeatures(b, { sort: "price,-name" }).sort();
    expect(last(b, "sort")).toBe("price -name");
  });

  test("hides __v by default", () => {
    const q = fakeQuery();
    new ApiFeatures(q, {}).fields();
    expect(last(q, "select")).toBe("-__v");
  });

  test("computes skip from page and limit", () => {
    const q = fakeQuery();
    new ApiFeatures(q, { page: 3, limit: 5 }).pagination();
    expect(last(q, "skip")).toBe(10);
    expect(last(q, "limit")).toBe(5);
  });
});
