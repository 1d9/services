const { exec } = require('child_process');
const { writeFile, mkdir, copyFile } = require('fs').promises;

const readStream = async (stream) => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on('data', chunk => chunks.push(chunk));
  stream.on('error', error => reject(error));
  stream.on('end', () => resolve(chunks.join('')));
});

const zipPackage = async (packageName) => {
  const packageFilename = `${packageName}.zip`;
  return new Promise((res, rej) =>
    exec(`cd package; zip ../${packageFilename} ./*`, (err) => err ? rej(err) : res(packageFilename)
  ));
};

const buildDockerrun = async (tag) => {
  const dockerrun = {
    AWSEBDockerrunVersion: '1',
    Image: { "Name": `1d9/andy:${tag}` },
    Ports: [
      { "ContainerPort": 8080 }
    ],
  };
  await writeFile('package/Dockerrun.aws.json', JSON.stringify(dockerrun));
};

const buildPackage = async () => {
  try {
    const input = JSON.parse(await readStream(process.stdin));
    const { tag, name = '' } = input;
  
    await mkdir('package', { recursive: true });
    await buildDockerrun(tag);
    const packageFilename = await zipPackage([name, tag].join('-'));
  
    const output = {
      filename: packageFilename,
    };
    process.stdout.write(JSON.stringify(output))
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  buildPackage();
}