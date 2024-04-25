const { AnimationHandler } = require("../animHandler.js");
const { ItemHandler } = require("../itemHandler.js");
const { hexLog, toHex } = require("../hex-utils");
const fs = require('fs');

const romPath = fs.readFileSync(__dirname + '/path.txt').toString()

const animationHandler = new AnimationHandler(romPath)

function getAnimString(animId, animName) {
    const currentAnim = animationHandler.ripAnimationData(animId)

    return `--[ ${animName} $${animId} graphics data ($${currentAnim.addr_animGraphsData}) ]--
Animation script: Pointer address: $${currentAnim.addr_ptr_animScript} --> Data address: $${currentAnim.addr_animScript}
Graphics format: ${(currentAnim.bppFormat)}
Number of frames: ${(currentAnim.numberOfFrames)}
Tile formation index: $${(currentAnim.tileFormationId)} (Address: $${currentAnim.addr_tileFormation})
First frame index: $${(currentAnim.frameDataId)} (Pointer Address: $${(currentAnim.ptr_addr_frameData)} --> Data address: $${(currentAnim.addr_frameData)})
Frame width: ${(currentAnim.frameWidth)}
Frame height: ${(currentAnim.frameHeight)}\n\n`   
}

if(process.argv.length >= 3) {

    const request = parseInt("0x" + `${process.argv[2]}`, 16)

    const animData = getAnimString(request, `Animation`)

    hexLog('======================================================\n'+animData)
}