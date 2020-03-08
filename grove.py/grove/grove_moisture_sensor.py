#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# The MIT License (MIT)
#
# Grove Base Hat for the Raspberry Pi, used to connect grove sensors.
# Copyright (C) 2018  Seeed Technology Co.,Ltd.

'''
This is the code for
    - Grove - Moisture Sensor <https://www.seeedstudio.com/Grove-Moisture-Sensor-p-955.html>`_

Examples:

    .. code-block:: python

        import time
        from grove.grove_moisture_sensor import GroveMoistureSensor

        # connect to alalog pin 2(slot A2)
        PIN = 2

        sensor = GroveMoistureSensor(PIN)

        print('Detecting moisture...')
        while True:
            m = sensor.moisture
            if 0 <= m and m < 300:
                result = 'Dry'
            elif 300 <= m and m < 600:
                result = 'Moist'
            else:
                result = 'Wet'
            print('Moisture value: {0}, {1}'.format(m, result))
            time.sleep(1)
'''

import math
import sys
import time
import seeed_dht
from grove.adc import ADC
from plant import Plant


__all__ = ["GroveMoistureSensor"]

class GroveMoistureSensor:
    '''    
    Grove Moisture Sensor class

    Args:
        pin(int): number of analog pin/channel the sensor connected.
    ''' 
    def __init__(self, channel):
        self.channel = channel
        self.adc = ADC()

    @property
    def moisture(self):
        '''  
        Get the moisture strength value/voltage
        Returns:
            (int): voltage, in mV
        '''
        value = self.adc.read_voltage(self.channel)
        return value 

Grove = GroveMoistureSensor
Potato =Plant(300,700)

def moisture_level(m,plant):
    if 0 <= m and m <plant.minimum_moisture:
        result = 'Dry'
    elif plant.minimum_moisture <= m and m <plant.maximum_moisture:
        result = 'Moist'
    else:
        result = 'Wet'
    return result

def sensor_readings():
    from grove.helper import SlotHelper
   
   # sh = SlotHelper(SlotHelper.ADC)
   #pin = sh.argv2pin()
   
    #moisture_sensor_1 = GroveMoistureSensor(0)
    moisture_sensor_2 = GroveMoistureSensor(2)
    dht_sensor = seeed_dht.DHT("11",12)
    print('Detecting moisture...')
    
    
    m2=0
    for x in range(3):
        #m1 = moisture_sensor_1.moisture
        #start_time = time.time()
        m2 = moisture_sensor_2.moisture+m2
        #print("--- %s seconds ---" % (time.time() - start_time))

    m2 = m2/3
    m2=int(m2)

    humi,temp = dht_sensor.read()
    #result1 = moisture_level(m1,Potato)
    result2 = moisture_level(m2,Potato)
    #print('Moisture value 1: {0}, {1} '.format(m1, result1))
    print('Moisture value 2: {0},{1}'.format(m2, result2))

    if not humi is None:
        print('DHT{0}, humidity {1:.1f}%, temperature {2:.1f}*'.format(dht_sensor.dht_type, humi, temp))
    else:
        print('DHT{0}, humidity & temperature: {1}'.format(dht_sensor.dht_type, temp))
    #data='Sensor 1 Soil Moisture Level is: {0}, {1}. || \n Sensor 2 Soil Moisture Level is {2} {3}. || \nHumidity {4:.1f}%, temperature {5:.1f}*. '.format(m1, result1,m2,result2, humi, temp)
    data = (m2,humi,temp)
    print(type(data))
    return {'m2':m2,'humidity':humi,'temp':temp}

sensor_readings()

