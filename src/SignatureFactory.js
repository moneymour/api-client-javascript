const NodeRSA = require('node-rsa')
const moment = require('moment')
const environments = require('./environments')

const MONEYMOUR_PUBLIC_KEY_DEVELOPMENT = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0xjRECYz5oKWyjmCOQc3
x9D9eC8v79iRsMScCu9fHesM0Znkto73tvfUhGDmTms6NIgVDDWzLwf40rRPFkxK
zuw0ZGRJDSRw7dGNQ/yjM+R3WOE9HAaUjtX6rX6t/urvQW0XN057/clfMeebEQR0
knJhOuukrgaZC54XbMitlGNk4UxXkbaTD+h0UoSAqxVSM1riUTbNef6mWWHOZGB+
Dpi6lNI6Y6WX9w4nTwXiOWkthM+jsGTV1Vz49UB8gDmcZSgBp1dRLVzTm7NH8H3v
rgrjADr43io1gUC1N0zrXxzyX+xNLABkLW+Oi3lbSXSFFxCjdl2vlUs2SSW78EMD
KwIDAQAB
-----END PUBLIC KEY-----`

const MONEYMOUR_PUBLIC_KEY_STAGE = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAty+wRd3ArC2RfUA1Ypua
KkXp/bEs6KgRX68NrenZ3yk3jx7M72EeQS0tgNvWVfVC3NdhX9rJCM2JgkmlDIOk
keRj+S2BWJ1sIo5a/Haxkgm745Vd1McOz+VciWPY5p9OJB7xQX+sKhrfKzjfWLAs
+e3Kre/l5OzhvzHf7yvzJueRHHvqX9epygVBhaYwiS+VtUhNPmBB0CwTkAUMTIQ1
u2iv0c/beutBHshexO51AzGsH/LHy5LyJcgZYQ3YYRc/KABJb6A02I/V7H1Aa8Uz
qKrx4ZKW1h7t8q3gCBvPRe6CVft/yHISE9UL7sflQnelBVdLO5Miy9MEZDRJUVCY
TwIDAQAB
-----END PUBLIC KEY-----`

const MONEYMOUR_PUBLIC_KEY_SANDBOX = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0A0WavOzsKJn0SHdQrF1
ThSdWly629clB6y4crZ0D778rQGmBFSkvdceIt3fERGYuCyWHFtiOS6pIlfIcJgR
hDoA0N6UKlT777KH8s/B3+cMnEHhPBiD0Lq8w8yjWdal1BvFkuUOionNm9q9OA2g
uD4BWv9WZBm1/mB7kNczvEGxvN1E601lJztU8WahWH1w0fEmRsW9BpcVrqlqfkuw
hPUnjeVXWDTX05gVyAr/Do6yNcJi6M5/4hU6EcQiQ+d1pHgd/mCLN/hoiPvGG5y9
UrR2av3bgfefF5QU7ZRzjMV3X7bGXPG2pH+L8kbHCPB78j5rzxHViSKIpPKkMg+P
FwIDAQAB
-----END PUBLIC KEY-----`

class SignatureFactory {

  /**
   * Build a Moneymour APIs signature based on the given `expiresAt` and `body`.
   *
   * @param privateKey Your personal private key
   * @param expiresAt EPOCH timestamp
   * @param body The body to be sent in the POST request. It's being stringified by this function.
   * @returns {string} The base64 encoded signature string
   */
  build (privateKey, expiresAt, body) {
    const rsaKey = new NodeRSA(privateKey, { signingScheme: 'sha256' })

    return rsaKey.sign(this.buildPayload(expiresAt, body), 'base64', 'utf8')
  }

  /**
   * Verify the given `signature` based on the given `expiresAt` and `body`.
   *
   * @param signature The base64 encoded signature string
   * @param expiresAt EPOCH timestamp
   * @param body The body to be sent in the POST request
   * @param publicKey The RSA public key related to the RSA private key used for the signature
   * @param environment The API environment: production, sandbox, stage or development. Default: sandbox
   */
  verify (signature, expiresAt, body, publicKey=null, environment=environments.ENVIRONMENT_SANDBOX) {
    if (!publicKey) {
      publicKey = this.getEnvironmentPublicKey(environment)
    }

    const payload = this.buildPayload(expiresAt, body)

    const key = new NodeRSA(publicKey, { signingScheme: 'sha256' })
    return key.verify(payload, signature, 'utf8', 'base64')
  }

  /**
   * Get the public key related to the given environment name
   *
   * @param environment The environment name in string format
   * @returns {string} The Moneymour RSA public ket for the given environment
   */
  getEnvironmentPublicKey (environment) {
    environments.validateEnvironment(environment)

    return {
      'MONEYMOUR_PUBLIC_KEY_DEVELOPMENT': MONEYMOUR_PUBLIC_KEY_DEVELOPMENT,
      'MONEYMOUR_PUBLIC_KEY_STAGE': MONEYMOUR_PUBLIC_KEY_STAGE,
      'MONEYMOUR_PUBLIC_KEY_SANDBOX': MONEYMOUR_PUBLIC_KEY_SANDBOX
    }.get('MONEYMOUR_PUBLIC_KEY_' + environment.upper())
  }

  /**
   * Build the string to be signed.
   *
   * @param expiresAt EPOCH timestamp
   * @param body The body to be sent in the POST request. It's being stringified by this function.
   * @returns {string} The string to be signed
   */
  buildPayload (expiresAt, body) {
    return expiresAt + '|' + JSON.stringify(body)
  }

  /**
   * Generate a 60-second valid expires-at header value.
   *
   * @returns {string} EPOCH timestamp. Now UTC + 60 seconds
   */
  generateExpiresAtHeaderValue () {
    return moment().utc().add(60, 'seconds').format('X')
  }
}

module.exports = SignatureFactory
