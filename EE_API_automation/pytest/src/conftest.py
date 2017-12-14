import pytest
  
def pytest_addoption(parser):
    """Add options to pytest.
    This adds the options for
    - '--sut' as the target system under test URL
    - '--offline-token' as the offile token to generate an access token
    - '--userid' as the OSIO userid of the primary test user
    """
    parser.addoption("--sut", action="store", default=None,
        help="sut: the url of the WIT server to connect to")
    parser.addoption("--offline_token", action="store", default=None,
        help="offline_token: token to generate an access token")
    parser.addoption("--userid", action="append", default=None,
        help="userid: OSIO userid of the primary test user")
      
@pytest.fixture
def sut(request):
    return request.config.getoption("--sut")
  
@pytest.fixture
def offline_token(request):
    return request.config.getoption("--offline_token")
  
@pytest.fixture
def userid(request):
    return request.config.getoption("--userid")
