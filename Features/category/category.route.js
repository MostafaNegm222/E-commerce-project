const router = require("express").Router();
const auth = require("../../middlewares/authMiddleware");
const restrictTo = require("../../middlewares/restrictTo");
const { uploadTo } = require("../../config/cloudinary");
const {
  getAllCategories,
  getCategory,
  updateCategory,
  createCategory,
  softDeleteCategory,
  deleteCategory,
} = require("./category.controller");

router.get("/", getAllCategories);
router.get("/:id", getCategory);

router.use(auth, restrictTo("admin"));

router.post("/", uploadTo("categories").single("image"), createCategory);

router.patch("/:id", uploadTo("categories").single("image"), updateCategory);

router.patch("/:id/soft-delete", softDeleteCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
