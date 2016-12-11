from flask import Flask, render_template, redirect, request, session, flash, jsonify
from time import time
import datetime
from datetime import timedelta
from pg import *

app = Flask('nfl_app', static_url_path = '')

db = DB(dbname='NFL')

@app.route('/')
def route_index():
    return app.send_static_file('index.html');

@app.route('/api/all_teams')
def allTeams():
    res = db.query('select teams.team_name, teams.id as team_id, divisions.division_name, conferences.conference_name from teams, divisions, conferences where teams.division_id = divisions.id and divisions.conference_id = conferences.id order by team_id').dictresult()
    return jsonify(res)

@app.route('/api/div_search/<div_name>')
def division(div_name):
    res = db.query("select teams.team_name, teams.id from teams, divisions where division_name = '%s' and teams.division_id = divisions.id" % div_name).dictresult()
    print res
    return jsonify(res)

app.run(debug=True)
