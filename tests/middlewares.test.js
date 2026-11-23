process.env.SECRET_KEY = "test-secret";
jest.mock("../Features/users/users.model");

const jwt = require("jsonwebtoken");
const User = require("../Features/users/users.model");
const auth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restrictTo");
const globalError = require("../middlewares/globalError");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const runAuth = async (authorization) => {
  const req = { headers: authorization ? { authorization } : {} };
  const next = jest.fn();
  auth(req, {}, next);
  await new Promise((r) => setImmediate(r)); // catchAsync does not return its promise
  return { req, err: next.mock.calls[0] && next.mock.calls[0][0], next };
};

describe("AppError and catchAsync", () => {
  test("AppError keeps status and is operational", () => {
    const e = new AppError("bad", 400);
    expect(e).toBeInstanceOf(Error);
    expect([e.message, e.status, e.isOperational]).toEqual(["bad", 400, true]);
  });

  test("catchAsync forwards errors to next", async () => {
    const boom = new Error("boom");
    const next = jest.fn();
    await catchAsync(async () => { throw boom; })({}, {}, next);
    expect(next).toHaveBeenCalledWith(boom);
  });
});

describe("auth middleware", () => {
  beforeEach(() => jest.resetAllMocks());

  test("401 when there is no Bearer header", async () => {
    const { err } = await runAuth(undefined);
    expect(err.status).toBe(401);
  });

  test("401 when the user from the token no longer exists", async () => {
    User.findById.mockResolvedValue(null);
    const token = jwt.sign({ id: "u1" }, "test-secret");
    const { err } = await runAuth(`Bearer ${token}`);
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/no longer exists/);
  });

  test("attaches the user for a valid token", async () => {
    User.findById.mockResolvedValue({ _id: "u1", role: "user" });
    const token = jwt.sign({ id: "u1" }, "test-secret");
    const { req, next } = await runAuth(`Bearer ${token}`);
    expect(User.findById).toHaveBeenCalledWith("u1");
    expect(req.user.role).toBe("user");
    expect(next).toHaveBeenCalledWith();
  });
});

describe("restrictTo", () => {
  const call = (user, ...roles) => {
    const next = jest.fn();
    restrictTo(...roles)({ user }, {}, next);
    return next.mock.calls[0][0];
  };

  test("lets an allowed role through", () => {
    expect(call({ role: "admin" }, "admin")).toBeUndefined();
  });

  test("403 for another role or a missing user", () => {
    expect(call({ role: "user" }, "admin").status).toBe(403);
    expect(call(undefined, "admin").status).toBe(403);
  });
});

describe("globalError", () => {
  const run = (err) => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.spyOn(console, "log").mockImplementation(() => {});
    globalError(err, {}, res, jest.fn());
    return res;
  };
  afterEach(() => { jest.restoreAllMocks(); delete process.env.NODE_ENV; });

  test("maps duplicate key errors to 400 with the field", () => {
    const e = new Error("dup"); e.code = 11000; e.keyValue = { email: "a@b.com" };
    const res = run(e);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/email/);
  });

  test("maps bad ObjectId to 400", () => {
    const e = new Error("cast"); e.kind = "ObjectId";
    expect(run(e).status).toHaveBeenCalledWith(400);
  });

  test("hides the stack in production and shows it otherwise", () => {
    const e = new AppError("nope", 404);
    expect(run(e).json.mock.calls[0][0].stack).toBeDefined();
    process.env.NODE_ENV = "PRODUCTION";
    expect(run(e).json.mock.calls[0][0].stack).toBeUndefined();
  });
});
