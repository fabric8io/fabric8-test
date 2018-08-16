import pytest
import time
import requests as req
from support.constants import request_detail, launch_detail, workitem_constants, dynamic_vars
import support.helpers as helpers

start_time = time.time()
local_run = False


class TestClass_SetupGettingStarted(object):
    def test_setup_gettingStarted(self, sut, offline_token, userid):
        print("\n\n==>Getting Started Test Setup Start....\n")
        if sut is None:
            launch_detail.base_url[launch_detail.base_wit] = r"https://api.openshift.io"
            print("SUT (WIT Target) not provided!!! Using default production SUT = ", launch_detail.base_url[launch_detail.base_wit])
        else:
            # Identify if its a local run and set the local_run variable to True
            if "localhost" in sut or "0.0.0.0" in sut or "127.0.0.1" in sut:
                global local_run
                local_run = True
            launch_detail.base_url[launch_detail.base_wit] = sut
            print("SUT set to = ", sut)

        if userid is None:
            launch_detail.userid_primary = launch_detail.userid_prod_primary_default
            print("USERID not provided! Going ahead with the default USERID = ", launch_detail.userid_prod_primary_default)
        else:
            launch_detail.userid_primary = userid
            print("USERID set to = ", launch_detail.userid_primary)

        if offline_token in ["", "0", False, 0, None, "None"]:
            if local_run:
                try:
                    launch_detail.token_userid_primary = launch_detail.get_local_token()
                    if launch_detail.token_userid_primary:
                        print "Local ACCESS_TOKEN obtained"
                except:
                    pytest.exit("Failed to generate local ACCESS_TOKEN!!! Terminating the run!!!!!!!!!!!")
            else:
                pytest.exit("REFRESH_TOKEN not provided!!! Terminating the run!!!!!!!!!!!")
        else:
            launch_detail.offref_token_userid_primary = offline_token
            try:
                launch_detail.token_userid_primary = launch_detail.get_access_token_from_refresh()
                if launch_detail.token_userid_primary:
                    print("ACCESS_TOKEN set to = A secret in Jenkins ;)")
            except:
                pytest.exit("Failed to generate ACCESS_TOKEN from OFFLINE_TOKEN!!! Terminating the run!!!!!!!!!!!")

        # Define Request Header, that includes Access Token
        request_detail.headers_default = {request_detail.content_type_key_default: request_detail.content_type_default, request_detail.authorization_key_default: request_detail.authorization_carrier_default + launch_detail.token_userid_primary}
        print("\n==Getting started Test Setup Complete....\n")

    class TestClass_SDDTeardown(object):
        '''Class that dumps data to a file'''
        def test_sdd_teardown(self, cleanup):
            import os
            import json
            launch_detail.launch_details_dict["token"] = launch_detail.token_userid_primary
            launch_detail.launch_details_dict["offline_token"] = launch_detail.offref_token_userid_primary

            try:
                curr_dir = os.path.dirname(__file__)
                filepath = os.path.join(curr_dir, '..', 'launch_info_dump_getting_started.json')
                with open(filepath, 'w') as f:
                    json.dump(launch_detail.launch_details_dict, f, sort_keys=True, indent=4)
            except Exception:
                print("Exception creating launch_info_dump_getting_started.json")

