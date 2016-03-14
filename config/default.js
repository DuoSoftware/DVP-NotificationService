module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"postgres",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"127.0.0.1",
    "Database":"dvpdb"
  },
  "Redis":
  {
    "ip": "127.0.0.1",
    "port": 6379,
    "db":9

  },

  "Host":
  {
    "domain": "127.0.0.1",
    "port": 8080,
    "version":"6.0",
    "hostpath":"./config",
    "logfilepath": ""
  },
  "Socket":
  {
        "port":"8001"
  },
  "TTL":
  {
    "ttl":"1000"
  },
  "ID":"1"
};