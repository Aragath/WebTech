from flask import Flask, request, jsonify
import requests # making requests to external APIs
from datetime import datetime
from dateutil.relativedelta import relativedelta

app = Flask(__name__, static_folder='static')

FINNHUB_KEY = ''
POLYGON_KEY = ''

@app.route('/')
@app.route('/index')
def index():
    return app.send_static_file('index.html')

@app.route('/stock-search', methods=['GET'])
def stock_search():
    # Get the stock symbol from the query parameters
    stock_symbol = request.args.get('search')

    # Make a request to the Finnhub API
    finnhub_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={stock_symbol}&token={FINNHUB_KEY}'

    try:
        response = requests.get(finnhub_url)
        response.raise_for_status()
        data = response.json()

        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Finnhub stock API error: {str(e)}'}), 500
    
@app.route('/summary-search', methods=['GET'])
def summary_search():
    stock_symbol = request.args.get('search')

    finnhub_url = f'https://finnhub.io/api/v1/quote?symbol={stock_symbol}&token={FINNHUB_KEY}'

    try:
        response = requests.get(finnhub_url)
        response.raise_for_status()
        data = response.json()

        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Finnhub summary API error: {str(e)}'}), 500
    
@app.route('/recommend-search', methods=['GET'])
def recommend_search():
    stock_symbol = request.args.get('search')

    finnhub_url = f'https://finnhub.io/api/v1/stock/recommendation?symbol={stock_symbol}&token={FINNHUB_KEY}'

    try:
        response = requests.get(finnhub_url)
        response.raise_for_status()
        data = response.json()

        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Finnhub recommendation API error: {str(e)}'}), 500
    
@app.route('/chart-search', methods=['GET'])
def chart_search():
    stock_symbol = request.args.get('search')

    from_ = int((datetime.now() - relativedelta(months=6, days=1)).timestamp())
    from_ = datetime.utcfromtimestamp(from_).strftime('%Y-%m-%d')
    to = int(datetime.now().timestamp())
    to = datetime.utcfromtimestamp(to).strftime('%Y-%m-%d')

    polygon_url = f'https://api.polygon.io/v2/aggs/ticker/{stock_symbol}/range/1/day/{from_}/{to}?adjusted=true&sort=asc&apiKey={POLYGON_KEY}'
    
    try:
        response = requests.get(polygon_url)
        response.raise_for_status()
        data = response.json()

        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Polygon chart API error: {str(e)}'}), 500
    
@app.route('/news-search', methods=['GET'])
def news_search():
    stock_search = request.args.get('search')
    from_ = int((datetime.now() - relativedelta(days=30)).timestamp())
    from_ = datetime.utcfromtimestamp(from_).strftime('%Y-%m-%d')
    to = int(datetime.now().timestamp())
    to = datetime.utcfromtimestamp(to).strftime('%Y-%m-%d')

    finnhub_url = f'https://finnhub.io/api/v1/company-news?symbol={stock_search}&from={from_}&to={to}&token={FINNHUB_KEY}'

    try:
        response = requests.get(finnhub_url)
        response.raise_for_status()
        data = response.json()

        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Finnhub news API error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
