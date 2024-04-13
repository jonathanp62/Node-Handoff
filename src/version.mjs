/**
 * (#)version.mjs   0.4.0   04/13/2024
 * (#)version.mjs   0.3.0   04/06/2024
 * (#)version.mjs   0.2.0   04/06/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 *
 * @author    Jonathan Parker
 * @version   0.4.0
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
 * The version class.
 */
class Version {
    /**
     * The constructor.
     *
     * @param debug
     * @param appName
     * @param version
     * @param author
     */
    constructor(appName, version, author, debug) {
        this._appName = appName;
        this._version = version;
        this._author = author;
        this._debug = debug;
    }

    handle() {
        const isAliveSubject = new Subject();
        const applicationName = this._appName[0].toUpperCase() + this._appName.substring(1);

        (async () => {
            console.log(`${applicationName} version ${this._version} (${this._author})`)

            const handler = new CommunicationsHandler(this._debug);

            handler.isDaemonAlive(isAliveSubject).then(isAlive => {
                if (isAlive) {
                    const stopSubject = new Subject();

                    (async () => {
                        handler.getDaemonVersion(stopSubject).then(response => {
                            const respObj = JSON.parse(response);

                            if (this._debug)
                                logResponseJson(respObj);

                            console.log(respObj.content);
                        })

                        await stopSubject.wait();
                    }) ();
                }
            });

            await isAliveSubject.wait();
        }) ();
    }
}

export { Version };