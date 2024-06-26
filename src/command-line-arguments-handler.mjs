/**
 * (#)command-line-arguments-handler.mjs    0.5.0   04/18/2024
 * (#)command-line-arguments-handler.mjs    0.2.0   04/06/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 *
 * @author    Jonathan Parker
 * @version   0.5.0
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

import { Echo } from "./echo.mjs";

/**
 * The command line arguments handler class.
 */
class CommandLineArgumentsHandler {
    /**
     * The constructor.
     *
     * @param argumentArray
     * @param debug
     */
    constructor(argumentArray, debug) {
        this._argumentArray = argumentArray;
        this._debug = debug;
    }

    /**
     * The handle method.
     */
    handle() {
        for (const argument of this._argumentArray) {
            if (this._debug)
                console.log(`[CommandLineArgumentsHandler] [handle] Handling argument ${argument}`)

            if (argument === 'echo') {
                const args = this._argumentArray.slice(1);  // Slice of the echo argument

                this.handleEcho(args);

                break;
            }
        }
    }

    /**
     * The handle echo method.
     *
     * @param args
     */
    handleEcho(args) {
        new Echo(args, this._debug).handle();
    }
}

export { CommandLineArgumentsHandler };