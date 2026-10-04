"""Bundle a small set of Unsplash serving-suggestion photos under the Unsplash License."""
import json
from pathlib import Path
import urllib.request
import re
import html

ROOT=Path(__file__).resolve().parents[1]
PHOTOS={
 'salad': 'photo-1512621776951-a57141f2eefd',
 'pasta': 'photo-1473093295043-cdd812d0e601',
 'rice': 'photo-1536304993881-ff6e9eefa2a6',
 'breakfast': 'photo-1490645935967-10de6ba17061',
 'burger': 'photo-1568901346375-23c9450c58cd',
 'pizza': 'photo-1513104890138-7c749659a591',
 'biryani': 'photo-1631515243349-e0cb75fb8d3a',
 'curry': 'photo-1603894584373-5ac82b2ae398',
 'eggs': 'photo-1525351484163-7529414344d8',
 'soup': 'photo-1547592166-23ac45744acd',
 'fish': 'photo-1467003909585-2f8a72700288',
 'sandwich': 'photo-1528735602780-2552fd46c7af',
 'oats': 'photo-1517673400267-0251440c45dc',
 'potato': 'photo-1707616954324-99c89a78a20d',
 'pancakes': 'photo-1528207776546-365bb710ee93',
 'omelette': 'photo-1563690449029-d6e1b8d6003d',
}

def download():
    target=ROOT/'web/images'
    target.mkdir(parents=True,exist_ok=True)
    records=[]
    for name,ident in PHOTOS.items():
        if ident.startswith('https://'):
            with urllib.request.urlopen(urllib.request.Request(ident,headers={'User-Agent':'Mozilla/5.0'}),timeout=45) as response:
                page=response.read().decode('utf-8')
            match=re.search(r'property="og:image" content="([^"]+)"',page)
            if not match: raise ValueError(f'No photograph found on {ident}')
            base=html.unescape(match.group(1)).split('?')[0]
        else: base=f'https://images.unsplash.com/{ident}'
        url=f'{base}?auto=format&fit=crop&w=1000&q=82'
        # Already bundled assets need not be fetched on every refresh.
        if not (target/f'{name}.jpg').exists():
            request=urllib.request.Request(url,headers={'User-Agent':'PantryMind-AI portfolio app'})
            with urllib.request.urlopen(request,timeout=45) as response: content=response.read()
            (target/f'{name}.jpg').write_bytes(content)
        else: content=(target/f'{name}.jpg').read_bytes()
        records.append({'file':f'images/{name}.jpg','source':url,'source_page':ident if ident.startswith('https://') else None,'license':'Unsplash License',
                        'license_url':'https://unsplash.com/license','usage':'Bundled serving suggestion; not AI generated or a photo of the user\'s food.'})
        print(name,len(content))
    spanish_url='https://upload.wikimedia.org/wikipedia/commons/3/38/Tortilla_Espa%C3%B1ola_%28Spanish_Potato_Omelet%29.jpg'
    if not (target/'spanish-omelette.jpg').exists():
        request=urllib.request.Request(spanish_url,headers={'User-Agent':'PantryMind-AI'})
        with urllib.request.urlopen(request,timeout=45) as response: (target/'spanish-omelette.jpg').write_bytes(response.read())
    records.append({'file':'images/spanish-omelette.jpg','source':spanish_url,'source_page':'https://commons.wikimedia.org/wiki/File:Tortilla_Espa%C3%B1ola_(Spanish_Potato_Omelet).jpg','author':'Joy (joyosity)','license':'CC BY 2.0','license_url':'https://creativecommons.org/licenses/by/2.0/','usage':'Unmodified photograph; displayed with CSS crop as a serving suggestion.'})
    (ROOT/'web/data/photo-credits.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__': download()
