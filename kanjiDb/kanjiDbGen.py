import xml.etree.ElementTree as ET
from xml.dom import minidom
import codecs

dicPath = 'kanjiDic2-cutdown.xml'
knjPath = 'kanjivg-cutdown.xml'
outPath = 'kanjiDb.xml'

dicTree = ET.parse(dicPath)
dicRoot = dicTree.getroot()

knjTree = ET.parse(knjPath)
knjRoot = knjTree.getroot()

def prettify(rootElem, strip=True):
    """
    Return a pretty-printed XML string for the Element.
    """
    if strip:
      for elem in rootElem.iter():
        if(elem.text):
            elem.text = elem.text.strip()
        if(elem.tail):
            elem.tail = elem.tail.strip()
    rough_string = ET.tostring(rootElem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent=" ")

def writeFile(elem, path, pretty=True):
  # create a new XML file with the results
  mydata = ''
  if pretty:
    mydata = prettify(elem)
  else:
    tree = ET.ElementTree(elem)
    tree.write(outPath, encoding='utf-8')
  with open(path, 'w', encoding='utf8') as myfile:
    myfile.write(mydata)

# create the o/p db structure
kDbRoot = ET.Element('kanjiDb')

dicEntry = dicRoot[1]
knjEntry = knjRoot[0]

x = u'桀'

y =  1

# kDbEntry = ET.SubElement(dicEntry, knjEntry)
# kDbEntry = ET.SubElement(kDbRoot, dicEntry)

ET.SubElement(dicEntry, 'kanji').extend(knjEntry)
ET.SubElement(kDbRoot, 'character').extend(dicEntry)


writeFile(kDbRoot, outPath)


x = 1

