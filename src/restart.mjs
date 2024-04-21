/**
 * (#)restart.mjs   0.6.0   04/19/2024
 * (#)restart.mjs   0.2.0   04/06/2024
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

import { CommunicationsHandler} from "./communications-handler.mjs";
import { Config } from "../config.mjs";
import { logResponseJson } from "./utils.mjs";
import { spawn } from 'child_process';
import { Subject } from 'await-notify';

/**
 * The restart class.
 */
class Restart {
    /**
     * The constructor.
     *
     * @param debug
     */
    constructor(debug) {
        this._debug = debug;
    }

    /**
     * The handle method.
     */
    handle() {
        const subject = new Subject();

        (async () => {
            const handler = new CommunicationsHandler(this._debug);

            handler.isDaemonAlive(subject).then(isAlive => {
                if (isAlive)
                    this.stop();
                else
                    console.log("Handoff daemon is not running");
            });

            await subject.wait();
        }) ();
    }

    /**
     * The stop method.
     */
    stop() {
        const handler = new CommunicationsHandler(this._debug);
        const stopSubject = new Subject();

        (async () => {
            handler.stop(stopSubject).then(response => {
                const respObj = JSON.parse(response);

                if (this._debug)
                    logResponseJson(respObj);

                if (respObj.code === "OK")
                    console.log(respObj.content);
                else
                    console.log(`'${respObj.code}' returned from server`);

                const timeout = Config.daemon.restartTimeoutInSeconds;
                const debug = this._debug;

                if (debug)
                    console.log(`[Restart] [stop] Pausing ${timeout} seconds`);

                const timeoutHandler = function () {
                    if (debug)
                        console.log("[Restart] [stop] Restarting daemon...");

                    start();
                };

                setTimeout(timeoutHandler, timeout * 1000);
            })

            await stopSubject.wait();
        }) ();
    }
}

/**
 * The start function.
 */
const start = function () {
    const process = spawn(Config.daemon.start,
        [],
        {
            detached: true,
            stdio: 'ignore'
        }
    );

    process.on('error', (data) => {
        console.log(`Failed to start Handoff daemon: ${data}`);
    });

    process.unref();

    console.log("Handoff daemon started");
}


export { Restart };