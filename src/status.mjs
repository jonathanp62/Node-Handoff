/**
 * (#)status.mjs    0.2.0   04/06/2024
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

import { CommunicationsHandler} from "./communications-handler.mjs";
import { Subject } from 'await-notify';

/**
 * The status class.
 */
class Status {
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
                    console.log("Handoff daemon is running");
                else
                    console.log("Handoff daemon is not running");
            });

            await subject.wait();
        }) ();
    }
}

export { Status };