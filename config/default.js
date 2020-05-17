module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"",
    "Password":"",
    "Port":5432,
    "Host":"",
    "Database":""
  },

  "Redis":
  {
    "mode":"sentinel",//instance, cluster, sentinel
    "ip": "",
    "port": 6389,
    "user": "",
    "db": 2,
    "password": "",
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }

  },


  "Security":
  {

    "ip" : "",
    "port": 6389,
    "user": "",
    "password": "",
    "mode":"sentinel",//instance, cluster, sentinel
    "sentinels":{
      "hosts": "",
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
    "crm": "false"
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
    "accessToken": "",
    "crmIntegrationHost": "",
    "crmIntegrationPort": "8831",
    "crmIntegrationVersion": "1.0.0.0",
    "dynamicPort" : false
  },

  "PERSISTENCY":
  {
    "inbox_mode":false
  },
  "Mongo":{
    ip: "",
    port: "",
    dbname: "",
    password: "",
    user: "",
    type: "mongodb+srv",
  },
  "ID":"7",
  "SENDER":"",
  "Token":""
};
