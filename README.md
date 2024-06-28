
# SBOM Signing and Verification Tool

This project provides a Node.js script to securely sign and verify Software Bill of Materials (SBOM) files using RSA keys and JSON Web Signatures (JWS). It aims to enhance the security of software supply chains through robust integrity checks.

## Features

- **RSA Key Generation:** Automatically generate RSA public and private keys.
- **SBOM Signing:** Sign an SBOM using a newly generated private key or an existing private key to ensure its integrity and authenticity.
- **SBOM Verification:** Verify the signature of an SBOM using the corresponding public key or an existing public key to ensure it has not been tampered with.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

To set up this project locally, follow these steps:

1. Clone the repository to your local machine:
   ```bash
   git clone git@github.com:yourusername/your-repo-name.git
   ```
2. Navigate to the project directory:
   ```bash
   cd your-repo-name
   ```
3. Install the necessary Node.js packages:
   ```bash
   npm install
   ```

## Usage

### Generating Keys and Signing an SBOM

1. **Generate and Sign an SBOM:**
   Use this command to generate new RSA keys and sign an SBOM file. This generates `private.key` and `public.key` in your specified output directory and uses the private key to sign the SBOM.
   ```bash
   node sign-sbom.js --generate-and-sign --sbom path/to/your/sbom.json --output path/to/output/signed-sbom.json
   ```

### Signing an SBOM with an Existing Private Key

1. **Sign an SBOM:**
   If you already have a private key and want to use it to sign an SBOM, specify the path to your private key with the `--private-key` option.
   ```bash
   node sign-sbom.js --sign --sbom path/to/your/sbom.json --output path/to/output/signed-sbom.json --private-key path/to/your/private.key
   ```

### Verifying an SBOM Signature

1. **Verify an SBOM:**
   To verify the signature of an SBOM file, specify the path to the public key used for signing or another trusted public key.
   ```bash
   node sign-sbom.js --verify --sbom path/to/signed-sbom.json --public-key path/to/public.key
   ```

