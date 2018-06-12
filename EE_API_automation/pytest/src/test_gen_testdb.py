import pytest, time
import requests as req
from support.constants import request_detail, launch_detail, workitem_constants, dynamic_vars
import support.helpers as helpers

start_time = time.time()

class TestClass_SetupPlanner(object):
    def test_setup_planner(self, sut, offline_token, userid):
        print "\n\n==>Planner Test Setup Start....\n"
        if sut is None:
            launch_detail.base_url[launch_detail.base_wit] = r"https://api.openshift.io"
            print "SUT (WIT Target) not provided!!! Using default production SUT = ", launch_detail.base_url[launch_detail.base_wit]
        else:
            launch_detail.base_url[launch_detail.base_wit] = sut
            print "SUT set to = ", sut
        
        if userid is None:
            launch_detail.userid_primary = launch_detail.userid_prod_primary_default
            print "USERID not provided! Going ahead with the default USERID = ", launch_detail.userid_prod_primary_default
        else:
            launch_detail.userid_primary = userid
            print "USERID set to = ", launch_detail.userid_primary   
         
        if offline_token is None:
            pytest.exit("OFFLINE_TOKEN not provided!!! Terminating the run!!!!!!!!!!!")
        else:
            launch_detail.offref_token_userid_primary = offline_token
            launch_detail.token_userid_primary = launch_detail.get_access_token_from_refresh()
            if launch_detail.token_userid_primary is None:
                pytest.exit("ACCESS_TOKEN cannot be generated!!! Terminating the run!!!!!!!!!!!")
            else:
                print "ACCESS_TOKEN set to = A secret in Jenkins ;)"

        #### Define Request Header, that includes Access Token
        request_detail.headers_default = {request_detail.content_type_key_default:request_detail.content_type_default, request_detail.authorization_key_default:request_detail.authorization_carrier_default+launch_detail.token_userid_primary}
        print "\n==>Planner Test Setup Complete....\n"
        print "+++++++++++++++++ Running Planner API Tests ++++++++++++++++\n"

class TestClass_SDD(object):
    class TestClass_CreateSpace(object):
        def test_get_user_details(self):
            #Design the URL
            api = "api/users?filter[username]=" + launch_detail.userid_primary
            url = launch_detail.create_url(api)
            ##Make the request
            r = req.get(url, headers=request_detail.headers_default)
            ##Analyze the response
            global loggedin_user_id, loggedin_user_name
            loggedin_user_id = helpers.extract_value("data[0].id", r)
            loggedin_user_name = helpers.extract_value("data[0].attributes.username", r)
            content_type_header = helpers.extract_header("Content-Type", r)
            
            ##Save and retain dynamic data for later use
            dynamic_vars.username = loggedin_user_name
            dynamic_vars.userfullname = helpers.extract_value("data[0].attributes.fullName", r)
            dynamic_vars.userid = loggedin_user_id
            ##Validate the response
            assert r.status_code == 200
            assert content_type_header == request_detail.content_type_default

        def test_create_new_space(self):
            #Design the URL
            api = "api/spaces"
            url = launch_detail.create_url(api)
            space_name = helpers.create_space_name()
            f = helpers.read_post_data_file('create_space_sdd.json', replace={'$space_name_var':space_name, '$loggedin_user_id':dynamic_vars.userid})
            ##Make the request
            r = req.post(url, headers=request_detail.headers_default, json=f)
            ##Analyze the response
            global spaceid, spacename
            spaceid = helpers.extract_value("data.id", r)
            spacename = helpers.extract_value("data.attributes.name", r)
            spacelink = helpers.extract_value("data.links.self", r)
            content_type_header = helpers.extract_header("Content-Type", r)
            print "\nSpace created : ", spacename
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
                url = launch_detail.create_url(api)
                ##Make the request
                r = req.get(url, headers=request_detail.headers_default)
                ##Validate the response
                assert r.status_code == 200
                assert helpers.extract_header("Content-Type", r) == request_detail.content_type_default
                assert helpers.extract_value("data.type", r) == "spaces"
                assert helpers.extract_value("data.attributes.name", r) == spacename
                
        def test_enable_experimental_features(self):
            #Design the URL
            api = "api/users"
            url = launch_detail.create_url(api)
            f = helpers.read_post_data_file('enable_experimental.json', replace={'$loggedin_user_id':dynamic_vars.userid})
            ##Make the request
            r = req.patch(url, headers=request_detail.headers_default, json=f)
            ##Validate the response
            assert r.status_code == 200

    class TestClass_CreateAreas(object):
        def test_get_parent_area(self):
                #Design the URL
                api = "api/spaces/" + spaceid + "/areas"
                url = launch_detail.create_url(api)
                ##Make the request
                r = req.get(url, headers=request_detail.headers_default)
                ##Analyze the response
                dynamic_vars.parent_area_id = helpers.extract_value("data[0].id", r)
                dynamic_vars.parent_area_name = helpers.extract_value("data[0].attributes.name", r)
                ##Validate the response
                r.raise_for_status()
        
        @pytest.mark.parametrize("area_name", helpers.generate_entity_names("Area", 2))
        def test_create_child_areas(self, area_name):
            #Design the URL
            api = "api/areas/" + dynamic_vars.parent_area_id
            url = launch_detail.create_url(api)
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
                url = launch_detail.create_url(api)
                ##Make the request
                r = req.get(url, headers=request_detail.headers_default)
                ##Analyze the response
                dynamic_vars.parent_iteration_id = helpers.extract_value("data[0].id", r)
                dynamic_vars.parent_iteration_name = helpers.extract_value("data[0].attributes.name", r)
                ##Validate the response
                r.raise_for_status()
                
        @pytest.mark.parametrize("iter_name", helpers.generate_entity_names("Iteration", 2, True, reset_counter = True))
        def test_create_child_iters(self, iter_name):
            #Design the URL
            api = "api/iterations/" + dynamic_vars.parent_iteration_id
            url = launch_detail.create_url(api)
            f = helpers.read_post_data_file('create_child_iteration.json', replace={'$iteration_name_generated': iter_name, '$spaceid': spaceid})
            ##Make the request
            r = req.post(url, headers=request_detail.headers_default, json=f)
            ##Analyze the response
            dynamic_vars.iteration_names_to_ids[iter_name] = helpers.extract_value("data.id", r)
            ##Validate the response
            assert r.status_code == 201
            
        @pytest.mark.parametrize("iter_name", helpers.generate_entity_names("Iteration1", 1, True, reset_counter = True))
        def test_create_nested_iters(self, iter_name):
            #Design the URL
            api = "api/iterations/" + dynamic_vars.iteration_names_to_ids[workitem_constants.iteration_1]
            url = launch_detail.create_url(api)
            f = helpers.read_post_data_file('create_child_iteration.json', replace={'$iteration_name_generated': iter_name, '$spaceid': spaceid})
            ##Make the request
            r = req.post(url, headers=request_detail.headers_default, json=f)
            ##Analyze the response
            dynamic_vars.nested_iters_names_to_ids[iter_name] = helpers.extract_value("data.id", r)
            ##Validate the response
            assert r.status_code == 201

    #### Workitem related tests follows::::::::
    class TestClass_CreateWorkitems(object):
        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_scenarios(self, wi_name):
            r = helpers.create_workitem_SDD(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypescenario)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem. If label doen't exist, add one
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_1]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_1] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_1, label_id=None)
                r.raise_for_status()
            
        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_experiences(self, wi_name):
            r = helpers.create_workitem_SDD(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypeexperience)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_2]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_2] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_2, label_id=None)
                r.raise_for_status()
            
        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_features(self, wi_name):
            r = helpers.create_workitem_SDD(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypefeature)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ### Add a few labels to the workitem
            helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_id=[dynamic_vars.labels_names_to_ids[workitem_constants.label_1], dynamic_vars.labels_names_to_ids[workitem_constants.label_2]])
            
        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_tasks(self, wi_name):
            r = helpers.create_workitem_SDD(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypetask)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a few labels to the workitem
            helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_id=[dynamic_vars.labels_names_to_ids[workitem_constants.label_1], dynamic_vars.labels_names_to_ids[workitem_constants.label_2]])
            
    class TestClass_Teardown(object):
        def test_teardown(self, cleanup):
            import os, json
            launch_detail.launch_details_dict["space_name"] = dynamic_vars.spacename
            launch_detail.launch_details_dict["space_id"] = dynamic_vars.spaceid
            launch_detail.launch_details_dict["space_link"] = dynamic_vars.spacelink
            launch_detail.launch_details_dict["user_fullname"] = dynamic_vars.userfullname
            launch_detail.launch_details_dict["user_name"] = dynamic_vars.username
            launch_detail.launch_details_dict["user_id"] = dynamic_vars.userid
            launch_detail.launch_details_dict["token"] = launch_detail.token_userid_primary
            launch_detail.launch_details_dict["offline_token"] = launch_detail.offref_token_userid_primary
            
            try:
                curr_dir = os.path.dirname(__file__)
                filepath = os.path.join(curr_dir, '..' , 'launch_info_dump.json')
                with open(filepath, 'w') as f:
                    json.dump(launch_detail.launch_details_dict, f, sort_keys=True, indent=4)
            except:
                print "Exception creating launch_info_dump.json"

            if cleanup:
                print "\nSpace deleted : %s" % dynamic_vars.spacename
                r = helpers.delete_space(dynamic_vars.spaceid)
                assert r.status_code == 200
            
class TestClass_SCRUM(object):
    class TestClass_CreateSpace(object):
        def test_get_user_details(self):
            #Design the URL
            api = "api/users?filter[username]=" + launch_detail.userid_primary
            url = launch_detail.create_url(api)
            ##Make the request
            r = req.get(url, headers=request_detail.headers_default)
            ##Analyze the response
            global loggedin_user_id, loggedin_user_name
            loggedin_user_id = helpers.extract_value("data[0].id", r)
            loggedin_user_name = helpers.extract_value("data[0].attributes.username", r)
            content_type_header = helpers.extract_header("Content-Type", r)
            
            ##Save and retain dynamic data for later use
            dynamic_vars.reset()
            dynamic_vars.username = loggedin_user_name
            dynamic_vars.userfullname = helpers.extract_value("data[0].attributes.fullName", r)
            dynamic_vars.userid = loggedin_user_id
            ##Validate the response
            assert r.status_code == 200
            assert content_type_header == request_detail.content_type_default

        def test_create_new_space(self):
            #Design the URL
            api = "api/spaces"
            url = launch_detail.create_url(api)
            space_name = helpers.create_space_name("SCRUM")
            f = helpers.read_post_data_file('create_space_scrum.json', replace={'$space_name_var':space_name, '$loggedin_user_id':dynamic_vars.userid})
            ##Make the request
            r = req.post(url, headers=request_detail.headers_default, json=f)
            ##Analyze the response
            global spaceid, spacename
            spaceid = helpers.extract_value("data.id", r)
            spacename = helpers.extract_value("data.attributes.name", r)
            spacelink = helpers.extract_value("data.links.self", r)
            content_type_header = helpers.extract_header("Content-Type", r)
            print "\nSpace created : ", spacename
            ##Save and retain dynamic data for later use
            dynamic_vars.spaceid = spaceid
            dynamic_vars.spacename = spacename
            dynamic_vars.spacelink = spacelink
            ##Validate the response
            assert r.status_code == 201
            assert content_type_header == request_detail.content_type_default
            assert helpers.extract_value("data.type", r) == 'spaces'

        def test_get_space_details(self):
                #Design the URL
                api = "api/spaces/" + spaceid
                url = launch_detail.create_url(api)
                ##Make the request
                r = req.get(url, headers=request_detail.headers_default)
                ##Validate the response
                assert r.status_code == 200
                assert helpers.extract_header("Content-Type", r) == request_detail.content_type_default
                assert helpers.extract_value("data.type", r) == "spaces"
                assert helpers.extract_value("data.attributes.name", r) == spacename
                
        def test_enable_experimental_features(self):
            #Design the URL
            api = "api/users"
            url = launch_detail.create_url(api)
            f = helpers.read_post_data_file('enable_experimental.json', replace={'$loggedin_user_id':dynamic_vars.userid})
            ##Make the request
            r = req.patch(url, headers=request_detail.headers_default, json=f)
            ##Validate the response
            assert r.status_code == 200

    class TestClass_CreateAreas(object):
        def test_get_parent_area(self):
                #Design the URL
                api = "api/spaces/" + spaceid + "/areas"
                url = launch_detail.create_url(api)
                ##Make the request
                r = req.get(url, headers=request_detail.headers_default)
                ##Analyze the response
                dynamic_vars.parent_area_id = helpers.extract_value("data[0].id", r)
                dynamic_vars.parent_area_name = helpers.extract_value("data[0].attributes.name", r)
                ##Validate the response
                r.raise_for_status()
        
        @pytest.mark.parametrize("area_name", helpers.generate_entity_names("Area", 2))
        def test_create_child_areas(self, area_name):
            #Design the URL
            api = "api/areas/" + dynamic_vars.parent_area_id
            url = launch_detail.create_url(api)
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
                url = launch_detail.create_url(api)
                ##Make the request
                r = req.get(url, headers=request_detail.headers_default)
                ##Analyze the response
                dynamic_vars.parent_iteration_id = helpers.extract_value("data[0].id", r)
                dynamic_vars.parent_iteration_name = helpers.extract_value("data[0].attributes.name", r)
                ##Validate the response
                r.raise_for_status()
                
        @pytest.mark.parametrize("iter_name", helpers.generate_entity_names("Iteration", 2, True, reset_counter = True))
        def test_create_child_iters(self, iter_name):
            #Design the URL
            api = "api/iterations/" + dynamic_vars.parent_iteration_id
            url = launch_detail.create_url(api)
            f = helpers.read_post_data_file('create_child_iteration.json', replace={'$iteration_name_generated': iter_name, '$spaceid': spaceid})
            ##Make the request
            r = req.post(url, headers=request_detail.headers_default, json=f)
            ##Analyze the response
            dynamic_vars.iteration_names_to_ids[iter_name] = helpers.extract_value("data.id", r)
            ##Validate the response
            assert r.status_code == 201
            
        @pytest.mark.parametrize("iter_name", helpers.generate_entity_names("Iteration1", 1, True, reset_counter = True))
        def test_create_nested_iters(self, iter_name):
            #Design the URL
            api = "api/iterations/" + dynamic_vars.iteration_names_to_ids[workitem_constants.iteration_1]
            url = launch_detail.create_url(api)
            f = helpers.read_post_data_file('create_child_iteration.json', replace={'$iteration_name_generated': iter_name, '$spaceid': spaceid})
            ##Make the request
            r = req.post(url, headers=request_detail.headers_default, json=f)
            ##Analyze the response
            dynamic_vars.nested_iters_names_to_ids[iter_name] = helpers.extract_value("data.id", r)
            ##Validate the response
            assert r.status_code == 201

    #### Workitem related tests follows::::::::
    class TestClass_CreateWorkitems(object):  
        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_epics(self, wi_name):
            r = helpers.create_workitem_SCRUM(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypeepic)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem. If label doen't exist, add one
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_1]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_1] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_1, label_id=None)
                r.raise_for_status()

        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_features(self, wi_name):
            r = helpers.create_workitem_SCRUM(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypefeature1)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_2]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_2] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_2, label_id=None)
                r.raise_for_status()

        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_bugs(self, wi_name):
            r = helpers.create_workitem_SCRUM(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypebug1)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_3]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_3] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_3, label_id=None)
                r.raise_for_status()

        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_backlogitems(self, wi_name):
            r = helpers.create_workitem_SCRUM(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypebacklogitem)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_4]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_4] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_4, label_id=None)
                r.raise_for_status()
            
        @pytest.mark.parametrize("wi_name", helpers.generate_entity_names("Workitem_Title", 1))
        def test_create_backlog_tasks(self, wi_name):
            r = helpers.create_workitem_SCRUM(title=wi_name, spaceid=dynamic_vars.spaceid, witype=workitem_constants.witypetask1)
            ## Add a couple of comments to the workitem
            helpers.add_workitem_comment(dynamic_vars.wi_names_to_links[wi_name], workitem_constants.comment_1_text)
            ## Add a label to the workitem
            try:
                unused = dynamic_vars.labels_names_to_ids[workitem_constants.label_5]
            except KeyError:
                r, dynamic_vars.labels_names_to_ids[workitem_constants.label_5] = helpers.add_workitem_label(workitem_link=dynamic_vars.wi_names_to_links[wi_name], label_text=workitem_constants.label_5, label_id=None)
                r.raise_for_status()

    class TestClass_Teardown(object):
        def test_teardown(self, cleanup):
            import os, json
            end_time = time.time()
            
            launch_detail.launch_details_dict["space_name_scrum"] = dynamic_vars.spacename
            launch_detail.launch_details_dict["space_id_scrum"] = dynamic_vars.spaceid
            launch_detail.launch_details_dict["space_link_scrum"] = dynamic_vars.spacelink
            
            try:
                curr_dir = os.path.dirname(__file__)
                filepath = os.path.join(curr_dir, '..' , 'launch_info_dump.json')
                with open(filepath, 'w') as f:
                    json.dump(launch_detail.launch_details_dict, f, sort_keys=True, indent=4)
            except:
                print "Exception creating launch_info_dump.json"
            
            if cleanup:
                print "\nSpace deleted : %s" % dynamic_vars.spacename
                r = helpers.delete_space(dynamic_vars.spaceid)
                assert r.status_code == 200
            
            global start_time
            print "\n\nTotal time taken: %s seconds" % int((end_time - start_time))
            
            print "\n+++++++++++++++++ Planner API Tests Complete +++++++++++++++"

         