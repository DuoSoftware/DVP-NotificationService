module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"duo",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"104.236.231.11",
    "Database":"duo"
  },

  "Redis":
  {
    "mode":"sentinel",//instance, cluster, sentinel
    "ip": "45.55.142.207",
    "port": 6389,
    "user": "duo",
    "db": 2,
    "password": "DuoS123",
    "sentinels":{
      "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
      "port":16389,
      "name":"redis-cluster"
    }

  },


  "Security":
  {

    "ip" : "45.55.142.207",
    "port": 6389,
    "user": "duo",
    "password": "DuoS123",
    "mode":"instance",//instance, cluster, sentinel
    "sentinels":{
      "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
      "port":16389,
      "name":"redis-cluster"
    }
  },

  "Host":
  {
    "domain": "127.0.0.1",
    "port": 8089,
    "version":"1.0.0.0",
    "hostpath":"./config",
    "logfilepath": "",
    "crm": "true"
  },
  "Socket":
  {
    "port":"8001"
  },
  "TTL":
  {
    "ttl":"1000"
  },

  "Services": {
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiMTdmZTE4M2QtM2QyNC00NjQwLTg1NTgtNWFkNGQ5YzVlMzE1Iiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE4OTMzMDI3NTMsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NjEyOTkxNTN9.YiocvxO_cVDzH5r67-ulcDdBkjjJJDir2AeSe3jGYeA",
    "crmIntegrationHost": "crmintegrations.app.veery.cloud",
    "crmIntegrationPort": "8831",
    "crmIntegrationVersion": "1.0.0.0"
  },

  "PERSISTENCY":
  {
    "inbox_mode":false
  },
  "Mongo":
  {
    "ip":"104.236.231.11",
    "port":"27017",
    "dbname":"dvpdb",
    "password":"DuoS123",
    "user":"duo"
  },
  "ID":"7",
  "SENDER":"AIzaSyC8baq_3YpwcOQt6wj4VNcOzC0VGc0jKlc",
  "Token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo"
};
