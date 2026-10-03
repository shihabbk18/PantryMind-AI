"""Bundle a small set of Unsplash serving-suggestion photos under the Unsplash License."""
import json
from pathlib import Path
import urllib.request

ROOT=Path(__file__).resolve().parents[1]
PHOTOS={
 'salad': 'photo-1512621776951-a57141f2eefd',
 'pasta': 'photo-1473093295043-cdd812d0e601',
 'rice': 'photo-1547592180-85f173990554',
 'breakfast': 'photo-1490645935967-10de6ba17061',
}

def download():
    target=ROOT/'web/images'
    target.mkdir(parents=True,exist_ok=True)
    records=[]
    for name,ident in PHOTOS.items():
        url=f'https://images.unsplash.com/{ident}?auto=format&fit=crop&w=1000&q=82'
        request=urllib.request.Request(url,headers={'User-Agent':'PantryMind-AI portfolio app'})
        with urllib.request.urlopen(request,timeout=45) as response:
            content=response.read()
        (target/f'{name}.jpg').write_bytes(content)
        records.append({'file':f'images/{name}.jpg','source':url,'license':'Unsplash License',
                        'license_url':'https://unsplash.com/license','usage':'Bundled serving suggestion; not AI generated or a photo of the user\'s food.'})
        print(name,len(content))
    (ROOT/'web/data/photo-credits.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__': download()
