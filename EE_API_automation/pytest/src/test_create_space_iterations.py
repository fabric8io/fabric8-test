import pytest
import requests as req
import support.helpers as helpers
from support.constants import request_detail, launch_detail, dynamic_vars, workitem_constants

class TestClass_CreateSpace(object):
    def test_get_user_details(self):
        #Design the URL
        api = "api/users?filter[username]=" + launch_detail.userid_primary
        url = helpers.create_url(api)
        ##Make the request
        r = req.get(url, headers=request_detail.headers_default)
        ##Analyze the response
        global loggedin_user_id, loggedin_user_name
        loggedin_user_id = helpers.extract_value("data[0].id", r)
        loggedin_user_name = helpers.extract_value("data[0].attributes.username", r)
        content_type_header = helpers.extract_header("Content-Type", r)
        
        ##Save and retain dynamic data for later use
        dynamic_vars.username = loggedin_user_name
        dynamic_vars.userid = loggedin_user_id
        ##Validate the response
        assert r.status_code == 200
        assert content_type_header == request_detail.content_type_default

    def test_create_new_space(self):
        #Design the URL
        api = "api/spaces"
        url = helpers.create_url(api)
        f = helpers.read_post_data_file('create_space.json', replace={'$space_name_var':launch_detail.space_name, '$loggedin_user_id':loggedin_user_id})
        ##Make the request
        r = req.post(url, headers=request_detail.headers_default, json=f)
        ##Analyze the response
        global spaceid, spacename
        spaceid = helpers.extract_value("data.id", r)
        spacename = helpers.extract_value("data.attributes.name", r)
        spacelink = helpers.extract_value("data.links.self", r)
        content_type_header = helpers.extract_header("Content-Type", r)
        ##Save and retain dynamic data for later use
        dynamic_vars.spaceid = spaceid
        dynamic_vars.spacename = spacename
        dynamic_vars.spacelink = spacelink
        ##Validate the response
        assert r.status_code == 201
        assert content_type_header == request_detail.content_type_default
        assert helpers.extract_value("data.type", r) == 'spaces'
#
    def test_get_space_details(self):
            #Design the URL
            api = "api/spaces/" + spaceid
            url = helpers.create_url(api)
            ##Make the request
            r = req.get(url, headers=request_detail.headers_default)
            ##Validate the response
            assert r.status_code == 200
            assert helpers.extract_header("Content-Type", r) == request_detail.content_type_default
            assert helpers.extract_value("data.type", r) == "spaces"
            assert helpers.extract_value("data.attributes.name", r) == spacename

class TestClass_CreateAreas(object):
      
    def test_get_parent_area(self):
            #Design the URL
            api = "api/spaces/" + spaceid + "/areas"
            url = helpers.create_url(api)
            ##Make the request
            r = req.get(url, headers=request_detail.headers_default)
            ##Analyze the response
            dynamic_vars.parent_area_id = helpers.extract_value("data[0].id", r)
            dynamic_vars.parent_area_name = helpers.extract_value("data[0].attributes.name", r)
            ##Validate the response
            r.raise_for_status()
    
    @pytest.mark.parametrize("area_name", helpers.generate_entity_names("Area", 5))
    def test_create_child_areas(self, area_name):
        #Design the URL
        api = "api/areas/" + dynamic_vars.parent_area_id
        url = helpers.create_url(api)
        f = helpers.read_post_data_file('create_child_area.json', replace={'$area_name_generated':area_name})
        ##Make the request
        r = req.post(url, headers=request_detail.headers_default, json=f)
        ##Analyze the response
        dynamic_vars.area_names_to_ids[area_name] = helpers.extract_value("data.id", r)
        ##Validate the response
        assert r.status_code == 201

class TestClass_CreateIterations(object):
    
    def test_get_root_iter(self):
            #Design the URL
            api = "api/spaces/" + spaceid + "/iterations"
            url = helpers.create_url(api)
            ##Make the request
            r = req.get(url, headers=request_detail.headers_default)
            ##Analyze the response
            dynamic_vars.parent_iteration_id = helpers.extract_value("data[0].id", r)
            dynamic_vars.parent_iteration_name = helpers.extract_value("data[0].attributes.name", r)
            ##Validate the response
            r.raise_for_status()
            
    @pytest.mark.parametrize("iter_name", helpers.generate_entity_names("Iteration", 5, True, reset_counter = True))
    def test_create_child_iters(self, iter_name):
        #Design the URL
        api = "api/iterations/" + dynamic_vars.parent_iteration_id
        url = helpers.create_url(api)
        f = helpers.read_post_data_file('create_child_iteration.json', replace={'$iteration_name_generated': iter_name, '$spaceid': spaceid})
        ##Make the request
        r = req.post(url, headers=request_detail.headers_default, json=f)
        ##Analyze the response
        dynamic_vars.iteration_names_to_ids[iter_name] = helpers.extract_value("data.id", r)
        ##Validate the response
        assert r.status_code == 201
        
    @pytest.mark.parametrize("iter_name", helpers.generate_entity_names("Iteration1", 5, True, reset_counter = True))
    def test_create_nested_iters(self, iter_name):
        #Design the URL
        api = "api/iterations/" + dynamic_vars.iteration_names_to_ids[workitem_constants.iteration_1]
        url = helpers.create_url(api)
        f = helpers.read_post_data_file('create_child_iteration.json', replace={'$iteration_name_generated': iter_name, '$spaceid': spaceid})
        ##Make the request
        r = req.post(url, headers=request_detail.headers_default, json=f)
        ##Analyze the response
        dynamic_vars.nested_iters_names_to_ids[iter_name] = helpers.extract_value("data.id", r)
        ##Validate the response
        assert r.status_code == 201