/**
 * (#)utils.mjs 0.5.0   04/18/2024
 * (#)utils.mjs 0.4.0   04/13/2024
 *
 * Copyright (c) Jonathan M. Parker
 * All Rights Reserved.
 *
 * @author    Jonathan Parker
 * @version   0.5.0
 * @since     0.4.0
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

export function createRequest(event, content) {
    if (content === undefined) {
        const data = {
            type: 'Request',
            id: crypto.randomUUID(),
            dateTime: new Date().toISOString(),
            event: event
        };

        return JSON.stringify(data);
    } else {
        const data = {
            type: 'Request',
            id: crypto.randomUUID(),
            dateTime: new Date().toISOString(),
            event: event,
            content: content
        };

        return JSON.stringify(data);
    }
}

export const logResponseJson = (responseJson) => {
    const localDateTime = new Date(responseJson.dateTime);

    console.log(`type      : ${responseJson.type}`)
    console.log(`id        : ${responseJson.id}`)
    console.log(`request id: ${responseJson.requestId}`)
    console.log(`session id: ${responseJson.sessionId}`)
    console.log(`date-time : ${responseJson.dateTime} (${localDateTime})`)
    console.log(`event     : ${responseJson.event}`)
    console.log(`code      : ${responseJson.code}`)
    console.log(`content   : ${responseJson.content}`)
}
