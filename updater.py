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
		updateRawHTML(mypath,API_path)

		HTMLfiles = [join(mypath,f) for f in listdir(mypath) if isfile(join(mypath, f))]

		for file in HTMLfiles :
			if "Ambulance.html" in file:
				parseATS(file)

		print("updating done, sleeping for an hour")
		sleep(3600)

def updateRawHTML (path,API_path):
	emptyDir(path)
	emptyDir(API_path)

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

	rows = rows[5:]
	rows = rows[::-1]

	data = []

	itr = 0

	for row in rows :
		cells = row.find_all("td")

		area = cells[0].tect
		service = cells[1].text
		address = cells[2].text
		telephone = cells[3].text
		information = cells[4].text
		verification = cells[5].text
		verified = False

		if verification == "":
			continue

		if area == "":
			area = address

		if "VERIFIED" in verification.upper():
			verified = True

		data.append({
			"area" : area,
			"service" : service,
			"address" : address,
			"telephone" : telephone,
			"information" : information,
			"verification" : verification,
			"verified" : verified

		})

		itr = itr + 1

	with open("./API/AmbulanceTaxi.json","x") as file:
		json.dump(data,file)


main()