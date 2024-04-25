const { AnimationHandler } = require("../animHandler.js");
const { ItemHandler } = require("../itemHandler.js");
const { hexLog, readLE } = require("../hex-utils");
const fs = require('fs');

const romPath = fs.readFileSync(__dirname + '/path.txt').toString()

const animationHandler = new AnimationHandler(romPath)

const request = parseInt("0x" + `${process.argv[2]}`, 16)

let count = 0
for(let i = 0; i < 650; i++) {
    if (animationHandler.ripAnimationData(i).frameDataId === request) {
        hexLog('Animation $'+i + ' has it')
        count += 1
    }
}
if (count === 0) {
    hexLog(`No match found for $${request}`)
} else { hexLog (`${count} matches found`)}