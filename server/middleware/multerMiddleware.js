import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Add fileFilter to Multer for image validation
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith("image")) {
    return cb(new Error("Not an image! Please upload only images."), false);
  }
  cb(null, true);
};

// Add file size limit and the fileFilter
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB file size limit
  fileFilter: (req, file, cb) => {
    console.log("Checking file filter...");
    if (!file.mimetype.startsWith("image")) {
      return cb(new Error("Only image files are allowed!"), false); // Allow only image files
    }
    cb(null, true);
  },
});
