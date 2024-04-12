/**
 * (#)communications-handler.mjs    0.3.0   04/06/2024
 * (#)communications-handler.mjs    0.2.0   04/06/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 *
 * @author    Jonathan Parker
 * @version   0.3.0
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
    socketEventConnect = "connect";
    socketEventConnectError = "connect_error";
    socketEventConnectTimeout = "connect_timeout";
    socketEventDisconnect = "disconnect";
    socketEventError = "error";
    socketEventStop = "STOP";
    socketEventVersion = "VERSION";

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

            this.checkConnectionToDaemon(url, Config.daemon.timeout)
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

    getDaemonVersion(subject) {
        return new Promise(resolve => {
            const url = Config.daemon.protocol + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this._debug;

            if (isDebug)
                console.log(`[CommunicationsHandler] [getDaemonVersion] Attempting to connect to ${url}`);

            this.sendEventToDaemon(url, this.socketEventVersion, "", Config.daemon.timeout)
                .then(response => {
                    subject.notify();
                    resolve(response);
                }, function (reason) {
                    if (isDebug)
                        console.log(`[CommunicationsHandler] [getDaemonVersion] Getting version from daemon: ${reason}`);

                    subject.notify();
                    resolve(reason);
                });
        });
    }

    stopDaemon(subject) {
        return new Promise(resolve => {
            const url = Config.daemon.protocol + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this._debug;

            if (isDebug)
                console.log(`[CommunicationsHandler] [stopDaemon] Attempting to connect to ${url}`);

            this.sendEventToDaemon(url, this.socketEventStop, "", Config.daemon.timeout)
                .then(response => {
                    subject.notify();
                    resolve(response);
                }, function (reason) {
                    if (isDebug)
                        console.log(`[CommunicationsHandler] [stopDaemon] Stopping daemon: ${reason}`);

                    subject.notify();
                    resolve(reason);
                });
        });
    }

    /**
     *
     * Return a promise based on sending
     * an event with data to the daemon.
     *
     * @param url
     * @param event
     * @param data
     * @param timeout
     * @return {Promise<unknown>}
     */
    sendEventToDaemon(url, event, data, timeout) {
        const isDebug = this._debug;
        const connectEvent = this.socketEventConnect;
        const connectErrorEvent = this.socketEventConnectError;
        const connectTimeoutEvent = this.socketEventConnectTimeout;
        const disconnectEvent = this.socketEventDisconnect;
        const errorEvent = this.socketEventError;

        return new Promise(function(resolve, reject) {
            let errorAlreadyOccurred = false;

            const socket = io(url, {reconnection: true, timeout: timeout, transports: ["websocket"]});

            // Connection handler

            socket.on(connectEvent, () => {
                if (isDebug)
                    console.log("[CommunicationsHandler] [sendDataToDaemon] Connected OK");

                clearTimeout(timer);
                socket.emit(event, data);
            });

            // Response handler

            socket.on(event, (response) => {
                socket.close();
                resolve(response);
            });

            // Disconnection handler

            socket.on(disconnectEvent, (reason, details) => {
                if (timer) {
                    clearTimeout(timer);

                    timer = null;
                }

                if (isDebug)
                    console.log(`[CommunicationsHandler] [sendDataToDaemon] Disconnected OK: ${reason}`);
            });

            // Error handlers

            socket.on(connectErrorEvent, error);
            socket.on(connectTimeoutEvent, error);
            socket.on(errorEvent, error);

            // Set our own timeout in case the socket ends some other way than what we are listening for

            let timer = setTimeout(function() {
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
        const connectEvent = this.socketEventConnect;
        const connectErrorEvent = this.socketEventConnectError;
        const connectTimeoutEvent = this.socketEventConnectTimeout;
        const disconnectEvent = this.socketEventDisconnect;
        const errorEvent = this.socketEventError;

        return new Promise(function(resolve, reject) {
            let errorAlreadyOccurred = false;

            const socket = io(url, {reconnection: true, timeout: timeout, transports: ["websocket"]});

            // Connection handler

            socket.on(connectEvent, () => {
                if (isDebug)
                    console.log("[CommunicationsHandler] [checkConnectionToDaemon] Connected OK");

                clearTimeout(timer);
                socket.close();
                resolve();
            });

            // Disconnection handler

            socket.on(disconnectEvent, (reason, details) => {
                if (timer) {
                    clearTimeout(timer);

                    timer = null;
                }

                if (isDebug)
                    console.log(`[CommunicationsHandler] [checkConnectionToDaemon] Disconnected OK: ${reason}`);
            });

            // Error handlers

            socket.on(connectErrorEvent, error);
            socket.on(connectTimeoutEvent, error);
            socket.on(errorEvent, error);

            // Set our own timeout in case the socket ends some other way than what we are listening for

            let timer = setTimeout(function() {
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