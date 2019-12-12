const fs = require('fs');
const path = require('path');
const axios = require('axios');
const tar = require('tar');
const {Transform} = require('stream');

async function downloadImage () {
  const url = 'https://cdn.liferay.cloud/lcp/stable/latest/lcp-macos.tgz';

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  //Extracted file
  const transformStream = new Transform();

  new Promise((resolve) => {
    response.data.on('data', data => {
      transformStream.push(data);
    });

    response.data.on('end', () => {
      transformStream.push(null);
      resolve(transformStream);
    });
  }).then(response => {
    response.pipe(
      tar.x({
        cwd: './extracted/',
      })
    );
  });

  //Original file
  const destPath = path.resolve(__dirname, 'download', 'lcp-macos.tgz');
  const writer = fs.createWriteStream(destPath);

  response.data.pipe(writer);

  new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  })
}

downloadImage();