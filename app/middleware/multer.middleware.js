const multer = require("multer");
const fs = require("fs");

// Excel
const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    return cb("The uploaded file, isn't compatible :( we're sorry");
  }
};

let storageExcel = multer.diskStorage({
  destination: (req, file, cb) => {

    let dir = `${process.cwd()}/public/uploads/excel/`;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    
    return cb(null, dir);

  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-YOSANGGI-${file.originalname}`);
  },
});

let uploadFileExcel = multer({ storage: storageExcel, fileFilter: excelFilter }).single("file");

exports.uploadExcel = (req, res, next) => {

  uploadFileExcel(req, res, function (err) {

      if (err) {
          return res.status(200).json(result = {
            code: "01",
            message: "The uploaded file, isn't compatible :( we're sorry",
            data: {},
        });
      }
      next()
  })
}

//  PDF
const pdfFilter = (req, file, cb) => {

  if (!file.originalname.toLowerCase().endsWith("pdf")) {
    return cb(new Error("please upload PDF file extension"));
  }
  cb(null, true);

};

let pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {

    let dir = `${process.cwd()}/public/uploads/pdf`;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, {
        recursive: true
      });
    }
    
    return cb(null, dir);

  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${req.params.folder}-${req.params.code}-${file.originalname}`);
  },
});

let uploadFilePdf = multer({ storage: pdfStorage, fileFilter: pdfFilter }).single("file");

exports.uploadPDF = (req, res, next) => {

  uploadFilePdf(req, res, function (err) {

      if (err) {
          return res.status(200).json(result = {
            code: "01",
            message: "The uploaded file, isn't compatible :( we're sorry",
            data: {},
        });
      }
      next()
  })
}
