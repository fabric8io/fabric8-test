# PoC for Auth Service contract tests using Pact framework

## Pact broker Credentials

The pact broker is secured by Basic Auth. The best way to provide username and password is following:
 * Username: set `PACT_BROKER_USERNAME` environment variable (etiher in `config/config.sh` or in the environment)
 * Password: Create a file `.pact-broker-password` and place the password in the file (the whole file content is considered a password).


