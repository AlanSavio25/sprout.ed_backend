import sys
from flask import request
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, '../grove.py/grove/')
from flask import Flask, render_template, jsonify, request
import client
import json
import time
from timeloop import Timeloop
from datetime import timedelta
tl = Timeloop()

raspPi = False
if (raspPi):
    import grove_moisture_sensor as grove
    import photo

app = Flask(__name__, static_url_path='/static')
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route("/actions.json")
def actions():
    return render_template('actions.json')

@app.route("/addthis" , methods = ['POST'])
def addtojson():
    name = request.form['plantname']
    plantid = request.form['plantid']
    waterdate = request.form['waterdate']

    with open("plant.json") as plantfile:
        plantdata = json.load(plantfile)


    with open('plant.json', 'w') as pfile:
        plantdata['plants'].append({
            'plantname': name,
            'plantid': plantid,
            'waterdate': waterdate
        })
        json.dump(plantdata, pfile , indent=2)


    with open('plant.json', 'r') as pfile:
        content = pfile.read()

    # add to action log
    action = 'Added plant id ' + plantid
    addToActions(action)

    return render_template("plantdisplay.html", content=content)


@app.route("/removethis" , methods = ['POST'])
def removeFromJson():
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

    # add to action log
    action = 'Removed plant id ' + removalid
    addToActions(action)

    return render_template("plantdisplay.html", content=content)



@app.route("/removeplant")
def plant():
    return render_template("removeplant.html")


@app.route('/')
def home():
    with open('plots.json', 'r', encoding="utf8") as f:
        content = f.read()
    content = content.replace('\n', ' ').replace('\r', '')
    return render_template('home.html', plotsJson = content)
    #return render_template('home.html')

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

@app.route("/addplant")
def addplant():
    return render_template("addplant.html")

@app.route("/getPlots")
def getPlots():
    return "plots.json"

@app.route('/admin')
def admin():
    with open('plots.json', 'r', encoding="utf8") as f:
        content = f.read()
    content = content.replace('\n', ' ').replace('\r', '')
    with open('plantdb.json', 'r') as f:
        content2 = f.read()
    content2 = content2.replace('\n', ' ').replace('\r', '')
    return render_template('admin.html', plotsJson = content, dbJSON = content2)

@app.route('/overrides')
def overrides():
    return render_template('overrides.html', sensor_reading="Click to view current sensor readings")

@app.route('/move')
#update direction to be 23 for (2,3)
def move():
    if (request.args.get('direction', default = 'none', type = str) == 'forward'):
        message = "f"
    elif (request.args.get('direction', default = 'forward', type = str) == 'backward'):
        message="b"
    else:
        message = request.args.get('x', default = '1', type= str) +','+ request.args.get('y', default = '1', type = str)
    print("Message is: " + message)
    client.initClient(message)

    # add to action log
    action = 'Moved to position ' + message
    addToActions(action)

    return render_template('overrides.html', sensor_reading="Click to view current sensor readings")

@app.route('/waterornot')
def water_the_plant():
    #this method is called by the ev3 when the arm is in the soil
    result = grove.sensor_readings()
    print(result)
    print(type(result))
    moisture = result['m2']
    print("Moisture for EV3 is:" + str(moisture))
    return str(moisture<600)


@app.route('/gridReact')
def gridding():
    with open('plots.json', 'r', encoding="utf8") as f:
        content = f.read()
    content = content.replace('\n', ' ').replace('\r', '')
    return render_template('grid2.html', plotsJson = content)


@app.route('/sensors')
def sensor_reading():
    if (raspPi):
        return jsonify(grove.sensor_readings())
    return ""


@app.route('/image')
def image():
    photo.clickPhoto()
    time.sleep(1)
    return

@tl.job(interval=timedelta(seconds=60))
def sample_job_every_60s():
    print("60s : {}".format(time.ctime()))


def addToActions(action):
     # add to action log
    with open("./templates/actions.json") as actions_file:
        actions_data = json.load(actions_file)

    with open('./templates/actions.json', 'w') as actions_file:
        actions_data['actions'].insert(0,{
            'timestamp': time.asctime(),
            'action' : action
        })
        json.dump(actions_data, actions_file , indent=2)


if __name__ == '__main__':
    tl.start(block=False)
    # If debug is set to true, another timeloop instance is started for some reason
    app.run(host='0.0.0.0', debug=False)
