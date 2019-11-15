const axios = require('axios')

const environments = require('./environments')
const SignatureFactory = require('./SignatureFactory')

const API_BASE_URL = 'https://api.moneymour.com'
const API_SANDBOX_BASE_URL = 'https://api.sandbox.moneymour.com'
const API_STAGE_BASE_URL = 'https://api.stage.moneymour.com'
const API_DEVELOPMENT_BASE_URL = 'http://localhost:3000'

const ENDPOINT_MERCHANT_REQUEST = '/merchant-request'

class ApiClient {
  /**
   * Constructor
   *
   * @param merchantId The merchant id
   * @param merchantSecret The merchant secret
   * @param environment Moneymour environment
   */
  constructor (merchantId, merchantSecret, environment=environments.ENVIRONMENT_SANDBOX) {
    environments.validateEnvironment(environment)

    this.merchantId = merchantId
    this.merchantSecret = merchantSecret
    this.environment = environment
  }

  /**
   * Request a loan.
   *
   * @param privateKey Your personal private key
   * @param body The body to be sent in the POST request
   * @returns Object JSON decoded object
   */
  async request (privateKey, body) {
    // Add identification fields to the request
    body.merchantId = this.merchantId
    body.secret = this.merchantSecret

    const factory = new SignatureFactory()

    const expiresAt = factory.generateExpiresAtHeaderValue()
    const signature = factory.build(privateKey, expiresAt, body)

    const headers = {
      'Content-Type': 'application/json',
      'Expires-at': expiresAt,
      'Signature': signature
    }

    body = JSON.stringify(body)

    // Perform the request
    const { data } = await axios.post(ApiClient.getApiBaseUrl(this.environment) + ENDPOINT_MERCHANT_REQUEST, body, { headers })

    return data
  }

  static getApiBaseUrl (environment) {
    if (environment === environments.ENVIRONMENT_PRODUCTION) {
      return API_BASE_URL
    } else if (environment === environments.ENVIRONMENT_SANDBOX) {
      return API_SANDBOX_BASE_URL
    } else if (environment === environments.ENVIRONMENT_STAGE) {
      return API_STAGE_BASE_URL
    } else {
      return API_DEVELOPMENT_BASE_URL
    }
  }
}

module.exports = ApiClient
