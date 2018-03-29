import requests as req
from support.constants import request_detail, launch_detail, dynamic_vars
import support.helpers as helpers

class TestClass_SetupForge(object):
    def test_setup_forge(self, forge_sut):
        print "\n\nForge Test Setup Start....\n"
        if forge_sut is None:
            launch_detail.base_url[launch_detail.base_forge] = r"https://forge.api.openshift.io"
            print "FORGE_SUT not provided!!! Using default production SUT = ", launch_detail.base_url[launch_detail.base_forge]
        else:
            launch_detail.base_url[launch_detail.base_forge] = forge_sut
            print "FORGE_SUT set to = ", forge_sut
        
        print "\nForge Test Setup Complete....\n"
        print "+++++++++++++++++ Running FORGE API Tests ++++++++++++++++\n"

class TestClass_QuickStart(object):
    def test_select_a_quickstart(self):
        #Design the URL
        api = "forge/commands/fabric8-new-project"
        url = launch_detail.create_url(api, base_target=launch_detail.base_forge)
        print url
        ##Make the request
        r = req.get(url, headers=request_detail.headers_default)
        
        ##Save and retain dynamic data for later use
        dynamic_vars.quickstart_selected = helpers.extract_value("inputs.0.value", r)
        
        ##Validate the response
        assert r.status_code == 200
        assert helpers.extract_value("metadata.name", r) == "Quickstart"
        assert helpers.extract_value("state.valid", r) == True
        assert helpers.extract_value("state.canMoveToNextStep", r) == True
        assert helpers.extract_value("state.canMoveToPreviousStep", r) == False

    def test_validate_select_a_quickstart(self):
        #Design the URL
        api = "forge/commands/fabric8-new-project/validate"
        url = launch_detail.create_url(api, base_target=launch_detail.base_forge)
        ##Make the request
        f = helpers.read_post_data_file('step_1_2_input.json', json_dir='forge_jsons')
        print f
        r = req.post(url, headers=request_detail.headers_default, json=f)
        
        ##Save and retain dynamic data for later use
        dynamic_vars.quickstart_selected = helpers.extract_value("inputs.0.value", r)
        
        ##Validate the response
        assert r.status_code == 200
        assert helpers.extract_value("state.steps", r) == "Quickstart"
        assert helpers.extract_value("inputs[0].inputType", r) == "org.jboss.forge.inputType.DEFAULT"
        assert helpers.extract_value("inputs[0].valueType", r) == "io.fabric8.forge.generator.quickstart.BoosterDTO"
        assert helpers.extract_value("inputs[0].enabled", r) == True
        assert helpers.extract_value("inputs[0].required", r) == True
        assert helpers.extract_value("inputs[0].name", r) == "quickstart"
        

class TestClass_Teardown(object):
    def test_teardown(self):     
        print "\n+++++++++++++++++ FORGE API Tests Complete ++++++++++++++++\n"
        
        