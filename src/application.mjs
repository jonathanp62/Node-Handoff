/**
 * (#)application.mjs   0.1.0   04/03/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 * 
 * @author    Jonathan Parker
 * @version   0.1.0
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

    handleCommandLineArguments() {
        if (argv.length > 2) {
            const args = argv.slice(2); // Slice of the node program and Javascript file

            if (this.debug)
                console.log(`handleCommandLineArguments: There are ${args.length} command line argument(s)`);

            for (const arg of args) {
                if (this.debug)
                    console.log(`handleCommandLineArguments: ${arg}`)

                const argAsString = arg.toString();

                if (argAsString.startsWith("--"))
                    this.handleCommandLineOption(argAsString);
            }
        }
    }

    handleCommandLineOption(option) {
        /*
         * Supported options:
         *   --start
         *   --status
         *   --stop
         *   --version
         */

        if (this.debug)
            console.log(`handleCommandLineOption: Handling option ${option}`);
    }
}

export { Application };