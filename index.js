require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path =  require('path');
const winston = require("./app/helpers/winston.logger");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================== ROUTES API ==============================

const router = express.Router();
const authRoute = require("./app/routes/auth.routes");
const userRoute = require("./app/routes/user.routes");
const groupRoute = require("./app/routes/group.routes");
const projectRoute = require("./app/routes/project.routes");


app.use("/"+process.env.STATIC_PATH, express.static(path.join(__dirname, process.env.STATIC_PATH)))

//route v1
app.use('/api/v1/', router);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to logistic app.",
  });
});

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/group", groupRoute);
router.use("/project", projectRoute);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  winston.logger.info(`Server is running on environment: ${process.env.NODE_ENV.toUpperCase()}`);
});