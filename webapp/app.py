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

@app.route("/addplant")
def addplant():
    return render_template("addplant.html")


@app.route("/removeplant")
def plant():
    return render_template("removeplant.html")


@app.route('/')
def home():
    return render_template('home.html')

def getdata():

    name = request.form['plantname']
    id = request.form['plantid']
    waterdate = request.form['waterdate']

    with open("plant.json") as plantfile:
        plantdata = json.load(plantfile)


    with open('plant.json', 'w') as pfile:
        plantdata['plants'].append({
            'plantname': name,
            'plantid': id,
            'waterdate': waterdate
        })
        json.dump(plantdata, pfile , indent=2)


    with open('plant.json', 'r') as pfile:
        content = pfile.read()

    return render_template("plantdisplay.html", content=content)


@app.route("/removeplant" , methods = ['GET','POST'])

def removeplant():
    removalid = request.form['removeid']


    with open('plant.json', 'r') as pfile:
        content = json.load(pfile)


    for plant in content['plants']:
        if (plant['plantid'] == str(removalid)):
            content['plants'].remove(plant)


    with open('plant.json', 'w') as pfile:
        json.dump(content, pfile , indent=2)

    with open('plant.json', 'r') as pfile:
        content = pfile.read()

    return render_template("plantdisplay.html", content=content)




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
    return

@tl.job(interval=timedelta(seconds=60))
def sample_job_every_60s():
    print("60s : {}".format(time.ctime()))

if __name__ == '__main__':
    tl.start(block=False)
    # If debug is set to true, another timeloop instance is started for some reason
    app.run(host='0.0.0.0', debug=False)
