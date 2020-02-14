import sys
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, '../grove.py/grove/')
from flask import Flask, render_template
import client
import grove_moisture_sensor as grove

app = Flask(__name__)
sensor_reading=0

@app.route('/')
def index():
    return render_template('index2.html', sensor_reading="Please Click Button")

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
    return render_template('index2.html', sensor_reading="Please Click Button")

@app.route('/sensors')
def sensor_reading():
    return render_template('index2.html', sensor_reading=grove.sensor_readings())


if __name__ == '__main__':
#    app.run(debug=True, host='127.0.1.1',port=8080)
    app.run(host='0.0.0.0', debug=True)
#    app.run()
