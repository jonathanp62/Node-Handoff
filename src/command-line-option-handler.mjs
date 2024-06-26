/**
 * (#)command-line-option-handler.mjs   0.2.0   04/06/2024
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

import { Restart } from "./restart.mjs";
import { Start } from "./start.mjs";
import { Status } from "./status.mjs";
import { Stop } from "./stop.mjs";
import { Version } from "./version.mjs";

/**
 * The command line option handler class.
 */
class CommandLineOptionHandler {
    /**
     * The constructor.
     *
     * @param option
     * @param pkg
     * @param debug
     */
    constructor(option, pkg, debug) {
        this._option = option;
        this._pkg = pkg;
        this._debug = debug;
    }

    /**
     * The handle method.
     */
    handle() {
        if (this._debug)
            console.log(`[CommandLineOptionHandler] [handle] Handling option ${this._option}`);

        switch(this._option) {
            case "--debug":
                break;
            case "--no-debug":
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
                this.handleUnrecognized();
        }
    }

    /**
     * The restart option handler.
     */
    handleRestart() {
        new Restart(this._debug).handle();
    }

    /**
     * The start option handler.
     */
    handleStart() {
        new Start(this._debug).handle();
    }

    /**
     * The status option handler.
     */
    handleStatus() {
        new Status(this._debug).handle();
    }

    /**
     * The stop option handler.
     */
    handleStop() {
        new Stop(this._debug).handle();
    }

    /**
     * The version option handler.
     */
    handleVersion() {
        new Version(
            this._pkg.name,
            this._pkg.version,
            this._pkg.author,
            this._debug
        ).handle();
    }

    /**
     * The unrecognized option handler.
     */
    handleUnrecognized() {
        console.log(`Option '${this._option}' is not a recognized command line option`);
    }
}

export { CommandLineOptionHandler };