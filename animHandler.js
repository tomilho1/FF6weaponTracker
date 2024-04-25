const fs = require('fs');

const { readLE, splitBuffer } = require('./hex-utils')

class AnimationHandler {
    constructor (
        romPath = __dirname + '/ff3.smc',

        pointers = require('./pointers/vanilla.json')
    ) {
        this.ROM = fs.readFileSync(romPath);

        this.ptr_graphsData = parseInt(pointers.ptr_graphsData, 16)
        this.ptr_ptersAnimScripts = parseInt(pointers.ptr_ptersAnimScripts, 16)

        this.graphsData = this.ROM.subarray(this.ptr_graphsData, this.ptr_graphsData + 650 * 6)
        this.ptersAnimScripts = this.ROM.subarray(this.ptr_ptersAnimScripts, this.ptr_ptersAnimScripts + 650 * 2)
    }

    getTables() {
        const graphsData = splitBuffer(this.graphsData, 6, 650)
        const ptersAnimScripts = splitBuffer(this.ptersAnimScripts, 2, 650)

        return [graphsData, ptersAnimScripts]
    }

    saveArraysToRom([new_graphsData, new_ptersAnimScripts]) {
        this.graphsData = Buffer.concat(new_graphsData)
        this.ptersAnimScripts = Buffer.concat(new_ptersAnimScripts)

        this.ROM.set(this.graphsData, this.ptr_graphsData)
        this.ROM.set(this.ptersAnimScripts, this.ptr_ptersAnimScripts)
    }

    copyAnim(copyId, pasteId) {
        const animTables = this.getTables()

        for (let i = 0; i < animTables.length; i++) {
            animTables[i][pasteId] = animTables[i][copyId]
        }

        this.saveArraysToRom(animTables)
    }

    saveAs(romPath) {
        fs.writeFileSync(romPath, this.ROM)
    }

    ripAnimationData(animId) {
        const [graphsDataTable, ptersAnimScriptsTable] = this.getTables()

        // Get "Attack Graphics Data" Table (D4D000)
        let graphsData = graphsDataTable[animId]

        // Get "Pointers to Battle Animation Scripts" Table (D1EAD8)
        let addr_animScript = readLE(ptersAnimScriptsTable[animId]) + 0xC00000 + 0x100000
    
        let bppFormat = "2bpp"
        if ((graphsData[0] & 0b10000000) === 0) { bppFormat = '3bpp' }
        
        let numberOfFrames = graphsData[0] & 0b00111111
        let tileFormationId = graphsData[1] | ((graphsData[0] & 0b01000000) << 2)

        let frameDataId = readLE(graphsData.subarray(2, 4))
        let ptr_addr_frameData = (frameDataId * 2) + 0xD4DF3C
        let addr_frameData = readLE(this.ROM.subarray(ptr_addr_frameData - 0xC00000, ptr_addr_frameData - 0xC00000 + 2)) + 0xD10000

        let frameWidth = graphsData[4]
        let frameHeight = graphsData[5]

        return {
            index: animId,
            addr_ptr_animScript: 0xD1EAD8 + 2 * animId,
            addr_animScript: addr_animScript,
            addr_animGraphsData: 0xD4D000 + animId * 6,
            bppFormat: bppFormat,
            numberOfFrames: numberOfFrames,
            tileFormationId: tileFormationId,
            addr_tileFormation: tileFormationId * 64 + 0xD20000,
            frameDataId: frameDataId,
            ptr_addr_frameData: ptr_addr_frameData,
            addr_frameData: addr_frameData,
            frameWidth: frameWidth,
            frameHeight: frameHeight,
        }
    }
}

module.exports = {AnimationHandler}

