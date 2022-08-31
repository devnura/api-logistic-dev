const multer = require("multer");
const fs = require("fs");
const helper = require("../helpers/helper")
//  PDF
const pdfFilter = (req, file, cb) => {
  if (!file.originalname.toLowerCase().endsWith("pdf")) {
    return cb(new Error("please upload PDF file extension"));
  }
  cb(null, true);
};

let pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {

    let dir = `${process.cwd()}/${process.env.STATIC_PATH_PDF}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      });
    }

    return cb(null, dir);

  },
  filename: (req, file, cb) => {
    let random = helper.getRandomStrig()
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, `${Date.now()}-${random}.${extension}`);
  },
});

let uploadFilePdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 2097152
  }
}).single("file");

exports.uploadPDF = (req, res, next) => {

  uploadFilePdf(req, res, function (err) {

    if (err) {
      return res.status(200).json(result = {
        code: "01",
        message: err.message,
        data: {},
      });
    }

    if (!req.file) {
      return res.status(200).json(result = {
        code: "01",
        message: "Please uplad a PDF",
        data: {},
      });
    }
    
    next()
  })
}