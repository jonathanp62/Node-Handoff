/**
 * (#)communications-handler.mjs    0.6.0   04/19/2024
 * (#)communications-handler.mjs    0.5.0   04/18/2024
 * (#)communications-handler.mjs    0.4.0   04/13/2024
 * (#)communications-handler.mjs    0.3.0   04/06/2024
 * (#)communications-handler.mjs    0.2.0   04/06/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 *
 * @author    Jonathan Parker
 * @version   0.6.0
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
import { createRequest } from "./utils.mjs";
import { io } from "socket.io-client";
import { SocketEvents } from "./socket-events.mjs";

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

    /**
     * Get the version of the daemon.
     *
     * @param   subject
     * @return  {Promise<unknown>}
     */
    version(subject) {
        return new Promise(resolve => {
            const url = Config.daemon.protocol + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this._debug;

            if (isDebug)
                console.log(`[CommunicationsHandler] [getDaemonVersion] Attempting to connect to ${url}`);

            this.sendEventToDaemon(url, SocketEvents.VERSION, createRequest(SocketEvents.VERSION), Config.daemon.timeout)
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

    /**
     * Echo the request content back to the client.
     *
     * @param   subject
     * @param   args
     * @return  {Promise<unknown>}
     */
    echo(subject, args) {
        return new Promise(resolve => {
            const url = Config.daemon.protocol + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this._debug;

            let content = '';

            for (const arg of args) {
                content += arg + ' '
            }

            if (isDebug) {
                console.log(`[CommunicationsHandler] [echo] Attempting to connect to ${url}`);
                console.log(`[CommunicationsHandler] [echo] Content: ${content}`);
            }

            this.sendEventToDaemon(url, SocketEvents.ECHO, createRequest(SocketEvents.ECHO, content.trim()), Config.daemon.timeout)
                .then(response => {
                    subject.notify();
                    resolve(response);
                }, function (reason) {
                    if (isDebug)
                        console.log(`[CommunicationsHandler] [echo] Echoing request content: ${reason}`);

                    subject.notify();
                    resolve(reason);
                });
        });
    }

    /**
     * Stop the daemon.
     *
     * @param   subject
     * @return  {Promise<unknown>}
     */
    stop(subject) {
        return new Promise(resolve => {
            const url = Config.daemon.protocol + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this._debug;

            if (isDebug)
                console.log(`[CommunicationsHandler] [stopDaemon] Attempting to connect to ${url}`);

            this.sendEventToDaemon(url, SocketEvents.STOP, createRequest(SocketEvents.STOP), Config.daemon.timeout)
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
     * Return a promise based on sending
     * an event with data to the daemon.
     *
     * @param   url
     * @param   event
     * @param   data
     * @param   timeout
     * @return  {Promise<unknown>}
     */
    sendEventToDaemon(url, event, data, timeout) {
        return this.communicate(url, event, data, timeout, this._debug);
    }

    /**
     * Return a promise based on the check of
     * socket IO's ability to connect to the
     * daemon.
     *
     * @param   url
     * @param   timeout
     * @returns {Promise<unknown>}
     */
    checkConnectionToDaemon(url, timeout) {
        return this.communicate(url, null, null, timeout, this._debug);
    }

    /**
     * Return a promise based on sending
     * an event with data to the daemon.
     *
     * @param   url
     * @param   event
     * @param   data
     * @param   timeout
     * @param   debug
     * @return  {Promise<unknown>}
     */
    communicate(url, event, data, timeout, debug) {
        return new Promise(function(resolve, reject) {
            let errorAlreadyOccurred = false;

            const socket = io(url, {reconnection: true, timeout: timeout, transports: ["websocket"]});

            // Connection handler

            socket.on(SocketEvents.CONNECT, () => {
                if (debug)
                    console.log("[CommunicationsHandler] [communicate] Connected OK");

                clearTimeout(timer);

                if (event == null) {
                    socket.close();
                    resolve();
                } else {
                    socket.emit(event, data);
                }
            });

            // Response handler for non-connection events

            if (event != null) {
                socket.on(event, (response) => {
                    socket.close();
                    resolve(response);
                });
            }

            // Disconnection handler

            socket.on(SocketEvents.DISCONNECT, (reason, details) => {
                if (timer) {
                    clearTimeout(timer);

                    timer = null;
                }

                if (debug) {
                    if (details !== undefined)
                        console.log(`[CommunicationsHandler] [communicate] Disconnected OK: ${reason}: ${details}`);
                    else
                        console.log(`[CommunicationsHandler] [communicate] Disconnected OK: ${reason}`);
                }
            });

            // Error handlers

            socket.on(SocketEvents.CONNECT_ERROR, error);
            socket.on(SocketEvents.CONNECT_TIMEOUT, error);
            socket.on(SocketEvents.ERROR, error);

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