import json
import os
import sys
import argparse
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
import jwt

def generate_key_pair(public_key_file, private_key_file):
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096
    )
    public_key = private_key.public_key()

    with open(private_key_file, "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))

    with open(public_key_file, "wb") as f:
        f.write(public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ))

    print(f"Generated public/private key pairs: {public_key_file}, {private_key_file}")
    return private_key, public_key

def sign_sbom(private_key, sbom_data, output_file_path):
    try:
        algorithm = "RS512"
        payload = json.dumps(sbom_data, indent=2)
        
        if isinstance(private_key, str):
            with open(private_key, "rb") as key_file:
                private_key = serialization.load_pem_private_key(
                    key_file.read(),
                    password=None
                )

        signature = jwt.encode(
            payload=json.loads(payload),
            key=private_key,
            algorithm=algorithm
        )

        sbom_data["signature"] = {
            "algorithm": algorithm,
            "value": signature
        }

        with open(output_file_path, "w") as f:
            json.dump(sbom_data, f, indent=2)

        print(f"SBOM signed and saved to {output_file_path}")
    except Exception as ex:
        print("SBOM signing was unsuccessful", ex)

def verify_sbom(public_key_path, sbom_data):
    try:
        with open(public_key_path, "rb") as key_file:
            public_key = serialization.load_pem_public_key(key_file.read())

        algorithm = sbom_data["signature"]["algorithm"]
        signature = sbom_data["signature"]["value"]

        # Remove the signature from the payload for verification
        payload = {k: v for k, v in sbom_data.items() if k != "signature"}

        try:
            jwt.decode(signature, public_key, algorithms=[algorithm])
            print("SBOM signature is verifiable with the provided public key.")
        except jwt.InvalidSignatureError:
            print("SBOM signature verification was unsuccessful.")
    except Exception as ex:
        print("SBOM verification error:", ex)

def main():
    parser = argparse.ArgumentParser(description="SBOM Signing and Verification Tool")
    parser.add_argument("--sbom", required=True, help="Path to the existing SBOM file to sign.")
    parser.add_argument("--output", "-o", default="signed-bom.json", help="Output file for the signed SBOM. Default signed-bom.json")
    parser.add_argument("--generate-and-sign", action="store_true", help="Generate an RSA public/private key pair and sign the SBOM.")
    parser.add_argument("--sign", action="store_true", help="Sign the SBOM using an existing private key.")
    parser.add_argument("--private-key", help="Path to an existing private key to sign the SBOM.")
    parser.add_argument("--public-key", help="Path to an existing public key to verify the SBOM.")
    parser.add_argument("--verify", action="store_true", help="Verify the signature of the SBOM.")

    args = parser.parse_args()

    if not os.path.exists(args.sbom):
        print("The provided SBOM file does not exist.")
        sys.exit(1)

    with open(args.sbom, "r") as f:
        sbom_data = json.load(f)

    if args.generate_and_sign:
        dir_name = os.path.dirname(args.output)
        public_key_file = os.path.join(dir_name, "public.key")
        private_key_file = os.path.join(dir_name, "private.key")
        private_key, _ = generate_key_pair(public_key_file, private_key_file)
        sign_sbom(private_key, sbom_data, args.output)
    elif args.sign and args.private_key:
        sign_sbom(args.private_key, sbom_data, args.output)

    if args.verify and args.public_key:
        verify_sbom(args.public_key, sbom_data)

if __name__ == "__main__":
    main()
