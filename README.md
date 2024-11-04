# node-less-otp
 A super lightweight Node.js library for generating and verifying one-time passwords (OTPs) without the database interaction and additional dependencies.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
  - [LessOtpConfig](#lessotpconfig)
  - [GenerateOptions](#generateoptions)
  - [LessOtp Class](#lessotp-class)
    - [constructor](#constructor)
    - [gen](#gen)
    - [verify](#verify)
- [Examples](#examples)
- [License](#license)

## Installation

You can install the `node-less-otp` library via npm:

```bash
npm install node-less-otp
```

## Usage

To use the `node-less-otp` library, import the class and create an instance by passing your configuration. You can then generate and verify OTPs.

```javascript
import LessOtp from 'node-less-otp';

const otp = new LessOtp({
  secretSalt: 'your_secret_salt',   // Required
  algorithm: 'aes-256-cbc',         // Optional
  ivLength: 16                      // Optional
});
```

## API Documentation

### LessOtpConfig

The configuration for the `LessOtp` instance:

| Parameter     | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| `secretSalt`  | string | Mandatory secret salt used for encryption.      |
| `algorithm`   | string | Optional encryption algorithm (default: 'aes-256-cbc'). |
| `ivLength`    | number | Optional initialization vector length (default: 16). |

### GenerateOptions

Options for OTP generation:

| Parameter     | Type        | Description                                      |
|---------------|-------------|--------------------------------------------------|
| `template`    | string      | Optional template for OTP generation (see examples). |
| `ttl`         | number      | Optional time-to-live in seconds for the generated OTP (default: Infinity). |

### LessOtp Class

#### constructor

Creates an instance of the `LessOtp` class.

```javascript
const otp = new LessOtp(config: LessOtpConfig);
```

#### gen

Generates an OTP based on a unique identifier and optional generation options.

```javascript
const { otp, hash } = await otp.gen(id: string, options: GenerateOptions);
```

- **Parameters**:
  - `id`: Unique identifier (e.g., phone number, email).
  - `options`: Optional generation options.

- **Returns**: An object containing the generated OTP and its encrypted hash.

#### verify

Verifies the OTP by comparing it with the decrypted OTP hash.

```javascript
const isValid = otp.verify(id: string, hash: string, data: Data);
```

- **Parameters**:
  - `id`: Unique identifier.
  - `hash`: Encrypted OTP hash.
  - `data`: Data object containing the OTP to verify.

- **Returns**: `true` if the OTP is valid; otherwise, `false`.

### Data

The data returned after generating an OTP:

| Parameter  | Type     | Description                               |
|------------|----------|-------------------------------------------|
| `otp`      | string   | The generated OTP.                        |
| `expiresAt`| number   | Timestamp indicating when the OTP expires. |

## Examples

### Generating an OTP

```javascript
const otp = new LessOtp({ secretSalt: 'your_secret_salt' });

async function generateOtp() {
  const { otp: generatedOtp, hash } = await otp.gen('user@example.com', { template: 'N{6}', ttl: 300 });
  console.log('Generated OTP:', generatedOtp);
  console.log('Encrypted Hash:', hash);
}
generateOtp();
```

### Verifying an OTP

```javascript
async function verifyOtp() {
  const isValid = otp.verify('user@example.com', hash, { otp: generatedOtp });
  console.log('Is OTP valid?', isValid);
}
verifyOtp();
```

## License

This project is licensed under the [Apache-2.0 License](LICENSE).
