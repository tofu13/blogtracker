from sanic import Sanic
from sanic.response import  empty
from sanic.response import json
from sanic_jinja2 import SanicJinja2
import sqlite3


app = Sanic(__name__)
jinja = SanicJinja2(app)

db = sqlite3.connect("blogtracker.db", isolation_level=None) # None -> autocommit
app.static('/static', './static')


@app.route("/")
@jinja.template("index.html")
async def test(request):
    return {"hello": "world"}


@app.route("/tracks")
async def story(request):
    topic = request.args.get("topic")
    if topic:
        cursor = db.cursor()
        cursor.execute("SELECT id, date, text FROM track WHERE topic = ? ORDER BY date DESC", [topic,])
        return json(cursor.fetchall())
    else:
        return empty()


@app.route("/tracks", methods=['POST'])
async def save(request):
    cursor = db.cursor()
    cursor.execute("INSERT INTO track(id,date,topic,text) VALUES (NULL,?,?,?)",
               (
                   request.json["date"],
                   request.json["topic"],
                   request.json["text"],
               ))
    return json({"track": cursor.lastrowid})


@app.route("/tracks/<tracknumber:int>", methods=['PUT'])
async def save(request, tracknumber):
    cursor = db.cursor()
    cursor.execute("UPDATE track SET date=?, text=? WHERE id=?",
               (
                   request.json["date"],
                   request.json["text"],
                   tracknumber
               ))
    return empty()


@app.route("/topics")
async def topics(request):
    cur = db.cursor()
    cur.execute("SELECT DISTINCT topic FROM track ORDER BY 1")
    return json([record for record in cur.fetchall()])


@app.route("/favicon.ico")
async def favicon(request):
    return empty()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
