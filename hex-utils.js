function readLE(buffer) {
    let sum = 0;
    for (let i = buffer.byteLength - 1; i >= 0; i--) {
        sum = (sum << 8) + buffer[i]
    }
    return sum
}

function toHex(msg) {
    const hexExp = new RegExp('(\\$)?\\bb?[0-9]+\\b', 'g')
    msg = msg.replace(hexExp, function(newStr) {
        if(newStr[0] === '$') {
            newStr = newStr.slice(1)
            return '\x1b[1;95m' + '$' + (+newStr).toString(16).toUpperCase() + '\x1b[0;37m'
        }
        if(newStr[0] === 'b') {
            newStr = newStr.slice(1)
            return '\x1b[1;94m' + '0b' + (+newStr).toString(2).toUpperCase() + '\x1b[0;37m'
        }
        return '\x1b[33m' + newStr + '\x1b[37m'
    })

    msg = msg.replace(new RegExp('#bold', 'g'), '\x1b[1;37m')
    msg = msg.replace(new RegExp('#normal', 'g'), '\x1b[0;37m')

    return(msg);
}

/** Printing function to represent numbers prefixed with $ as hexadecimal*/
function hexLog(msg) {
    console.log(toHex(msg))
}

/**
 * Slices a buffer into an array of items.
 * @param {*} buffer Buffer to be sliced.
 * @param {*} chunkSize Bytes per entry in the table.
 * @param {*} entries Length of the array.
 * @returns 
 */
function splitBuffer(buffer, chunkSize, entries = buffer.length/chunkSize) {
    let array = []
    for (let i = 0; i < entries; i++) {
        let c = i * chunkSize
        array.push(buffer.subarray(c, c + chunkSize))
    }
    return array
}

module.exports = {
    readLE,
    toHex,
    hexLog,
    splitBuffer
}