import pytest
import requests as req
import support.helpers as helpers
from support.constants import request_detail, launch_detail, dynamic_vars, workitem_constants

class TestClass_Setup(object):
    def test_setup(self, sut, offline_token, userid):
        print "\n\nTest Setup Start....\n"
        if sut is None:
            launch_detail.base_url = launch_detail.base_prod_url_default
            print "SUT not provided!!! Using default prod SUT = ", launch_detail.base_prod_url_default
        else:
            if "openshift" not in sut:
                launch_detail.test_on_prod = False
                print "Running tests on non-prod target"
            launch_detail.base_url = sut
            print "SUT set to = ", sut
        
        if userid is None:
            if launch_detail.test_on_prod:
                launch_detail.userid_primary = launch_detail.userid_prod_primary_default
                print "USERID not provided! Going ahead with the default USERID = ", launch_detail.userid_prod_primary_default
            else:
                launch_detail.userid_primary = launch_detail.userid_local_primary_default
                print "USERID not provided! Going ahead with the default USERID = ", launch_detail.userid_local_primary_default
        else:
            if launch_detail.test_on_prod:
                launch_detail.userid_primary = userid
                print "USERID set to = ", launch_detail.userid_primary
            else:
                pytest.exit("USERID provided for non-prod run!!! Terminating the run!!!!!!!!!!!")
         
        if offline_token is None:
            if launch_detail.test_on_prod:
                pytest.exit("OFFLINE_TOKEN not provided!!! Terminating the run!!!!!!!!!!!")
            else:
                launch_detail.token_userid_primary = launch_detail.get_keycloak_token()
                print "OFFLINE_TOKEN not provided!!! Assuming run on non-prod and using credentials for default testuser!"
        else:
            if launch_detail.test_on_prod:
                launch_detail.offref_token_userid_primary = offline_token
                launch_detail.token_userid_primary = launch_detail.get_access_token_from_refresh()
                print "OFFLINE_TOKEN set to = A secret in Jenkins ;)"
            else:
                pytest.exit("OFFLINE_TOKEN provided for non-prod run!!! Terminating the run!!!!!!!!!!!")
        
        #### Define Request Header, that includes Access Token
        request_detail.headers_default = {request_detail.content_type_key_default:request_detail.content_type_default, request_detail.authorization_key_default:request_detail.authorization_carrier_default+launch_detail.token_userid_primary}
        print "\nTest Setup Complete....\n"
        print "+++++++++++++++++ Running API Tests ++++++++++++++++\n"

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
        space_name = helpers.create_space_name()
        f = helpers.read_post_data_file('create_space.json', replace={'$space_name_var':space_name, '$loggedin_user_id':loggedin_user_id})
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

#### Workitem related tests follows::::::::
class TestClass_CreateWorkitems(object):  
    ##Create workitems in Iteration-1
    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2, reset_counter = True))
    def test_create_iter1_workitems(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypetask, iterationid=dynamic_vars.nested_iters_names_to_ids[workitem_constants.iteration1_1])
        ##Validate the response
        assert r.status_code == 201

    ##Create workitems in Iteration-2
    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_iter2_workitems(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypetask, iterationid=dynamic_vars.iteration_names_to_ids[workitem_constants.iteration_2])
        ##Validate the response
        assert r.status_code == 201

    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_scenarios(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypescenario)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a label to the workitem. If label doen't exist, add one
        try:
            unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_1]
        except KeyError:
            r, dynamic_vars.labels_names_to_ids[workitem_constants.label_1] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_1, label_id=None)
            r.raise_for_status()

    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_fundamentals(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypefundamental)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a label to the workitem
        try:
            unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_2]
        except KeyError:
            r, dynamic_vars.labels_names_to_ids[workitem_constants.label_2] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_2, label_id=None)
            r.raise_for_status()

    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_papercuts(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypepapercut)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a label to the workitem
        try:
            unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_3]
        except KeyError:
            r, dynamic_vars.labels_names_to_ids[workitem_constants.label_3] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_3, label_id=None)
            r.raise_for_status()

    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_valueprops(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypevalue)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a label to the workitem
        try:
            unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_4]
        except KeyError:
            r, dynamic_vars.labels_names_to_ids[workitem_constants.label_4] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_4, label_id=None)
            r.raise_for_status()
        
    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_experiences(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypeexperience)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a label to the workitem
        try:
            unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_5]
        except KeyError:
            r, dynamic_vars.labels_names_to_ids[workitem_constants.label_5] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_5, label_id=None)
            r.raise_for_status()
        
    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_bugs(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypebug)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a few labels to the workitem
        helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_id=[dynamic_vars.labels_names_to_ids[workitem_constants.label_1], dynamic_vars.labels_names_to_ids[workitem_constants.label_2], dynamic_vars.labels_names_to_ids[workitem_constants.label_3]])
        
    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_features(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypefeature)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ### Add a few labels to the workitem
        helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_id=[dynamic_vars.labels_names_to_ids[workitem_constants.label_1], dynamic_vars.labels_names_to_ids[workitem_constants.label_2], dynamic_vars.labels_names_to_ids[workitem_constants.label_3]])
        
    @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 2))
    def test_create_backlog_tasks(self, wi_name):
        r = helpers.create_workitem(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypetask)
        ## Add a couple of comments to the workitem
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
        helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_2_text)
        ## Add a few labels to the workitem
        helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_id=[dynamic_vars.labels_names_to_ids[workitem_constants.label_1], dynamic_vars.labels_names_to_ids[workitem_constants.label_2], dynamic_vars.labels_names_to_ids[workitem_constants.label_3]])
        
    def test_create_wi5_wi11_link(self):
        r = helpers.add_workitem_parent_link("Workitem_Title_5", "Workitem_Title_11")
        ##Validate the response
        assert r.status_code == 201
        
    def test_create_wi11_wi17_link(self):
        r = helpers.add_workitem_parent_link("Workitem_Title_11", "Workitem_Title_17")
        ##Validate the response
        assert r.status_code == 201
        
    def test_create_wi17_wi19_link(self):
        r = helpers.add_workitem_parent_link("Workitem_Title_17", "Workitem_Title_19")
        ##Validate the response
        assert r.status_code == 201
        
    def test_create_wi7_wi13_link(self):
        r = helpers.add_workitem_parent_link("Workitem_Title_7", "Workitem_Title_13")
        ##Validate the response
        assert r.status_code == 201
        
    def test_create_wi13_wi15_link(self):
        r = helpers.add_workitem_parent_link("Workitem_Title_13", "Workitem_Title_15")
        ##Validate the response
        assert r.status_code == 201

class TestClass_Teardown(object):
    def test_teardown(self):
        import os, json
        launch_detail.launch_details_dict["space_name"] = dynamic_vars.spacename
        launch_detail.launch_details_dict["user_name"] = dynamic_vars.username
        launch_detail.launch_details_dict["user_id"] = dynamic_vars.userid
        launch_detail.launch_details_dict["token"] = launch_detail.token_userid_primary
        
        try:
            curr_dir = os.path.dirname(__file__)
            filepath = os.path.join(curr_dir, '..' , 'launch_info_dump.json')
            with open(filepath, 'w') as f:
                json.dump(launch_detail.launch_details_dict, f, sort_keys=True, indent=4)
        except:
            print "Exception creating launch_info_dump.json"
        
        print "\n+++++++++++++++++ API Tests Complete ++++++++++++++++\n"
        
        