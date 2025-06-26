const { createUploadthing } = require("uploadthing/express");
const { protect, admin } = require('../middleware/authMiddleware.js');

const f = createUploadthing();

// This is your "FileRouter" for the entire app.
const ourFileRouter = {
    // Define a single "FileRoute" named `imageUploader`.
    imageUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 }
    })
        // This middleware runs on your server before any upload.
        .middleware(async ({ req, res }) => {
            // This is a workaround to run our existing Express middleware for security.
            let user;
            let error;

            // Manually run our `protect` middleware to authenticate the user
            await new Promise((resolve) => {
                protect(req, res, (err) => {
                    if (err) error = err;
                    user = req.user;
                    resolve();
                });
            });
            if (error || !user) throw new Error("Authentication Failed. Please log in.");

            // Manually run our `admin` middleware to authorize the user
            await new Promise((resolve) => {
                admin(req, res, (err) => {
                    if (err) error = err;
                    resolve();
                });
            });
            if (error) throw new Error("Authorization Failed: You must be an admin.");

            // If both middleware pass, return the user's ID.
            // This metadata is available in `onUploadComplete`.
            return { userId: user._id };
        })
        // This code RUNS ON YOUR SERVER after a successful upload.
        .onUploadComplete(async ({ metadata, file }) => {
            console.log(`Upload complete for user: ${metadata.userId}`);
            console.log(`File URL: ${file.url}`);
        }),
};

module.exports = { ourFileRouter };