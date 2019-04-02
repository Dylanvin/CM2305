import urllib.request
import socket
import schedule
import time

def callCF():
    url = "https://europe-west1-tutor-bot-85ef4.cloudfunctions.net/dialogflowFirebaseFulfillment"
    socket.setdefaulttimeout(5)
    try:
    	req = urllib.request.Request(url)
    	handle = urllib.request.urlopen(req)
    except socket.timeout:
    	print("done")

schedule.every().day.at("15:05").do(callCF)

while True:
    schedule.run_pending()
    time.sleep(60) # wait one minute
