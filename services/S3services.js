const AWS = require("aws-sdk");

const uploadToS3 = async (fileBuffer, filename) => {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    const s3 = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    });

    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: fileBuffer,
      ACL: "public-read",
    };

    const data = await s3.upload(params).promise();
    // console.log("File uploaded successfully:", data.Location);
    return data.Location;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

module.exports = {
  uploadToS3,
};
