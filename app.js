const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const newsletterRoutes = require("./routes/newsletterRoutes");
const blogRoutes = require("./routes/blogRoutes");
const reportRoutes = require("./routes/reportRoutes");
const hubspotRoutes = require("./routes/hubspotRoutes");
const slackEventRoutes = require("./routes/slackEvents");
const userSetupRoutes = require("./routes/setupUser");

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDb Connected Successfully");
});

app.use("/api/newsletter", newsletterRoutes);
app.use("/api/createBlog", blogRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/hubspot", hubspotRoutes);
app.use("/api/slack", slackEventRoutes);
app.use("/api/users", userSetupRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
