from sanic import Sanic
from sanic.response import empty, json, redirect
import sqlite3

app = Sanic(__name__)

db = sqlite3.connect("blogtracker.db", isolation_level=None) # None -> autocommit
app.static('/static', './static')


@app.route("/")
async def test(request):
    return redirect("/static/index.html")


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
    cursor.execute("INSERT INTO track(id,date,topic,text) VALUES (NULL,date('now'),?,'')",
               (
                   request.json["topic"],
               ))
    return json(cursor.lastrowid)


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
    cur.execute("SELECT name FROM topic ORDER BY 1")
    return json([record for record in cur.fetchall()])


@app.route("/topics", methods=['POST'])
async def newtopic(request):
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO topic(name) VALUES (?)",
                   (
                       request.json,
                   ))
    except sqlite3.Error as err:
        pass
    return empty()



@app.route("/favicon.ico")
async def favicon(request):
    return empty()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
