#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import { join, dirname } from "node:path";
import process from "node:process";
import jws from "jws";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv))
  .option("sbom", {
    description: "Path to the existing SBOM file to sign or verify.",
    type: "string",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    description: "Output file for the signed SBOM. Default signed-bom.json",
    default: "signed-bom.json",
  })
  .option("generate-key-and-sign", {
    type: "boolean",
    description: "Generate an RSA public/private key pair and sign the SBOM.",
    default: false,
  })
  .option("verify", {
    type: "boolean",
    description: "Verify the signature of the SBOM.",
    default: false,
  })
  .help("h")
  .alias("h", "help")
  .argv;

(async () => {
  const sbomFile = args.sbom;
  if (!fs.existsSync(sbomFile)) {
    console.log("The provided SBOM file does not exist.");
    process.exit(1);
  }

  const sbomData = JSON.parse(fs.readFileSync(sbomFile, "utf-8"));
  const outputFilePath = args.output;

  if (args.generateKeyAndSign) {
    const dirName = dirname(outputFilePath);
    const publicKeyFile = join(dirName, "public.key");
    const privateKeyFile = join(dirName, "private.key");
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    fs.writeFileSync(publicKeyFile, publicKey);
    fs.writeFileSync(privateKeyFile, privateKey);
    console.log(
      "Created public/private key pairs for testing purposes",
      publicKeyFile,
      privateKeyFile,
    );

    const jwkPublicKey = crypto.createPublicKey(publicKey).export({ format: "jwk" });

    try {
      const alg = "RS512";
      const components = sbomData.components || [];

      for (const comp of components) {
        const compSignature = jws.sign({
          header: { alg },
          payload: comp,
          privateKey,
        });
        comp.signature = {
          algorithm: alg,
          value: compSignature,
          publicKey: jwkPublicKey,
        };
      }

      const signature = jws.sign({
        header: { alg },
        payload: JSON.stringify(sbomData, null, 2),
        privateKey,
      });

      sbomData.signature = {
        algorithm: alg,
        value: signature,
        publicKey: jwkPublicKey,
      };

      fs.writeFileSync(outputFilePath, JSON.stringify(sbomData, null, 2));
      console.log("SBOM signed and saved to", outputFilePath);

      const signatureVerification = jws.verify(
        signature,
        alg,
        fs.readFileSync(publicKeyFile, "utf8"),
      );
      if (signatureVerification) {
        console.log(
          "SBOM signature is verifiable with the public key and the algorithm",
          publicKeyFile,
          alg,
        );
      } else {
        console.log("SBOM signature verification was unsuccessful");
        console.log("Check if the public key was exported in PEM format");
      }
    } catch (ex) {
      console.log("SBOM signing was unsuccessful", ex);
      console.log("Check if the private key was exported in PEM format");
    }
  }

  if (args.verify) {
    try {
      const publicKeyFile = join(dirname(sbomFile), "public.key");
      if (!fs.existsSync(publicKeyFile)) {
        console.log("The public key file does not exist.");
        process.exit(1);
      }
      const publicKey = fs.readFileSync(publicKeyFile, "utf8");
      const alg = sbomData.signature.algorithm;
      const signature = sbomData.signature.value;

      const isVerified = jws.verify(signature, alg, publicKey);

      if (isVerified) {
        console.log("SBOM signature is verifiable with the provided public key.");
      } else {
        console.log("SBOM signature verification was unsuccessful.");
      }
    } catch (ex) {
      console.log("SBOM verification was unsuccessful", ex);
    }
  }
})();

