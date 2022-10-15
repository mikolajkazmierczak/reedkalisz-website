import os
from bs4 import BeautifulSoup


FOLDER = 'microsoft'

def edit_svg(file):
  # add id to each svg element and remove width, height and viewBox

  with open(file, 'r') as f:
    xml = f.read()
  soup = BeautifulSoup(xml)

  for svg in soup.find_all('svg'):
    svg['id'] = 'svg'
    del svg['width']
    del svg['height']
    del svg['viewBox']
    del svg['viewbox']
    del svg['fill']
    for path in soup.find_all('path'):
      del path['fill']

  pretty = soup.prettify()
  with open('new/' + file, 'w+') as f:
    f.write(pretty)


for file in os.listdir('./' + FOLDER):
  if file.endswith('.svg'):
    edit_svg(file)
