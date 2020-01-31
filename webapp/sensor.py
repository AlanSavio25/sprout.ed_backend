import  dht11
import time
import datetime

##initialise GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.cleanup()

#read data using pin 7
instance = dht11.DHT11(pin=7)

while True:
    result = instance.read()
    if result.is_valid():
        print("Last valid input:" + str(datetime.datetime.now()))
        print("Humidity: %d %%" % result.humidity)

    time.sleep(1)
