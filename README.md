# FF6weaponTracker
Tools and scripts to track and modify weapon data in Final Fantasy 6

# Scripts
**In **scripts/path.txt**, write the path for your rom.**

## trackWpnAnim
Display weapon animation data of a weapon.
- Usage: ```trackWpnAnim.js [decimal weapon index] [flags: hwrla]```
- Example: ```node ./scripts/trackWpnAnim.js 12 hwr```:
```
======================================================
[SWORD]Rune Edge - 12 ($C)
======================================================
--[ Weapon Animation Data ($ECE470) ]--
Right hand animation index: $2B
Left hand animation index: $2B
Attack animation index: $1
...
```

## trackAnim
Display graphics data of an animation.
- Usage: ```trackWpnAnim.js [hexadecimal animation index]```
- example: ```node ./scripts/trackAnim.js 2a```
```
======================================================
--[ Animation $2A graphics data ($D4D0FC) ]--
Animation script: Pointer address: $D1EB2C --> Data address: $D07D90
Graphics format: 3bpp
Number of frames: 4
Tile formation index: $21 (Address: $D20840)
First frame index: $DB (Pointer Address: $D4E0F2 --> Data address: $D10587)
Frame width: 3
Frame height: 3
```

## trackAnimScript
Display which animations use certain animation script.
- Usage: ```trackAnimScript [animation script address]```
- Example: ```node ./scripts/trackAnimScript d07f57```:
```
Animation $2D has it
Animation $2E has it
Animation $5D has it
Animation $60 has it
4 matches found
```

## trackTileForm
Display which animations use certain tile formation index.
- Usage: ```trackTileForm [hexadecimal tile formation index]```

## trackFrameId
Display which animations use certain frame index as their first frame.
- Usage: ```trackFrameId [hexadecimal frame data index]```
