import sys
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, '../grove.py/grove/')
from flask import Flask, render_template
import client
import grove_moisture_sensor as grove

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/overrides')
def overrides():
    return render_template('overrides.html', sensor_reading="Please Click Button")

@app.route('/move<direction>')
def move(direction):
    if (direction == 'forward'):
        message = "Move Motors"
    else:
        message="Move Motors Backwards"
    client.initClient(message)
    return render_template('overrides.html', sensor_reading="Please Click Button")

@app.route('/sensors')
def sensor_reading():
    return render_template('overrides.html', sensor_reading=grove.sensor_readings())
    # return render_template('overrides.html', sensor_reading="Soil Moisture: 327, Temperature: 22°C")

if __name__ == '__main__':
#    app.run(debug=True, host='127.0.1.1',port=8080)
    app.run(host='0.0.0.0', debug=True)
#    app.run()
