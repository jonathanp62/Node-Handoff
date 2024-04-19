/**
 * (#)stop.mjs  0.6.0   04/19/2024
 * (#)stop.mjs  0.4.0   04/13/2024
 * (#)stop.mjs  0.3.0   04/06/2024
 * (#)stop.mjs  0.2.0   04/06/2024
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
import { logResponseJson } from "./utils.mjs";
import { Subject } from 'await-notify';

/**
 * The stop class.
 */
class Stop {
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
        const isAliveSubject = new Subject();

        (async () => {
            const handler = new CommunicationsHandler(this._debug);

            handler.isDaemonAlive(isAliveSubject).then(isAlive => {
                if (isAlive) {
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
                        })

                        await stopSubject.wait();
                    }) ();
                }
                else
                    console.log("Handoff daemon is not running");
            });

            await isAliveSubject.wait();
        }) ();
    }
}

export { Stop };