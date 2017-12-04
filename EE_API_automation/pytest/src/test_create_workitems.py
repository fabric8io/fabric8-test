import pytest
import support.helpers as helpers
from support.constants import request_detail, dynamic_vars, workitem_constants


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