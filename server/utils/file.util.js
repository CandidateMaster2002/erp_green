const xlsx = require('xlsx');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const generateExcelFile = (data, fileName) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const filePath = path.join(__dirname, '..', 'temp', `${fileName}.xlsx`);
  xlsx.writeFile(workbook, filePath);
  return filePath;
};

const createZipArchive = async (files, zipFilePath) => {
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', resolve);

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach((file) => {
      archive.file(file.path, { name: `${file.name}.xlsx` });
    });

    archive.finalize();
  });
};

module.exports = {
  generateExcelFile,
  createZipArchive,
};
