const redis = require('redis')

let redis_client = null
let is_redis_key_exists = true
let is_redis_server_on = true

module.exports = class {
    create_redis_client() {
        redis_client = redis.createClient({
            host: 'redis-15915.c56.east-us.azure.cloud.redislabs.com',
            no_ready_check: true,
            auth_pass: 'aJ2Yp42kM4GjG188uP65xFudaT3h6CyM',
            port: 15915
        });

        redis_client.on('error', function (err) {
            is_redis_server_on = false
            console.warn('Server is not on: ' + err)
        });
    }

    get_key_json_value(redis_key, on_success, on_error) {
        try {
            this.create_redis_client()

            redis_client.exists(redis_key, function (err, reply) {
                if (reply === 1) {
                    is_redis_key_exists = true
                } else {
                    is_redis_key_exists = false
                }
            });

            if (is_redis_server_on && is_redis_key_exists) {
                redis_client.get(redis_key, function (err, reply) {
                    if (!(reply === undefined) && (reply !== "")) {
                        on_success(reply)
                        return
                    } else {
                        on_success(null)
                    }
                })
            } else {
                on_success(null)
            }
        } catch (error) {
            on_error(error)
        }
    }

    set_key_json_value(redis_key, obj, on_success, on_error) {
        try {
            if (obj === null) {
                on_error("'obj' can not be null")
            }

            this.create_redis_client()

            if (is_redis_server_on) {
                redis_client.set(redis_key, JSON.stringify(obj), function (err, reply) {
                    if (reply === "OK") {
                        on_success(reply)
                    }

                    console.log("Redis 'set' operation message for '" + redis_key + "': " + reply)
                })
            }
        } catch (error) {
            on_error(error)
        }
    }
}