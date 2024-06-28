#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import { join, dirname } from 'node:path';
import process from 'node:process';
import jws from 'jws';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv))
  .option('sbom', {
    description: 'Path to the existing SBOM file to sign.',
    type: 'string',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    description: 'Output file for the signed SBOM. Default signed-bom.json',
    default: 'signed-bom.json',
  })
  .option('generate-and-sign', {
    type: 'boolean',
    description: 'Generate an RSA public/private key pair and sign the SBOM.',
    default: false,
  })
  .option('sign', {
    type: 'boolean',
    description: 'Sign the SBOM using an existing private key.',
    default: false,
  })
  .option('private-key', {
    description: 'Path to an existing private key to sign the SBOM.',
    type: 'string',
  })
  .option('public-key', {
    description: 'Path to an existing public key to verify the SBOM.',
    type: 'string',
  })
  .option('verify', {
    type: 'boolean',
    description: 'Verify the signature of the SBOM.',
    default: false,
  })
  .help('h')
  .alias('h', 'help')
  .argv;

(async () => {
  const sbomFile = args.sbom;
  if (!fs.existsSync(sbomFile)) {
    console.log('The provided SBOM file does not exist.');
    process.exit(1);
  }

  const sbomData = JSON.parse(fs.readFileSync(sbomFile, 'utf-8'));
  const outputFilePath = args.output;

  if (args.generateAndSign) {
    const dirName = dirname(outputFilePath);
    const publicKeyFile = join(dirName, 'public.key');
    const privateKeyFile = join(dirName, 'private.key');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    fs.writeFileSync(publicKeyFile, publicKey);
    fs.writeFileSync(privateKeyFile, privateKey);
    console.log(
      'Generated public/private key pairs',
      publicKeyFile,
      privateKeyFile,
    );
    signSBOM(privateKey, sbomData, outputFilePath);
  } else if (args.sign && args.privateKey) {
    const privateKey = fs.readFileSync(args.privateKey, 'utf8');
    signSBOM(privateKey, sbomData, outputFilePath);
  }

  if (args.verify && args.publicKey) {
    verifySBOM(args.publicKey, sbomData);
  }
})();

function signSBOM(privateKey, sbomData, outputFilePath) {
  try {
    const alg = 'RS512';
    const signature = jws.sign({
      header: { alg },
      payload: JSON.stringify(sbomData, null, 2),
      privateKey,
    });

    sbomData.signature = {
      algorithm: alg,
      value: signature,
    };

    fs.writeFileSync(outputFilePath, JSON.stringify(sbomData, null, 2));
    console.log('SBOM signed and saved to', outputFilePath);
  } catch (ex) {
    console.log('SBOM signing was unsuccessful', ex);
  }
}

function verifySBOM(publicKeyPath, sbomData) {
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const alg = sbomData.signature.algorithm;
  const signature = sbomData.signature.value;

  const isVerified = jws.verify(signature, alg, publicKey);

  if (isVerified) {
    console.log('SBOM signature is verifiable with the provided public key.');
  } else {
    console.log('SBOM signature verification was unsuccessful.');
  }
}

