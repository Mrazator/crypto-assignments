const { Console } = require('console')
const crypto = require('crypto')
const { SHA3 } = require('sha3')

// By analyzing how SHA3 works internally, I figured out that I could be sending 400 byte longs message, because calling Keccak on the first block (messageXpart1) is equal to the messageXpart2 (because xor of this is all zeros)
// More details - in the second call (for the second pad), it gets XORed a and this XOR result has to be the same for each message - result can be anything, but for simplicity i chose 1600 bits with all zeros)
// first part of each message
// one is random, from crypto.randomBytes(200), second is all zeros
const message1part1 = 'c23487bff49d6989f3544f7f59b78810d1562c76f02f5f87a97eb0608ad82d7f83a1f0bc17d56675d546371b53e93faeea3d672a20d3f5e9d061237319820f4846c040b0af60b1f4ea7eb72a5116596ba72458eaa0c03e7827c980003765502b7669f78ec3e03b886c03022ecc3e31fdf3ec5aa0e2924582b3b2edc5b3267b0fab7382a471775c1c144a91f3185bc4f41e1871aad9a9efc27e9bdddd9b202df53b493812c222f0ed1ee06ef8df0e9b2dbe1041b9ba0d9bf0ac0e8ab577393e6c2b40b10e2201e4b3'
const message2part1 = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

const inputs = {
    "1": { part1: message1part1 },
    "2": { part1: message2part1 }
}

console.log('\nConstructing messages part1 - check the console:')
console.log('--------------------------------------------------')
// Constructs messages (written down in console)
Object.keys(inputs).map(x => {
    // Warning - this SHA3 implementation is heavily modified by me in the node_modules/sha3 folder
    console.log(`\nINPUT ${x}:`)
    const hash = new SHA3(128);
    hash.update(new Buffer(inputs[x].part1, 'hex'))
    const d1 = hash.digest('hex')
    
    console.log(`\nHash ${x}:`)
    console.log(d1)
})

// Messages part2 (got from above code from console.log()) 
const message1part2 = "1eef6067388e262ee2d4c4ee823c0ed4b0fb93b5751d26601665fb15c9f2b1559123b4f498824b0c3d2cf2dbb8baacc4be2fce3aafecc3d8cfc2e3cd54bce56fb577b1d51fc331f7db8b887c455687dc344c45cef2d3c3fcb1354484c0d9462bc5ece1c2bffe4208ad038d877edb335c174e446508174be26b92843b819ccc5730d05baba842b7156bb41cd88685bea14700f0eab47d54ba634eba7b59ae139cfd1e8997741840c1ba92013547a244a7e3db75e2e7969e4351fa664684bd723445926718f727ef4a"
const message2part2 = "e7dde140798f25f18a47c033f9ccd584eea95aa61e2698d54d49806f304715bd57d05362054e288bd46f8e7f2da497ffc44746a4a0e5fe90762e19d60cda5b8c9c05191bf7a630ad64fc8fd0b75a933035d617233fa95aeb0321710d26e6a6a95f55cfdb167ca58126c84703cd31b8439f56a5111a2ff20161aed9215a63e505f270c98cf2febe641166c47b95703661cb0ed04f555a7cb8c832cf1c8ae83e8c14263aae22790c94e409c5a224f94118c26504e72635f5163ba1307fe944f67549a2ec5c7bfff1ea"

console.log('\nConstructing whole messages, comparing hashes:')
console.log('------------------------------------------------')

// Hide log
const loggingFunc = console.log
console = console || {};
console.log = function(){};

// Putting message together
const hash = new SHA3(128)
hash.update(new Buffer(message1part1 + message1part2, 'hex'))
const d1 = hash.digest('hex')
hash.reset()

hash.update(new Buffer(message2part1 + message2part2, 'hex'))
const d2 = hash.digest('hex')

// Show log
console.log = loggingFunc
console.log('\nHash1:', d1)
console.log('Hash2:', d2)
console.log('Are hashes the same?:', d1 == d2 ? "Yes" : "No")