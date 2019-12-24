const redis = require('redis')

let redis_client = null
let is_redis_key_exists = true
let is_redis_server_on = true
let redis_return_obj = {
    message: "",
    key_found: false,
    server_on: false,
    data: null
}

module.exports = class {
    create_redis_client(key, skip_key_checking = false) {
        try {
            redis_client = redis.createClient({
                host: 'redis-15915.c56.east-us.azure.cloud.redislabs.com',
                no_ready_check: false,
                auth_pass: 'aJ2Yp42kM4GjG188uP65xFudaT3h6CyM',
                port: 15915
            });

            redis_client.on('error', function (err) {
                redis_return_obj.server_on = false
                redis_return_obj.message = "Error"
                redis_return_obj.data = err
            });

            redis_client.on('connect', function (err) {
                redis_return_obj.server_on = true
            });

            if (skip_key_checking) {
                redis_return_obj.key_found = true
            } else {
                redis_client.exists(key, function (err, reply) {
                    if (reply === 1) {
                        redis_return_obj.key_found = true
                    } else {
                        redis_return_obj.key_found = false
                    }
                });
            }

            if (!(is_redis_server_on && is_redis_key_exists)) {
                return false
            } else {
                return true
            }
        } catch (error) {
            redis_return_obj.message = "Exception"
            redis_return_obj.data = error
            
            if (redis_return_obj.server_on) {
                redis_client.end(redis_client.connection_id)
            }

            return false
        }
    }

    get_value(redis_key, on_success, on_error) {
        try {
            if (this.create_redis_client(redis_key)) {
                redis_client.get(redis_key, function (err, reply) {
                    redis_return_obj.data = (!(reply === undefined) && (reply !== "")) ? reply : null
                    redis_return_obj.message = (!(reply === undefined) && (reply !== "")) ? "Data was retrieved from Redis Cache Server" : "Result not found"

                    on_success(redis_return_obj)
                    redis_client.quit()
                })
            } else {
                on_error(redis_return_obj)

                if (redis_return_obj.server_on) {
                    redis_client.end(redis_client.connection_id)
                }
            }
        } catch (error) {
            redis_return_obj.data = null
            redis_return_obj.message = error

            on_error(redis_return_obj)

            if (redis_return_obj.server_on) {
                redis_client.end(redis_client.connection_id)
            }
        }
    }

    set_value(redis_key, obj, on_success, on_error) {
        try {
            if (this.create_redis_client(redis_key, true)) {
                var str_obj = JSON.stringify(obj)
                redis_client.set(redis_key, str_obj, function (err, reply) {
                    if (reply === "OK") {
                        redis_return_obj.message = "Data was successfully set to key '" + redis_key + "' as the server sent '" + reply + "'"
                        redis_return_obj.data = str_obj

                        on_success(redis_return_obj)
                        redis_client.quit()
                    } else {
                        throw err
                    }
                })
            } else {
                on_error(redis_return_obj)

                if (redis_return_obj.server_on) {
                    redis_client.end(redis_client.connection_id)
                }
            }
        } catch (error) {
            redis_return_obj.data = null
            redis_return_obj.message = error

            on_error(redis_return_obj)

            if (redis_return_obj.server_on) {
                redis_client.end(redis_client.connection_id)
            }
        }
    }
}