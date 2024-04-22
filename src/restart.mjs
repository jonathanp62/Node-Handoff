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
                    console.log(`${respObj.content.message}: ${respObj.content.pid}`);
                else
                    console.log(`'${respObj.code}' returned from server`);

                checkForDaemonProcessAndStart(respObj.content.pid, this._debug);
            });

            await stopSubject.wait();
        }) ();
    }
}

/**
 * This functions checks for and wait for the daemon process
 * to terminate in the OS and then starts it up again.
 *
 * @param   pid
 */
function checkForDaemonProcessAndStart(pid, debug) {
    spawnCheckPidProcess(new Subject(), pid, debug).then(isOK => {
        if (isOK) {
            if (debug) {
                console.log('[Restart] [checkForDaemonProcess] Done waiting on old daemon');
                console.log('[Restart] [checkForDaemonProcess] Restarting new daemon...');
            }

            start();
        } else {
            if (debug)
                console.log('[Restart] [checkForDaemonProcess] Waiting on daemon...');

            setTimeout(function () {
                checkForDaemonProcessAndStart(pid, debug);
            }, 300); /* Reruns this method every 300 milliseconds */
        }
    });
}

/**
 * The function that spawns the check daemon PID and returns a promise.
 *
 * @param   subject
 * @param   pid
 * @param   debug
 * @return  {Promise<unknown>}
 */
function spawnCheckPidProcess (subject, pid, debug) {
    return new Promise(resolve => {
        const checkPid = spawn(Config.daemon.checkPid, [pid]);

        checkPid.stdout.on('data', (data) => {
            console.log(`Script check-pid.sh stdout:\n${data}`);
        });

        checkPid.stderr.on("data", (data) => {
            console.log(`Script check-pid.sh stderr: ${data}`);
        });

        checkPid.on('exit', code => {
            if (debug)
                console.log(`[Restart] [checkForDaemonProcess] Script check-pid.sh process ended with ${code}`);

            subject.notify();

            if (code === 0)
                resolve(true);
            else
                resolve(false);
        });
    });
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