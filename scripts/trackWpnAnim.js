const { AnimationHandler } = require("../animHandler.js");
const { ItemHandler } = require("../itemHandler.js");
const { hexLog } = require("../hex-utils");
const fs = require('fs');

const romPath = fs.readFileSync(__dirname + '/path.txt').toString()

const itemHandler = new ItemHandler(romPath)
const animationHandler = new AnimationHandler(romPath)

function getAnimString(animId, animName) {
    const currentAnim = animationHandler.ripAnimationData(animId)

    return `--[ ${animName} ($${animId}) graphics data ($${currentAnim.addr_animGraphsData}) ]--
Animation script: Pointer address: $${currentAnim.addr_ptr_animScript} --> Data address: $${currentAnim.addr_animScript}
Graphics format: ${(currentAnim.bppFormat)}
Number of frames: ${(currentAnim.numberOfFrames)}
Tile formation index: $${(currentAnim.tileFormationId)} (Address: $${currentAnim.addr_tileFormation})
First frame index: $${(currentAnim.frameDataId)} (Pointer Address: $${(currentAnim.ptr_addr_frameData)} --> Data address: $${(currentAnim.addr_frameData)})
Frame width: ${(currentAnim.frameWidth)}
Frame height: ${(currentAnim.frameHeight)}\n\n`   
}

if(process.argv.length >= 3) {
    const weapon = itemHandler.ripWeaponAnimationData(process.argv[2])

    let flags = 'hwrla'
    if(process.argv.length >= 4) {
        flags = process.argv[3]
    }
    if (weapon.L_animIndex === weapon.R_animIndex) {
        flags = flags.replaceAll('l', 'x')
    }

    const txt_header =`======================================================
#bold${weapon.name}#normal - ${weapon.id} ($${(weapon.id)})
======================================================\n`

    const txt_wpnData = `--[ Weapon Animation Data ($${(weapon.addr_animData)}) ]--
Right hand animation index: $${(weapon.R_animIndex)}
Left hand animation index: $${(weapon.L_animIndex)}
Attack animation index: $${weapon.attk_animIndex}
Weapon palette index: $${weapon.wpn_palette}
Attack palette index: $${weapon.wpn_palette}
Special attributes: b${weapon.specialAttributes}
Default sound effect: ${(weapon.sfxId)} ($${(weapon.sfxId)})\n\n`

    const txt_R_animData = getAnimString(weapon.R_animIndex, 'Right hand animation')
    const txt_L_animData = getAnimString(weapon.L_animIndex, 'Left hand animation')
    const txt_attk_animData = getAnimString(weapon.attk_animIndex, 'Attack animation')
    
    let msg = ``

    if (flags.includes('h')) { msg += txt_header}
    if (flags.includes('w')) { msg += txt_wpnData}
    if (flags.includes('r')) { msg += txt_R_animData}
    if (flags.includes('l')) { msg += txt_L_animData}
    if (flags.includes('a')) { msg += txt_attk_animData}

    hexLog(msg)
}

if(process.argv.length === 2) {
    for(let i = 0; i < 92; i++) {
        console.log(`${i} - ` + itemHandler.decodeItemName(i))
    }
}

// hexLog(getAnimString(0x160, 'Exploder'))

// animationHandler.copyAnim(0x17, 0x14)
// animationHandler.saveAs(anivanilla)

// hexLog(getAnimString(0x64, 'New target'))