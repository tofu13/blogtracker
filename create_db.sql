CREATE TABLE topic (name text not null primary key)
CREATE TABLE "track" (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	date TEXT NOT NULL,
	"text" TEXT NOT NULL,
	topic text NOT NULL
)
