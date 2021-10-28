const crypto = require('crypto')
const fs = require('fs')
const bib = require('bigint-buffer')

const DT = 0n // BigInt (need to perform arithmetic operations) - 128 bit date time vector counter
const SEED = "4456624456624456".split("").map(x => Number(x)) // 128 bit seed - stretched and trimmed uco
const KEY =  [...SEED].reverse() // 128 bit key - reversed seed

const MAX_FILE_SIZE = Math.pow(10,9)

/**
 * Create (unsafe) aes-128-ecb cipher.
 * 
 * @param {Buffer} buffer data
 * @return {Buffer} cipher as Buffer
 */
function createCipher(buffer) {
    return crypto
        .createCipheriv('aes-128-ecb', Buffer.from(KEY), Buffer.alloc(0))
        .update(buffer)
}

/**
 * Perform XOR of two Buffers.
 * 
 * @param {Buffer} buffer1
 * @param {Buffer} buffer2
 * @return {Buffer} xor of @buffer1 and @buffer2 as 16B Buffer
 */
function xorHexes(buffer1, buffer2) {
    return bib.toBufferBE(bib.toBigIntBE(buffer1) ^ bib.toBigIntBE(buffer2), 16)
}

/**
 * Convert BigInt to 16B buffer.
 * 
 * @param {BigInt} bigInt BigInt that should be transfered to Buffer 
 */
function bigIntToBuffer(bigInt) {
    return bib.toBufferBE(bigInt, 16)
}

/**
 * Exercise n.3
 */
function firstFile() {
    const stream = fs.createWriteStream('F.bin', { flags: 'a' })
    
    let dt = DT
    let V = Buffer.from(SEED)
    
    for (let i = 0; i < MAX_FILE_SIZE/128; i++) {
        let I = createCipher(bigIntToBuffer(dt))
        let R = createCipher(xorHexes(I, V))
    
        stream.write(R, () => {})
        
        dt += 1n
    
        V = createCipher(xorHexes(R, I))
    }
    
    stream.end(() => {
        fs.readFile('F.bin', (err, data) => {
            if (err) throw err
            const digest = crypto.createHash('sha256').update(data).digest('hex')
            // assignment: 5fd36722658f9b44596cfdb09bdec41b808462f476ff119a49c65d424291fb18
            // for my uco 445662: c2ab591a0e7b97e65bf5c9581caa00394737755b451d0c83323abf0001ae18eb
            console.log(`Hash: ${digest}`)
        })
    })
}

/**
 * Exercise n.4
 */
function secondFile() {
    const stream = fs.createWriteStream('F2.bin', { flags: 'a' })

    // JavaScript does not have an option to add seed to RNG Math.random() (unless using third-party, which is forbidden)
    // Crypto is Node.js standard library, which should be enough for our test data (and it is much more time & space efficient then Math.random() as with Math.random() i was running out of heap memory)
    crypto.randomBytes(MAX_FILE_SIZE/8, (err, buf) => {
        if (err) throw err

        stream.write(buf, () => {})
        stream.end()
    })

}

// firstFile()
secondFile()