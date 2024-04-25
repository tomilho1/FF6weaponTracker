const fs = require('fs');

const fontTable = require('./fontTable/fontTable.json')

const { readLE, splitBuffer } = require('./hex-utils')

class ItemHandler {
    constructor(
        romPath = __dirname + '/ff3.smc',

        pointers = require('./pointers/vanilla.json')
    ) {
        this.ROM = fs.readFileSync(romPath);

        this.ptr_itemData = parseInt(pointers.ptr_itemData, 16)
        this.ptr_itemNames = parseInt(pointers.ptr_itemNames, 16)
        this.ptr_descPointers = parseInt(pointers.ptr_descPointers, 16)
        this.ptr_throwData = parseInt(pointers.ptr_throwData + 1, 16) // + 1 to ignore the first byte, which represents empty hands
                                                                      // That way, byte 00 represents item 00, and so on
        this.ptr_wpnAnimData = parseInt(pointers.ptr_wpnAnimData, 16)

        this.itemData = this.ROM.subarray(this.ptr_itemData, this.ptr_itemData + 256 * 30)
        this.nameData = this.ROM.subarray(this.ptr_itemNames, this.ptr_itemNames + 256 * 13)
        this.descPointers = this.ROM.subarray(this.ptr_descPointers, this.ptr_descPointers + 256 * 2)
        this.throwData = this.ROM.subarray(this.ptr_throwData, this.ptr_throwData + 256 * 1)
        this.wpnAnimData = this.ROM.subarray(this.ptr_wpnAnimData, this.ptr_wpnAnimData + 256 * 8)
    }

    decodeItemName(itemId, skipIcon = false) {

        const nameDate = this.getTables()[1][itemId] 

        let string = ''

        if (skipIcon) {
            for (let i = 1; i < 13; i++) {
                string += fontTable[nameDate[i]]
            }
        } else {
            for (let i = 0; i < 13; i++) {
                string += fontTable[nameDate[i]]
            }
        }

        return string
    }

    getTables() {
        const itemArray = splitBuffer(this.itemData, 30, 256)
        const nameArray = splitBuffer(this.nameData, 13, 256)
        const descPtrsArray = splitBuffer(this.descPointers, 2, 256)
        const throwArray = splitBuffer(this.throwData, 1, 256)
        const wpnAnimArray = splitBuffer(this.wpnAnimData, 8, 256)

        return [itemArray, nameArray, descPtrsArray, throwArray, wpnAnimArray]
    }

    saveArraysToRom([itemArray, nameArray, descPtrsArray, throwArray, wpnAnimArray], weaponMode) {
        this.itemData = Buffer.concat(itemArray)
        this.nameData = Buffer.concat(nameArray)
        this.descPointers = Buffer.concat(descPtrsArray)
        this.throwData = Buffer.concat(throwArray)

        this.ROM.set(this.itemData, this.ptr_itemData)
        this.ROM.set(this.nameData, this.ptr_itemNames)
        this.ROM.set(this.descPointers, this.ptr_descPointers)
        this.ROM.set(this.throwData, this.ptr_throwData)

        if (weaponMode) {
            this.wpnAnimData = Buffer.concat(wpnAnimArray)
            this.ROM.set(this.wpnAnimData, this.ptr_wpnAnimData)
        }
    }

    /**
     * Extract the data of one item as a JSON
     */
    extractItem(id, itemName = this.decodeItemName(id, true), filePath = `./${itemName}.json`) {
        const itemTables = this.getTables()

        let desiredItem = []
        for (let i = 0; i < itemTables.length; i++) {
            desiredItem.push(itemTables[i][id])
        }

        fs.writeFileSync(filePath, JSON.stringify(desiredItem, null, 1))
    }

    /**
     * Replace one item or more of the ROM via JSON file.
     * @param {*} weaponMode Must be set to true only when injecting an item to an
     * index below 93 (weapon), or else some attack animations will get corrupted.
     */
    injectItem(filePath, id, weaponMode = false) {
        const itemTables = this.getTables()

        let bufferObject = fs.readFileSync(filePath)
        bufferObject = JSON.parse(bufferObject)

        let newItem = []
        bufferObject.forEach(buf => {
            newItem.push(Buffer.from(buf))
        })

        for (let i = 0; i < itemTables.length; i++) {
            itemTables[i][id] = newItem[i]
        }

        this.saveArraysToRom(itemTables, weaponMode)
    }

    /**
     * Copy all item related data of one index to another.
     * @param {*} weaponMode Must be set to true only when dealing with items below
     * index 93 (weapons), or else some attack animations will get corrupted.
     */
    copyItem(copyId, pasteId, weaponMode = false) {
        const itemTables = this.getTables()

        for (let i = 0; i < itemTables.length; i++) {
            itemTables[i][pasteId] = itemTables[i][copyId]
        }

        this.saveArraysToRom(itemTables, weaponMode)
    }

    /**
     * Swap all item related data of two items around.
     * @param {*} weaponMode Must be set to true only when dealing with items below
     * index 93 (weapons), or else some attack animations will get corrupted.
     */
    swapItem(id1, id2, weaponMode = false) {
        const itemTables = this.getTables()

        for (let i = 0; i < itemTables.length; i++) {
            let aux = itemTables[i][id2]

            itemTables[i][id2] = itemTables[i][id1]
            itemTables[i][id1] = aux
        }

        this.saveArraysToRom(itemTables, weaponMode)
    }

    /**
     * @param {*} weaponMode Must be set to true only when dealing with items below
     * index 93 (weapons), or else some attack animations will get corrupted.
     */
    moveItem(fromId, toId, weaponMode = false) {
        const itemTables = this.getTables()

        for (let i = 0; i < itemTables.length; i++) {
            itemTables[i].splice(toId, 0, itemTables[i].splice(fromId, 1)[0])
        }

        this.saveArraysToRom(itemTables, weaponMode)
    }

    saveAs(romPath) {
        fs.writeFileSync(romPath, this.ROM)
    }

    ripWeaponAnimationData(wpnId) {
        wpnId = +wpnId

        let wpnName = this.decodeItemName(wpnId)

        // "Weapon Animation Data" table pointer
        let ptr_wpnAnimData = this.ptr_wpnAnimData + 0xC00000

        // Get "Weapon Animation Data" Table (ECE400)
        let wpnAnimData = this.getTables()[4][wpnId]

        // Rip data from ECE400 ("Weapon Animation Data")
        const R_animIndex = wpnAnimData[0]
        const L_animIndex = wpnAnimData[1]
        const wpn_palette = wpnAnimData[2]
        const attk_animIndex = wpnAnimData[3]
        const attk_palette = wpnAnimData[4]
        const specialAttributes = wpnAnimData[5]
        const sfxId = wpnAnimData[6]
        const eighthByte = wpnAnimData[7]

        return {
            id: wpnId,
            name: wpnName,
            addr_animData: ptr_wpnAnimData + (wpnId + 1) * 8,
            R_animIndex: R_animIndex,
            L_animIndex: L_animIndex,
            attk_animIndex: attk_animIndex,
            wpn_palette: wpn_palette,
            attk_palette: attk_palette,
            attk_animIndex: attk_animIndex,
            specialAttributes: specialAttributes,
            sfxId: sfxId,
            eighthByte: eighthByte
        }
    }
}

module.exports = {ItemHandler}

