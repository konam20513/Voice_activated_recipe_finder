# app.py
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app,origins=['http://localhost','chrome-extension://jdninjfgdaddhgmgdoneenfddhbnbkdn', 'https://akhilo0o.pythonanywhere.com'], supports_credentials=True, methods=['POST', 'GET'])


@app.route('/proxy', methods=['GET'])
def proxy():
    ingredient_param = request.args.get('ingredients')
    if not ingredient_param:
        return jsonify({"error": "Missing ingredients parameter"}), 400

    url = "https://cosylab.iiitd.edu.in/rdbapi/recipeDB/searchRecipeByIngUsed"
    params = {'ingUsed': ingredient_param}
    try:
        response = requests.get(url, params=params, auth=('xxxx', 'xxxxx'))
        response.raise_for_status()  # This will raise an error for 4xx or 5xx responses
        return jsonify(response.json())
    except requests.RequestException as e:
        # Log the full exception
        app.logger.error('Request failed: %s', e, exc_info=True)
        return jsonify({"error": "Failed to fetch recipes"}), 500
