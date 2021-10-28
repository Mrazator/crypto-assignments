# Skips the most significant bit as in the algorithm, multiplied by some random constant based on the analysis from the data sample
def leak(nonce: int, private: int):
    return (nonce.bit_length()-1)*1008
