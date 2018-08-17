import requests
import os
import jmespath
import json


class launch_details:
    launch_details_dict = {}  # A dict that would be dumped on teh disk for UI tests to use
    test_on_prod = True  # Set this flag if running tests on prod

    # USERIDs
    userid_prod_primary_default = 'rgarg-osiotest1'  # DEFAULT PROD OSIO USER ID
    userid_primary = userid_prod_primary_default

    # TOKENs
    offref_token_userid_primary = None
    token_userid_primary = None

    # BASE URLs
    base_wit = "base_wit"
    base_forge = "base_forge"
    base_url = {}

    def get_local_token(self):
        # Used only for local token generation. Not used for prod or prod-preview
        url = self.create_url('api/login/generate')
        r = requests.get(url)
        return self.extract_value("[0].token.access_token", r)

    def get_access_token_from_refresh(self):
        """Access the WIT endpoint to obtain access token from the refresh token."""
        url = self.create_url("api/login/refresh")
        print("URL: %s" % url)
        payload = {"refresh_token": self.offref_token_userid_primary}
        r = requests.post(url, headers={'Content-Type': r'application/json'},
                          data=json.dumps(payload))
        return self.extract_value("token.access_token", r)

    def create_url(self, api, base_target=base_wit):
        return os.path.join(self.base_url[base_target], api)

    def extract_value(self, extract_path=None, json_response=None):
        if None in [json_response, extract_path]:
            print("Either JSON response or the extractor path are None")
            return None
        else:
            try:
                return jmespath.search(extract_path, json_response.json())
            except Exception:
                print("Exception extracting value from the response body")
                return None


launch_detail = launch_details()


class requests_constants:
    content_type_key_default = 'Content-Type'
    content_type_default = r'application/vnd.api+json'
    content_header_default = {'Content-Type': 'application/vnd.api+json'}
    authorization_key_default = 'Authorization'
    authorization_carrier_default = 'Bearer '
    headers_default = None


request_detail = requests_constants()


# To-DO: The following UUIDs will be later fetched using an API
class workitem_constants:
    witypescenario = "71171e90-6d35-498f-a6a7-2083b5267c18"
    witypefundamental = "ee7ca005-f81d-4eea-9b9b-1965df0988d0"
    witypepapercut = "6d603ab4-7c5e-4c5f-bba8-a3ba9d370985"
    witypeexperience = "b9a71831-c803-4f66-8774-4193fffd1311"
    witypevalue = "3194ab60-855b-4155-9005-9dce4a05f1eb"
    witypefeature = "0a24d3c2-e0a6-4686-8051-ec0ea1915a28"
    witypebug = "26787039-b68f-4e28-8814-c2f93be1ef4e"
    witypetask = "bbf35418-04b6-426c-a60b-7f80beb0b624"

    witypetheme = "5182fc8c-b1d6-4c3d-83ca-6a3c781fa18a"
    witypeepic = "2c169431-a55d-49eb-af74-cc19e895356f"
    witypestory = "6ff83406-caa7-47a9-9200-4ca796be11bb"
    witypedefect = "fce0921f-ea70-4513-bb91-31d3aa8017f1"
    witypetask1 = "2853459d-60ef-4fbe-aaf4-eccb9f554b34"

    witypegrp_agile_workitems = "1c21af72-59ab-43d7-a84c-e76ee8ed3342"
    witypegrp_agile_execution = "49d1a19f-02b4-4a10-a774-5723299f8944"

    wilinktype_parent = "25c326a7-6d03-4f5a-b23b-86a9ee4171e9"

    label_1 = "sample_label_1"
    label_2 = "sample_label_2"
    label_3 = "sample_label_3"
    label_4 = "sample_label_4"
    label_5 = "sample_label_5"

    iteration_1 = "Iteration_1"
    iteration1_1 = "Iteration1_1"
    iteration_2 = "Iteration_2"

    comment_1_text = "Comment # 1"
    comment_2_text = "Comment # 2"


class dynamic_data:

    def __init__(self):
        self.reset()

    def reset(self):
        # set all members to their initial value
        self.username = None
        self.userfullname = None
        self.userid = None

        self.spaceid = None
        self.spacename = None
        self.spacelink = None

        # Planner
        self.parent_area_id = None
        self.parent_area_name = None
        self.area_names_to_ids = {}

        self.parent_iteration_id = None
        self.parent_iteration_name = None
        self.iteration_names_to_ids = {}
        self.nested_iters_names_to_ids = {}

        self.labels_names_to_ids = {}

        self.wi_names_to_ids = {}
        self.wi_names_to_links = {}


dynamic_vars = dynamic_data()
