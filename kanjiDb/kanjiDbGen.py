from lxml import etree


root = etree.Element('root')

etree.SubElement(root, 'child1')
etree.SubElement(root, 'child2')

rootStr = etree.tostring(root, pretty_print=True)

child = root[0]

x = 0


# dicPath = 'kanjiDic2-cutdown.xml'
# knjPath = 'kanjivg-cutdown.xml'
# outPath = 'kanjiDb.xml'

# dicTree = ET.parse(dicPath)
# dicRoot = dicTree.getroot()

# knjTree = ET.parse(knjPath)
# knjRoot = knjTree.getroot()


# def findEntryInDic(kanji, dic):

#   return

# # create the o/p db structure
# kDbRoot = ET.Element('kanjiDb')

# dicEntry = dicRoot[1]
# knjEntry = knjRoot[0]

# # kDbEntry = ET.SubElement(dicEntry, knjEntry)
# # kDbEntry = ET.SubElement(kDbRoot, dicEntry)

# ET.SubElement(dicEntry, 'kanji').extend(knjEntry)
# ET.SubElement(kDbRoot, 'character').extend(dicEntry)

# # Set 1
# kanjiList = [
#   '一',
#   '九',
#   '七',
#   '十',
#   '人',
#   '二',
#   '入',
#   '八',
#   '下',
#   '口',
#   '三',
#   '山'
#   ]

# kanjiElem = findEntryInDic(kanjiList[0], dicRoot)

# writeFile(kDbRoot, outPath)