import os, shutil

from os import listdir
from os.path import isfile, join
from bs4 import BeautifulSoup

import urllib.request
import zipfile
from time import sleep

import json


def main ():
	while True:
		print("updating the API")

		mypath = "./rawHTML"
		API_path = "./API"
		updateRawHTML(mypath)

		HTMLfiles = [join(mypath,f) for f in listdir(mypath) if isfile(join(mypath, f))]

		for file in HTMLfiles :
			if "Ambulance.html" in file:
				parseATS(file)

		print("updating done, sleeping for an hour")
		sleep(60)

def updateRawHTML (path):
	emptyDir(path)

	getunzipped("https://docs.google.com/spreadsheets/d/16-UdbV7hX7vRVxT2EVHDjXscaAnE5QKTjG-7JIFdOHM/export?format=zip&id=16-UdbV7hX7vRVxT2EVHDjXscaAnE5QKTjG-7JIFdOHM",path)

def getunzipped(theurl, thedir):
	name = os.path.join(thedir, 'temp.zip')
	try:
		name, hdrs = urllib.request.urlretrieve(theurl, name)
	except IOError as e:
		print ("Can't retrieve %r to %r: %s" % (theurl, thedir, e))
		return
	
	try:
		z = zipfile.ZipFile(name)
	except zipfile.error as e:
		print ("Bad zipfile (from %r): %s" % (theurl, e))
		return
	
	for n in z.namelist():
		dest = os.path.join(thedir, n)
		destdir = os.path.dirname(dest)
		if not os.path.isdir(destdir):
	  		os.makedirs(destdir)
		data = z.read(n)
		f = open(dest, 'w')
		f.write(str(data))
		f.close()
	
	z.close()
	os.unlink(name)

def emptyDir (folder):
	for filename in os.listdir(folder):
		file_path = os.path.join(folder, filename)
		try:
			if os.path.isfile(file_path) or os.path.islink(file_path):
				os.unlink(file_path)
			elif os.path.isdir(file_path):
				shutil.rmtree(file_path)
		except Exception as e:
			print('Failed to delete %s. Reason: %s' % (file_path, e))

# ATS = ambulance taxi services
def parseATS (path):
	data = open(path,"r+").read()
	soup = BeautifulSoup(data, 'html.parser')

	rows = soup.find_all("tr")

	itr = 5

	allparams = rows[10]

	rows = rows[11:]
	rows = rows[::-1]

	data = []
	
	for row in rows:
		cells = row.find_all("td")
		params = allparams.find_all("td")

		instance = {"verified" : False}

		for (cell,param) in zip (cells,params) :
			instance[param.text.lower()] = cell.text

			if "VERIFIED" in cell.text.upper():
				instance["verified"] = True
		data.append(instance)


	with open("./API/AmbulanceTaxi.json","w+") as file:
		json.dump(data,file)


main()