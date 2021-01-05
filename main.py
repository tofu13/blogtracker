from sanic import Sanic
from sanic.response import  empty
from sanic.response import json
from sanic_jinja2 import SanicJinja2
import sqlite3


app = Sanic(__name__)
jinja = SanicJinja2(app)

db = sqlite3.connect("blogtracker.db")
app.static('/static', './static')

@app.route("/")
@jinja.template("index.html")
async def test(request):
    return {"hello": "world"}


@app.route("/load")
async def load(request):
    return json({"data": "Lorem"})


@app.route("/story")
async def story(request):
    topic = request.args.get("topic")
    if topic:
        cursor = db.cursor()
        cursor.execute("SELECT date, text FROM track WHERE topic = ? ORDER BY date", [topic,])
        return json([[record[0], record[1]] for record in cursor.fetchall()])
    else:
        return empty()


@app.route("/save", methods=['POST'])
async def save(request):
    db.execute("INSERT INTO track(id,date,topic,text) VALUES (NULL,?,?,?)",
               (
                   request.json["date"],
                   request.json["topic"],
                   request.json["text"],
               ))
    db.commit()
    return empty()


@app.route("/topics")
async def topics(request):
    cur = db.cursor()
    cur.execute("SELECT DISTINCT topic FROM track ORDER BY 1")
    topics = [record for record in cur.fetchall()]
    return json(topics)

@app.route("/favicon.ico")
async def favicon(request):
    return empty()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)