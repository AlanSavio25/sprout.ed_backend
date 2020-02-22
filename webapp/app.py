import sys
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, '../grove.py/grove/')
from flask import Flask, render_template
import client
#import grove_moisture_sensor as grove

import time
from timeloop import Timeloop
from datetime import timedelta
tl = Timeloop()

app = Flask(__name__, static_url_path='/static')
sensor_reading=0

@app.route('/')
def index():
    return render_template('index.html', sensor_reading="Please Click Button")

@app.route('/stats')
def stats():
    return render_template('stats.html')

@app.route('/move<direction>')
def move(direction):
    if (direction == 'forward'):
        message = "Move Motors"
    else:
        message="Move Motors Backwards"
    client.initClient(message)
    return render_template('index.html', sensor_reading="Please Click Button")

@app.route('/sensors')
def sensor_reading():
    return render_template('index.html', sensor_reading=grove.sensor_readings())

@tl.job(interval=timedelta(seconds=2))
def sample_job_every_2s():
    print "2s job current time : {}".format(time.ctime())

if __name__ == '__main__':
    tl.start(block=False)
    # If debug is set to true, another timeloop instance is started for some reason
    app.run(host='0.0.0.0', debug=False)
