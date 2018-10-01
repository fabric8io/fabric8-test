# For assistance debugging failures

* The pact files have been stored locally in the following temp directory:
    /opt/pact/pact-python-demo/tmp/pacts

* The requests and responses are logged in the following log file:
    /opt/pact/pact-python-demo/log/pact.log

* Add BACKTRACE=true to the `rake pact:verify` command to see the full backtrace

* If the diff output is confusing, try using another diff formatter.
  The options are :unix, :embedded and :list

    Pact.configure do | config |
      config.diff_formatter = :embedded
    end

  See https://github.com/pact-foundation/pact-ruby/blob/master/documentation/configuration.md#diff_formatter for examples and more information.

* Check out https://github.com/pact-foundation/pact-ruby/wiki/Troubleshooting

* Ask a question on stackoverflow and tag it `pact-ruby`


Tried to retrieve diff with previous pact from http://127.0.0.1/pacts/provider/UserService/consumer/UserServiceClient/version/0.1/diff/previous-distinct, but received response code 401 Unauthorized.