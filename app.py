from flask import Flask, jsonify, request
from flask_cors import CORS
import re
import ipaddress
import json
import os
from dotenv import load_dotenv
import requests


load_dotenv()

app = Flask(__name__)
CORS(app)

def normalize_ip(ip_str):
    return str(ipaddress.ip_address(ip_str))

def get_data():
    with open('log_to_analyze_test.txt') as f:
        content = f.readlines()
    data = []
    for line in content:
        ip_address = re.findall(r'[0-9]+(?:\.[0-9]+){3}', line)
        http_request_type = re.findall(r'\"(.*?)\"', line)
        request_date = re.findall(r'\[(.*?)\]', line)
        if ip_address and http_request_type and request_date:
            data.append([ip_address[0], http_request_type[0].split(' ')[0], request_date[0].split(' ')[0]])
    return data



@app.route('/get_specific_info', methods=['GET'])
def get_specific_info():
    # retrieve the elements from the request
    ip = request.args.get('ip')
    ip = normalize_ip(ip)
    ip = str(ip)

    # call the API
    url = os.getenv("API_URL")
    token = os.getenv("API_TOKEN")

    response = requests.get(str(url + "?apiKey=" + token + "&ip=" + ip))

    print(response.json())
    if not response:
        return {"data": []}

    return {"data": response.json()}


@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    file.save('log_to_analyze_test.txt')
    return jsonify({'message': 'File uploaded successfully'})

@app.route('/analyze', methods=['GET'])
def filter_data_per_unique_api():
    data = get_data()
    unique_data = set()

    # we make a set of unique ips to avoid duplicates but this won't be returned
    unique_ips = set()

    for d in data:
        ip = normalize_ip(d[0])
        method = d[1]
        if method != 'GET' and method != 'POST' and method != 'PUT' and method != 'DELETE':
            continue
        if ip in unique_ips:
            continue
        else:
            unique_ips.add(ip)
            unique_data.add(tuple(d))

    result = {'data': list(unique_data)}
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
