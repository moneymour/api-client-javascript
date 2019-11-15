ENVIRONMENT_PRODUCTION = 'production'
ENVIRONMENT_SANDBOX = 'sandbox'
ENVIRONMENT_STAGE = 'stage'
ENVIRONMENT_DEVELOPMENT = 'development'

class InvalidEnvironmentError extends Error {
  constructor () {
    super('Invalid environment.')
  }
}

function validateEnvironment (environment) {
  if (![
    ENVIRONMENT_PRODUCTION,
    ENVIRONMENT_SANDBOX,
    ENVIRONMENT_STAGE,
    ENVIRONMENT_DEVELOPMENT
  ].includes(environment)) {
    throw new InvalidEnvironmentError()
  }
}

module.exports = {
  ENVIRONMENT_PRODUCTION,
  ENVIRONMENT_SANDBOX,
  ENVIRONMENT_STAGE,
  ENVIRONMENT_DEVELOPMENT,
  validateEnvironment
}
