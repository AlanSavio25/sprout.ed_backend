from flask import Flask, render_template
import client

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stats')
def stats():
    return render_template('stats.html')

@app.route('/hello/<name>')
def hello(name):
    client.initClient()
    return render_template('page.html', name=name)

if __name__ == '__main__':
#    app.run(debug=True, host='127.0.1.1',port=8080)
    app.run(host='0.0.0.0', debug=True)
#    app.run()
