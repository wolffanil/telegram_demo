const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../../errors");
const streamifier = require("streamifier");
const { Transform } = require("stream");
const { cloudinary } = require("../../config/cloudinary");

const uploadMedia = async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No file or media type provided");
  }

  try {
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let uploadedBytes = 0;
        const totalBytes = req.file.size;

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profile_pictures",
            use_filename: false,
            unique_filename: false,
            overwrite: false,
            resource_type: "image",
          },
          (error, result) => {
            if (result) {
              console.log(result);
              resolve(result);
            } else {
              console.log(error);
              reject(error);
            }
          }
        );

        const progressStream = new Transform({
          transform(chunk, encoding, callback) {
            uploadedBytes += chunk.length;
            const progress = (uploadedBytes / totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
            callback(null, chunk);
          },
        });

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(progressStream)
          .pipe(uploadStream);
      });
    };

    const result = await streamUpload(req);

    res.status(StatusCodes.OK).json({ mediaUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    throw new BadRequestError("Media upload failed");
  }
};

module.exports = { uploadMedia };
