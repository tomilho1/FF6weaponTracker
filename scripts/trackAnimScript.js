const { AnimationHandler } = require("../animHandler.js");
const { ItemHandler } = require("../itemHandler.js");
const { hexLog, readLE } = require("../hex-utils");
const fs = require('fs');

const romPath = fs.readFileSync(__dirname + '/path.txt').toString()

const animationHandler = new AnimationHandler(romPath)

const [a, ptersAnimScripts] = animationHandler.getTables()

const request = parseInt("0x" + `${process.argv[2]}`, 16) - 0xC00000 - 0x100000

let count = 0
for(let i = 0; i < ptersAnimScripts.length; i++) {
    if (readLE(ptersAnimScripts[i]) === request) {
        hexLog('Animation $'+i + ' has it')
        count += 1
    }
}
if (count === 0) {
    hexLog(`No match found for $${request + 0xC0000 + 0x10000}`)
} else { hexLog (`${count} matches found`)}