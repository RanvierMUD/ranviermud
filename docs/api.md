There is an in-progress Web interface for viewing information about the MUD and building areas in real time.
Currently, the following routes are supported:

```
GET:
  /api/items
  /api/npcs
  /api/players
  /api/rooms
  /api/help
```

Right now, you can whitelist IPs by adding them to a key called `webWhitelist` in ranvier.json.  By default, only the
local host IP is whitelisted.
