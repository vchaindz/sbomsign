
# SBOM Signing and Verification Tool

This project provides a Node.js script to securely sign and verify Software Bill of Materials (SBOM) files using RSA keys and JSON Web Signatures (JWS). It aims to enhance the security of software supply chains through robust integrity checks.

## Features

- **RSA Key Generation:** Automatically generate RSA public and private keys.
- **SBOM Signing:** Sign an SBOM using the generated private key to ensure its integrity and authenticity.
- **SBOM Verification:** Verify the signature of an SBOM using the corresponding public key to ensure it has not been tampered with.

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

1. **Generate Keys:**
   Run the script with the option to generate keys which will produce `private.key` and `public.key` files.
   ```bash
   node sign-sbom.js --generate-key-and-sign --sbom path/to/your/sbom.json --output path/to/output/signed-sbom.json
   ```

2. **Sign an SBOM:**
   Provide the path to the SBOM you wish to sign and specify the output file for the signed SBOM.
   ```bash
   node sign-sbom.js --generate-key-and-sign --sbom path/to/your/sbom.json --output path/to/output/signed-sbom.json
   ```

### Verifying an SBOM Signature

To verify the signature of an SBOM file:
```bash
node sign-sbom.js --verify --sbom path/to/signed-sbom.json
```

This command will check the signed SBOM using the public key to ensure its integrity.

## Contributing

Contributions to this project are welcome! Please create a branch for each feature or fix, submit it as a pull request, and it will be reviewed.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support or queries, please email us at support@example.com.
