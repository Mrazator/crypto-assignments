const path = require('path')
const fs = require('fs').promises
const { exit } = require('process');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const forge = require('node-forge')
const bigInt = require('big-integer')
const { gcd, one } = require('big-integer')
const openpgp = require('openpgp')

/**
 * Checks validity of the signature
 * 
 * @param {Buffer} pem 
 * @param {Buffer} msg 
 * @param {Buffer} signature 
 */
async function isValidSignature(pem, msg, signature) {
  const { n, e } = getPublicKey(pem)
  const m1Hash = calcSignature(signature, n, e)
  const m2Hash = await calcPaddedHash(msg)
  
  return m1Hash == m2Hash
}

/**
 * Get public key from .pem content
 * 
 * @param {Buffer} pem 
 */
function getPublicKey(pem) {
  const { n, e } = forge.pki.publicKeyFromPem(pem.toString())

  return { n: n.toString(), e: e.toString() }
}

/**
 * Calculates signature
 * 
 * @param {Buffer} sign 
 * @param {string} n 
 * @param {string} e 
 */
function calcSignature(sign, n, e) {
  const S = bigInt.fromArray(Array.prototype.slice.call(sign), 256)
  const N = bigInt(n)
  const E = bigInt(e) 

  const res = S.modPow(E, N)

  return res.toString()
}

/**
 * Calculate padded hash
 * 
 * @param {Buffer} msg 
 */
async function calcPaddedHash(msg) {
  const messageUTF8 = Buffer.from(msg, "utf8").toString()
  const digest = forge.md.sha512.create().update(messageUTF8, "utf8").digest().data.valueOf()
  const hashBuff = Buffer.from(digest, 'binary')
  // https://openpgpjs.org/openpgpjs/doc/crypto_hash_index.js.html
  const hash = await openpgp.crypto.pkcs1.emsa.encode(10, new Uint8Array(hashBuff).buffer, 256)

  return bigInt(hash, 16).toString(10)
}

/**
 * Calculate primer factor
 * 
 * @param {string} s 
 * @param {string} hash 
 * @param {string} n 
 */
function calcPrimefactor(s, hash, n) {
  const S = bigInt(s) 
  const M = bigInt(hash)
  const N = bigInt(n)
  const res = gcd(S.minus(M).mod(N), N)

  return res.toString() 
}

/**
 * Calculate private expontent
 * 
 * @param {string} p 
 * @param {string} n 
 * @param {string} e 
 */
function calcPrivateExpontent(p, n, e) {
  const P = bigInt(p)
  const N = bigInt(n)
  const E = bigInt(e)

  const Q = N.divide(P)
  const D = E.modInv((P.minus(one)).multiply(Q.minus(one)))

  return D
}

/**
 * Calculate RSA signature
 * 
 * @param {string} hash 
 * @param {string} p 
 * @param {string} n 
 * @param {string} e 
 */
function calcFinalSignature(hash, p, n, e) {
  const M = bigInt(hash)
  const N = bigInt(n)
  const D = calcPrivateExpontent(p, n, e)

  const signature = M.modPow(D, N)
  return signature
}

/**
 * Write signature to a file, in binary format
 * 
 * @param {string} signature 
 */
async function writeSignatureToFile(signature) {
  await fs.writeFile(
    path.resolve('./good_sig.sha512'),
    Buffer.from(bigInt(signature).toString(16), "hex").toString('binary'),
    { encoding: 'binary', flag: 'w' }
  )
}

(async () => {
  const { argv } = yargs(hideBin(process.argv))
  const [ pemPath, messagePath, badSignaturePath ] = argv['_']
  
  const [ pemBuffer, msgBuffer, badSignBuffer ] = await Promise.all([
    fs.readFile(path.resolve(pemPath)),
    fs.readFile(path.resolve(messagePath)),
    fs.readFile(path.resolve(badSignaturePath))
  ])

  if (await isValidSignature(pemBuffer, msgBuffer, badSignBuffer)) {
    console.log('Correct signature')

    exit(0)
  }

  const { n, e } = getPublicKey(pemBuffer)
  console.log(`0x${bigInt(n).toString(16)}`)

  const faultySignature = calcSignature(badSignBuffer, n, e)
  console.log(`0x${bigInt(faultySignature).toString(16)}`)

  const hash = await calcPaddedHash(msgBuffer, n, e)
  console.log(`0x${bigInt(hash).toString(16)}`)

  const p = calcPrimefactor(faultySignature, hash, n)
  console.log(`0x${bigInt(p).toString(16)}`)

  const signature = calcFinalSignature(hash, p, n, e)
  console.log(`0x${bigInt(signature).toString(16)}`)

  await writeSignatureToFile(signature)
})()