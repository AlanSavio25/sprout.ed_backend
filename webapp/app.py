import sys
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, '../grove.py/grove/')
from flask import Flask, render_template, jsonify
import client
import grove_moisture_sensor as grove
import photo
import time
from timeloop import Timeloop
from datetime import timedelta
tl = Timeloop()

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/overrides')
def overrides():
    return render_template('overrides.html', sensor_reading="Click to view current sensor readings")

@app.route('/move<direction>')
#update direction to be 23 for (2,3)
def move(direction):
    if (direction == 'forward'):
        message = "Move Motors"
    elif (direction == 'backward'):
        message="Move Motors Backward"
    else:
        message = direction
    client.initClient(message)
    return render_template('overrides.html', sensor_reading="Click to view current sensor readings")

@app.route('/sensors')
def sensor_reading():
    return jsonify(grove.sensor_readings())
#return render_template('overrides.html', sensor_reading=grove.sensor_readings())

#return render_template('overrides.html', sensor_reading="Soil Moisture: 327, Temperature: 22C")

@app.route('/image')
def image():
    photo.clickPhoto()
    time.sleep(1)
    return render_template('image.html')

@tl.job(interval=timedelta(seconds=60))
def sample_job_every_60s():
    print("60s : {}".format(time.ctime()))

if __name__ == '__main__':
    tl.start(block=False)
    # If debug is set to true, another timeloop instance is started for some reason
    app.run(host='0.0.0.0', debug=False)
