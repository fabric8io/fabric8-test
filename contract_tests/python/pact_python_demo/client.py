import requests

class StatusClient(object):
    def __init__(self, base_uri):
        self.base_uri = base_uri

    def get_status(self, user_name):
        """Fetch a status object."""
        uri = self.base_uri + '/status'
        response = requests.get(uri)
        if response.status_code == 404:
            return None
        return response.json()
