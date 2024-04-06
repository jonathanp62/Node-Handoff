/**
 * (#)communications-handler.mjs    0.2.0   04/06/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 *
 * @author    Jonathan Parker
 * @version   0.2.0
 * @since     0.2.0
 *
 * MIT License
 *
 * Copyright (c) 2024 Jonathan M. Parker
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Config } from "../config.mjs";
import { io } from "socket.io-client";

/**
 * The communications handler class.
 */
class CommunicationsHandler {
    /**
     * The constructor.
     *
     * @param debug
     */
    constructor(debug) {
        this._debug = debug;
    }

    /**
     * Return a promise with a boolean type that
     * states whether the daemon process is running.
     *
     * @param subject
     * @return Promise<Boolean>
     */
    isDaemonAlive(subject) {
        return new Promise(resolve => {
            const url = Config.daemon.protocol + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this._debug;

            if (isDebug)
                console.log(`[CommunicationsHandler] [isDaemonAlive] Attempting to connect to ${url}`);

            this.checkConnectionToDaemon(url)
                .then(function () {
                    subject.notify();
                    resolve(true);
                }, function (reason) {
                    if (isDebug)
                        console.log(`[CommunicationsHandler] [isDaemonAlive] Checking connection to daemon: ${reason}`);

                    subject.notify();
                    resolve(false);
                });
        });
    }

    /**
     * Return a promise based on the check of
     * socket IO's ability to connect to the
     * daemon.
     *
     * @param url
     * @param timeout
     * @returns {Promise<unknown>}
     */
    checkConnectionToDaemon(url, timeout) {
        const isDebug = this._debug;

        return new Promise(function(resolve, reject) {
            var errorAlreadyOccurred = false;

            timeout = timeout || Config.daemon.timeout;

            const socket = io(url, {reconnection: true, timeout: timeout, transports: ["websocket"]});

            // Connection handler

            socket.on("connect", () => {
                if (isDebug)
                    console.log("[CommunicationsHandler] [checkConnectionToDaemon] Connected OK");

                clearTimeout(timer);
                socket.close();
                resolve();
            });

            // Disconnection handler

            socket.on("disconnect", (reason, details) => {
                if (timer) {
                    clearTimeout(timer);

                    timer = null;
                }

                if (isDebug)
                    console.log(`[CommunicationsHandler] [checkConnectionToDaemon] Disconnected OK: ${reason}`);
            });

            // Error handlers

            socket.on("connect_error", error);
            socket.on("connect_timeout", error);
            socket.on("error", error);

            // Set our own timeout in case the socket ends some other way than what we are listening for

            var timer = setTimeout(function() {
                timer = null;

                error("Local timeout");
            }, timeout);

            // Common error handler

            function error(data) {
                if (timer) {
                    clearTimeout(timer);

                    timer = null;
                }

                if (!errorAlreadyOccurred) {
                    errorAlreadyOccurred = true;

                    socket.close();
                    reject(data);
                }
            }
        });
    }
}

export { CommunicationsHandler };