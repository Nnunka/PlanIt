const multer = require("multer");

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Save file with a unique name
  },
});

const upload = multer({ storage });
module.exports = upload;
