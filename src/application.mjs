/**
 * (#)application.mjs   0.2.0   04/05/2024
 * (#)application.mjs   0.1.0   04/03/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 * 
 * @author    Jonathan Parker
 * @version   0.2.0
 * @since     0.1.0
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

import { argv } from "node:process";
import { Config } from "../config.mjs";
import { io } from "socket.io-client";
import { Subject } from 'await-notify';

import pkg from '../package.json' assert {type: 'json'};

/**
 * The application class.
 */
class Application {
    debug = Config.debug;

    /**
     * The run method.
     */
    run() {
        this.handleCommandLineArguments();
    }

    /**
     * The command line arguments handler.
     */
    handleCommandLineArguments() {
        if (argv.length > 2) {
            const args = argv.slice(2); // Slice of the node program and Javascript file

            if (this.debug)
                console.log(`handleCommandLineArguments: There are ${args.length} command line argument(s)`);

            for (const arg of args) {
                if (this.debug)
                    console.log(`handleCommandLineArguments: ${arg}`)

                const argAsString = arg.toString();

                if (argAsString.startsWith("--")) {
                    this.handleCommandLineOption(argAsString);

                    if (argAsString === "--debug" || argAsString === "--no-debug") {
                        // @todo Keep going with command line arguments

                        console.log(`handleCommandLineArguments: debug: ${this.debug}`);
                    }
                }
            }
        }
    }

    /**
     * A command line option handler.
     *
     * @param option
     */
    handleCommandLineOption(option) {
        if (this.debug)
            console.log(`handleCommandLineOption: Handling option ${option}`);

        switch(option) {
            case "--debug":
                this.debug = true;
                break;
            case "--no-debug":
                this.debug = false;
                break;
            case "--restart":
                this.handleRestart();
                break;
            case "--start":
                this.handleStart();
                break;
            case "--status":
                this.handleStatus();
                break;
            case "--stop":
                this.handleStop();
                break;
            case "--version":
                this.handleVersion();
                break;
            default:
                this.handleUnrecognized(option);
        }
    }

    /**
     * The restart option handler.
     */
    handleRestart() {
        const subject = new Subject();

        (async () => {
            this.isDaemonAlive(subject).then(isAlive => {
                if (isAlive)
                    console.log("Handoff daemon can be restarted");
                else
                    console.log("Handoff daemon is not running");
            });

            await subject.wait();
        }) ();
    }

    /**
     * The start option handler.
     */
    handleStart() {
        const subject = new Subject();

        (async () => {
            this.isDaemonAlive(subject).then(isAlive => {
                if (isAlive)
                    console.log("Handoff daemon is already running");
                else
                    console.log("Handoff daemon can be started");
            });

            await subject.wait();
        }) ();
    }

    /**
     * The status option handler.
     */
    handleStatus() {
        const subject = new Subject();

        (async () => {
            this.isDaemonAlive(subject).then(isAlive => {
                if (isAlive)
                    console.log("Handoff daemon is running");
                else
                    console.log("Handoff daemon is not running");
            });

            await subject.wait();
        }) ();
    }

    /**
     * The stop option handler.
     */
    handleStop() {
        const subject = new Subject();

        (async () => {
            this.isDaemonAlive(subject).then(isAlive => {
                if (isAlive)
                    console.log("Handoff daemon can be stopped");
                else
                    console.log("Handoff daemon is not running");
            });

            await subject.wait();
        }) ();
    }

    /**
     * The version option handler.
     */
    handleVersion() {
        const subject = new Subject();
        const applicationName = pkg.name[0].toUpperCase() + pkg.name.substring(1);

        (async () => {
            console.log(`${applicationName} version ${pkg.version} (${pkg.author})`)

            this.isDaemonAlive(subject).then(isAlive => {
                if (isAlive)
                    console.log("Handoff daemon version goes here");
            });

            await subject.wait();
        }) ();
    }

    /**
     * The unrecognized option handler.
     */
    handleUnrecognized(option) {
        console.log(`Option '${option}' is not a recognized command line option`);
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
            const url = 'http://' + Config.daemon.host + ':' + Config.daemon.port;
            const isDebug = this.debug;

            if (isDebug)
                console.log(`isDaemonAlive: Attempting to connect to ${url}`);

            this.checkConnectionToDaemon(url)
                .then(function () {
                    subject.notify();
                    resolve(true);
                }, function (reason) {
                    if (isDebug)
                        console.log(`isDaemonAlive: Checking connection to daemon: ${reason}`);

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
        const isDebug = Config.debug;

        return new Promise(function(resolve, reject) {
            var errorAlreadyOccurred = false;

            timeout = timeout || Config.daemon.timeout;

            const socket = io(url, {reconnection: true, timeout: timeout, transports: ["websocket"]});

            // Connection handler

            socket.on("connect", () => {
                if (isDebug)
                    console.log("checkConnectionToDaemon: Connected OK");

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
                    console.log(`checkConnectionToDaemon: Disconnected OK: ${reason}`);
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

export { Application };