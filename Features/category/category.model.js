const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: [true, 'Category name must be unique'],
      minLength: [3, 'Category name must be at least 3 characters'],
      maxLength: [30, 'Category name must be below 30 characters'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});

categorySchema.pre(/^find/, function () {
  const filter = this.getFilter();
  if (filter.isDeleted === undefined) {
    this.find({ isDeleted: { $ne: true } });
  }
});

categorySchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  const name = update?.name ?? update?.$set?.name;
  if (name) {
    this.set({ slug: slugify(name, { lower: true }) });
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;