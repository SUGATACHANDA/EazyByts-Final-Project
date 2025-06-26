const { createUploadthingExpressHandler } = require("uploadthing/express"); // Correct function for v5
const { ourFileRouter } = require("./core");
const express = require('express');

const uploadthingRouter = express.Router();

// This creates the actual middleware endpoint for Express
uploadthingRouter.use(
    "/",
    createUploadthingExpressHandler({
        router: ourFileRouter,
    })
);

module.exports = uploadthingRouter;