require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

// const url =  require('url');
const path =  require('path');
// console.log(process.cwd())
// const __filename = url(import.meta.url);
// const __dirname = dirname(__filename);

// console.log( __dirname)
const winston = require("./app/helpers/winston.logger");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================== ROUTES API ==============================

const router = express.Router();

const authRoute = require("./app/routes/auth.routes");
const userRoute = require("./app/routes/user.routes");
const documentRoute = require("./app/routes/documment.routes");
const groupRoute = require("./app/routes/group.routes");

// app.use('/static', express.static('public'))
app.use("/"+process.env.PATH_PDF, express.static(path.join(__dirname, process.env.PATH_PDF)))
app.use("/"+process.env.PATH_PDF, express.static(path.join(__dirname, process.env.PATH_EXCEL)))
// app.use(express.static(path.join(__dirname, 'public')));
//route v1
app.use('/api/v1/', router);
// console.log( __basedir)
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to document app.",
  });
});

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/document", documentRoute);
router.use("/group", groupRoute);

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  winston.logger.info(`Server is running on environment: ${process.env.NODE_ENV.toUpperCase()}`);
});

// console.log(__basedir + "/resources/static/assets/uploads/")