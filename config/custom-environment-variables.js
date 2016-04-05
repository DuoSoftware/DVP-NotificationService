module.exports = {
    "DB": {
        "Type":"SYS_DATABASE_TYPE",
        "User":"SYS_DATABASE_POSTGRES_USER",
        "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
        "Port":"SYS_SQL_PORT",
        "Host":"SYS_DATABASE_HOST",
        "Database":"SYS_DATABASE_POSTGRES_USER"
    },


    "Redis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "db":"SYS_REDIS_DB"

    },
    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    "Host":
    {
        "domain": "HOST_NAME",
        "port": "HOST_NOTIFICATIONSERVICE_PORT",
        "version": "HOST_VERSION",
        "logfilepath": "LOG4JS_CONFIG"
    },
    "TTL":
    {
        "ttl":"SYS_TTL"
    },
    "ID":"SYS_NS_ID"
};

//NODE_CONFIG_DIR
