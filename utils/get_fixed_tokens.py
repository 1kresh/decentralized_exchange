import requests
import json
    
def findTokenOnMainnet(symbol):
    for token in data['tokens']:
        if token['symbol'] == symbol and token['chainId'] == 1:
            return token

data = requests.get('https://tokens.uniswap.org/').json()
for token in data['tokens']:
    try:
        if requests.get(token['logoURI']).status_code == 404:
            token['logoURI'] = findTokenOnMainnet(token['symbol'])['logoURI']
    except:
        if token['symbol'] == 'UNI':
            token['logoURI'] = "https://cloudflare-ipfs.com/ipfs/QmXttGpZrECX5qCyXbBQiqgQNytVGeZW5Anewvh2jc4psg/"
            
with open('./public/token_list_all.json', 'w') as f:
    json.dump(data, f)
        
