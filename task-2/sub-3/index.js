const {
    SHA3
} = require('sha3')

function stringToBuffer(string) {
    return new Buffer(binaryToHex(string).result, 'hex')
}

// 445662 % 256 -> 222 -> de | 11011110
let zeros = ""
for (let i = 0; i < 1592; i++) {
    zeros += "0"
}

const input = zeros + "11011110"
const buf = stringToBuffer(input)

const hash = new SHA3(256)
const keccakMain = hash.myF(buf)

const allChangedBits = []

for (const [i, bit] of input.split("").entries()) {
    const newBit = Number(bit) ^ 1
    const split = input.split("")
    split[i] = newBit
    const newInput = split.join("")
    const buf = stringToBuffer(newInput)
    const hash = new SHA3(256)
    const keccak = hash.myF(buf)
    const bits = changedBits(hexToBinary(keccakMain).result, hexToBinary(keccak).result)
    bits && allChangedBits.push(bits)
    hash.reset()
}

// Loggin out following:
// [
//     779, 804, 770, 788, 799, 789, 811, 779, 787, 791, 770, 797,
//     755, 806, 822, 784, 765, 760, 825, 792, 789, 827, 786, 790,
//     816, 788, 807, 807, 810, 824, 798, 817, 792, 830, 770, 825,
//     755, 808, 793, 797, 800, 823, 814, 805, 799, 731, 802, 798,
//     777, 796, 807, 815, 803, 765, 794, 768, 838, 782, 805, 792,
//     798, 799, 811, 772, 825, 794, 786, 804, 816, 805, 801, 799,
//     798, 800, 810, 813, 777, 800, 805, 784, 807, 804, 816, 784,
//     801, 809, 760, 776, 789, 788, 836, 807, 813, 829, 823, 806,
//     799, 813, 761, 810,
//     ... 1500 more items
//   ]
console.log(allChangedBits)

Array.prototype.max = function() {
    return Math.max.apply(null, this)
  };
  
Array.prototype.min = function() {
    return Math.min.apply(null, this)
};

// Logging output:
// Max: 853
// Min: 731
// Average: 799.3933823529412
console.log('Max:', allChangedBits.max())
console.log('Min:', allChangedBits.min())
console.log('Average:', (allChangedBits.reduce((a, b) => a + b, 0) / allChangedBits.length) || 0)

function changedBits(keccak1, keccak2) {
    let changed = 0;
    for (let i = 0; i < 1600; i++) {
        if (keccak1[i] != keccak2[i]) {
            changed++;
        }
    }

    return changed
}

// STACKOVERFLOW HELPERS:
// converts binary string to a hexadecimal string
// returns an object with key 'valid' to a boolean value, indicating
// if the string is a valid binary string.
// If 'valid' is true, the converted hex string can be obtained by
// the 'result' key of the returned object
function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}

// STACKOVERFLOW HELPERS:
// converts hexadecimal string to a binary string
// returns an object with key 'valid' to a boolean value, indicating
// if the string is a valid hexadecimal string.
// If 'valid' is true, the converted binary string can be obtained by
// the 'result' key of the returned object
function hexToBinary(s) {
    var i, k, part, ret = '';
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    var lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111',
        'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
        'E': '1110', 'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookupTable.hasOwnProperty(s[i])) {
            ret += lookupTable[s[i]];
        } else {
            return { valid: false };
        }
    }
    return { valid: true, result: ret };
}