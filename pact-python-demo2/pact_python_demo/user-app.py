#!/usr/env/bin python
import datetime
import json
import uuid

from flask import Flask, abort, jsonify, request

fakedb = {}

app = Flask(__name__)

@app.route('/_pact/provider_states', methods=['POST'])
def provider_states():
    mapping = { 'status exists': setup_status}
    mapping[request.json['state']]()
    return jsonify({'result': request.json['state']})

def setup_status():
    #fakedb['status'] = {'name': "UserA", 'id': '1234567', 'created_on': datetime.datetime.now(), 'admin': False}
    fakedb['status'] = {'buildTime':'2018-09-10T11:08:26Z','commit':'164762f67a3a7634fa4ee1e8bb55c458281803c7-dirty','startTime':'2018-09-10T12:48:08Z'}

@app.route('/status')
def get_status():
    status_data = fakedb.get('status')
    if not status_data:
        abort(404)
    response = jsonify(**status_data)
    app.logger.debug('get status returns data:\n%s', response.data)
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5001)
