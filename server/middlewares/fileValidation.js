module.exports = (req, res, next) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  const fileSize = file.size / 1024 / 1024; // Size in MB
  if (fileSize > 5) {
    return res.status(400).send({ message: 'File size exceeds limit' });
  }
  if (!file.originalname.match(/\.(csv)$/)) {
    return res.status(400).send({ message: 'Invalid file format' });
  }
  next();
};
