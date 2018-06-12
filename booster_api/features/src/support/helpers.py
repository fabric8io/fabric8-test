import os, datetime
import requests as req
import json, jmespath, operator
import constants

from loginusers_oauth2 import LoginUsersOauth2, user_tokens

count = 1

def login_user(username="", password=""):
    loginUser = LoginUsersOauth2(username, password)
    loginUser.login_users()

def is_user_logged_in():
    return len(user_tokens) > 0

def get_user_tokens(index=0):
    return user_tokens[index]

def create_space_name(template="BDD"):
    var = datetime.datetime.now()
    var = var.isoformat().rsplit('.')[0]
    space = os.getenv("OSIO_USERNAME") + "-" + template + "-space-" + var
    space = space.replace('@','-')
    space = space.replace(':','-')
    space = space.replace('.','-')
    print 'The spacename is: ' + space
    return space

def find_in_obj(obj, condition, path=None):

    if path is None:
        path = []    

    # In case this is a list
    if isinstance(obj, list):
        for index, value in enumerate(obj):
            new_path = list(path)
            new_path.append(index)
            for result in find_in_obj(value, condition, path=new_path):
                yield result 

    # In case this is a dictionary
    if isinstance(obj, dict):
        for key, value in obj.items():
            new_path = list(path)
            new_path.append(key)
            for result in find_in_obj(value, condition, path=new_path):
                yield result 

            if condition == value:
                new_path = list(path)
                new_path.append(key)
                yield new_path 
                
def getFromDict(dataDict, mapList):
    return reduce(operator.getitem, mapList, dataDict)

def setInDict(dataDict, mapList, value):
    getFromDict(dataDict, mapList[:-1])[mapList[-1]] = value

def read_post_data_file(file_name=None, replace=None, json_dir='planner_jsons'):
    ###Default json_dir is set to planner_jsons directory
    if file_name is None:
        print "No file name provided. No json to read!!"
        return None
    else:
        try:
            curr_dir = os.path.dirname(__file__)
            filepath = os.path.join(curr_dir, json_dir, file_name)
            with open(filepath, 'rb') as f:
                json_data = json.load(f)
            if replace is not None:
                json_data = replace_values(json_data, replace)
            return json_data
        except Exception as e:
            print "Exception reading file for json data "
            print e
            return None
            
def extract_value(extract_path=None, json_response=None):
    if None in [json_response, extract_path]:
        print "Either Json response or the extractor path are None"
        return None
    else:
        try:
            return jmespath.search(extract_path, json_response.json())
        except:
            print "Exception extracting value from the response body"
            return None
        
def extract_header(extract_key=None, json_response=None):
    if None in [json_response, extract_key]:
        print "Either Json response or the extractor path are None"
        return None
    else:
        try:
            return json_response.headers[extract_key]
        except:
            print "Exception extracting header value from the response"
            return None

def replace_values(orig_dict=None, strs_to_replace_dict=None):
    if None not in [orig_dict, strs_to_replace_dict]:
        paths = {}
        for key_rep in strs_to_replace_dict:
            val_to_replace = unicode(key_rep, "utf-8")
#             print "Key to replace:", val_to_replace
            temp_list = []
            temp_dict = {}
            try:
                for path in find_in_obj(orig_dict, val_to_replace):
                    temp_list.append(path)
                temp_dict = {val_to_replace: temp_list}
                paths.update(temp_dict)
#                 print "interim paths:", paths
            except KeyError:
                print "All paths found"
            except:
                print "Key not found in json blob"
        
#         print "final paths:", paths
        for path in paths:
            for i in xrange(len(paths[path])):
                setInDict(orig_dict, paths[path][i], strs_to_replace_dict[path])
        return orig_dict        ###Final updated JSON
    else:
        print "None value supplied for replacements"

##Returns a list like this if called like: generate_entity_names('Area', 5)
##['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5']
def generate_entity_names(static_string=None, no_of_names=1, reverse=False, reset_counter=False):   
    global count
    if reset_counter:
        count = 1
    mylist = []
    total_entities = count + no_of_names
    for i in xrange(count, total_entities):
        if static_string is not None:
            mylist.append(static_string + "_" + str(i))
        else:
            mylist.append(i)
    #Updating global counter
    count = total_entities
    
    if reverse == True:
        mylist = list(reversed(mylist))
    return mylist

def create_workitem_SDD(title=None, spaceid=None, witype=None, iterationid=None):
    if None in [title, spaceid, witype]:
        print "None value supplied for either SpaceID / WI-Title / WI-Type"
        return None
    ## Create workitems in Iterations context
    elif iterationid is not None:
        api = "api/spaces/" + spaceid + "/workitems"
        url = constants.launch_detail.create_url(api)
        f = read_post_data_file('create_wi_in_iter.json', replace={'$wi_nos_generated':title, '$witype': witype, '$iteration_id': iterationid})
        r = req.post(url, headers=constants.request_detail.headers_default, json=f)
        constants.dynamic_vars.wi_names_to_ids[title] = extract_value("data.id", r)
        constants.dynamic_vars.wi_names_to_links[title] = extract_value("data.links.self", r)
        return r
    ## Create workitems in backlog view
    else:
        api = "api/spaces/" + spaceid + "/workitems"
        url = constants.launch_detail.create_url(api)
        f = read_post_data_file('create_wi_in_backlog.json', replace={'$wi_nos_generated':title, '$witype': witype})
        r = req.post(url, headers=constants.request_detail.headers_default, json=f)
        constants.dynamic_vars.wi_names_to_ids[title] = extract_value("data.id", r)
        constants.dynamic_vars.wi_names_to_links[title] = extract_value("data.links.self", r)
        return r

def create_workitem_SCRUM(title=None, spaceid=None, witype=None, iterationid=None):
    if None in [title, spaceid, witype]:
        print "None value supplied for either SpaceID / WI-Title / WI-Type"
        return None
    ## Create workitems in Iterations context
    elif iterationid is not None:
        api = "api/spaces/" + spaceid + "/workitems"
        url = constants.launch_detail.create_url(api)
        if witype == constants.workitem_constants.witypetask1:
            f = read_post_data_file('create_wi_in_iter_scrum.json', replace={'$wi_nos_generated':title, '$witype': witype, '$state': 'To Do', '$iteration_id': iterationid})
        else:
            f = read_post_data_file('create_wi_in_iter_scrum.json', replace={'$wi_nos_generated':title, '$witype': witype, '$state': 'New', '$iteration_id': iterationid})
        r = req.post(url, headers=constants.request_detail.headers_default, json=f)
        constants.dynamic_vars.wi_names_to_ids[title] = extract_value("data.id", r)
        constants.dynamic_vars.wi_names_to_links[title] = extract_value("data.links.self", r)
        return r
    ## Create workitems in backlog view
    else:
        api = "api/spaces/" + spaceid + "/workitems"
        url = constants.launch_detail.create_url(api)
        if witype == constants.workitem_constants.witypetask1:
            f = read_post_data_file('create_wi_in_backlog_scrum.json', replace={'$wi_nos_generated':title, '$witype': witype, '$state': 'To Do'})
        else:
            f = read_post_data_file('create_wi_in_backlog_scrum.json', replace={'$wi_nos_generated':title, '$witype': witype, '$state': 'New'})
        r = req.post(url, headers=constants.request_detail.headers_default, json=f)
        constants.dynamic_vars.wi_names_to_ids[title] = extract_value("data.id", r)
        constants.dynamic_vars.wi_names_to_links[title] = extract_value("data.links.self", r)
        return r

def add_workitem_comment(workitem_link=None, comment_text=None):
    if None in [workitem_link, comment_text]:
        print "Please specify a valid Workitem-Link and a CommentText"
        return None
    else:
        ## Add a comment to the workitem
        wi_comment_api = workitem_link + "/comments"
        f = read_post_data_file('add_wi_comment.json', replace={'$comment_text':comment_text})
        return req.post(wi_comment_api, headers=constants.request_detail.headers_default, json=f)

def create_new_label(label_text=None):
    if label_text is None:
        print "Please specify a valid LabelText"
        return None
    else:
        ## Add a Label to the space
        create_label_api = "api/spaces/" + constants.dynamic_vars.spaceid + "/labels"
        url = constants.launch_detail.create_url(create_label_api)
        f = read_post_data_file('create_label.json', replace={'$label_name':label_text})
        return req.post(url, headers=constants.request_detail.headers_default, json=f)
    
def add_workitem_label(workitem_link=None, label_text=None, label_id=None):
    if None in [workitem_link]:
        print "Please specify a valid Workitem-Link"
        return None
    else:
        if label_id is None:
            ## Create a new label to the space
            r = create_new_label(label_text)
            if r is not None:
                label_id = extract_value("data.id", r)
        
        if label_id is not None:
            ## Add a label to the workitem
            wi_id = workitem_link.rsplit('/', 1)[1]
            wi_patch_api = workitem_link
            if type(label_id) == list:
                f = read_post_data_file('add_wi_labels.json', replace={'$wi_id':wi_id, '$wi_link':workitem_link, '$label_1_id':label_id[0], '$label_2_id':label_id[1], '$label_3_id':label_id[2]})
                r = req.patch(wi_patch_api, headers=constants.request_detail.headers_default, json=f)
            else:       
                f = read_post_data_file('add_wi_label.json', replace={'$wi_id':wi_id, '$wi_link':workitem_link, '$wi_ver':0, '$label_id':label_id})
                r = req.patch(wi_patch_api, headers=constants.request_detail.headers_default, json=f)
        return r, label_id 
    
def add_workitem_parent_link(wi_parent_title=None, wi_child_title=None):
    if None in [wi_parent_title, wi_child_title]:
        print "Please specify two valid Workitem Titles"
        return None
    else:
        #Design the URL
        api = "api/workitemlinks"
        url = constants.launch_detail.create_url(api)
        f = read_post_data_file('create_wi_hierarchy.json', replace={'$wilinktype_parent': constants.workitem_constants.wilinktype_parent, '$wi_parent_id': constants.dynamic_vars.wi_names_to_ids[wi_parent_title], '$wi_child_id': constants.dynamic_vars.wi_names_to_ids[wi_child_title]})
        ##Make the request
        r = req.post(url, headers=constants.request_detail.headers_default, json=f)
        return r

def delete_space(spaceid=None):
    if spaceid is None:
        print "Please specify a valid space ID"
        return None
    else:
        ## Delete a space
        api = "api/spaces/" + spaceid
        url = constants.launch_detail.create_url(api)
        r = req.delete(url, headers=constants.request_detail.headers_default)
        return r
