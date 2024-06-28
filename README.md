# SBOM Signing and Verification

This project provides a script to sign and verify Software Bill of Materials (SBOM) files using RSA public/private key pairs and JSON Web Signatures (JWS). This ensures the integrity and authenticity of SBOM files, which are crucial in supply chain security.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Generate Keys and Sign an SBOM](#generate-keys-and-sign-an-sbom)
  - [Verify the SBOM Signature](#verify-the-sbom-signature)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Features

- **Generate RSA Keys:** Create RSA public/private key pairs.
- **Sign SBOM:** Sign an existing SBOM file with a private key.
- **Verify SBOM:** Verify the signature of an SBOM file with a public key.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed Node.js (version 14 or later).
- You have installed npm (Node Package Manager).

## Installation

Follow these steps to set up the project:

1. **Clone the Repository:**

   ```bash
   git clone git@github.com:yourusername/your-repo-name.git
   cd your-repo-name
