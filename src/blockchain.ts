import { murmurHash } from 'murmurhash-native';
import * as rp from 'request-promise';

export class Blockchain {
  chain: Block[]
  currentTransactions: Transaction[]
  nodes: Set<String>
  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  constructor(chain = [], currentTransactions = [], nodes = new Set<String>()) {
    this.chain = chain;
    this.currentTransactions = currentTransactions;
    this.nodes = nodes;

    if (this.chain.length === 0) {
      this.createBlock(100, 1);
    }
  }

  createBlock(proof, previousHash = 0) {
    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof,
      previousHash: previousHash || this.hash(this.chain[this.chain.length - 1])
    }

    this.currentTransactions = [];
    this.chain.push(block);
    return block;
  }

  addTransaction(sender, recipient, amount) {
    this.currentTransactions.push({ sender, recipient, amount });
    return this.chain.length;
  }

  hash(block: Block): number {
    return murmurHash(JSON.stringify(block));
  }

  proofOfWork(lastProof) {
    let proof = 0;
    while (!this.validProof(lastProof, proof)) {
      proof++
    }
    return proof;
  }

  validProof(lastHash, proof) {
    const guess = `${lastHash}${proof}`;
    const guessHash = murmurHash(guess);
    console.log(`guessHash: ${guessHash}`)
    return `${guessHash}`.slice(-3) === '000'
  }

  registerNode(address) {
    this.nodes.add(address);
  }

  validChain(chain: Block[]) {
    let lastBlock = chain.shift();
    for (const block of chain) {
      if (block.previousHash !== this.hash(lastBlock!)) {
        return false;
      }

      if (!this.validProof(lastBlock!.proof, block.proof)) {
        return false;
      }

      lastBlock = block;
    }
    return true;
  }

  async resolveConflicts() {
    let newChain;
    let maxLength = this.chain.length;

    for (const address of this.nodes) {
      const uri = `${address}/chain`
      const { length, chain } = await rp({ uri, json: true });
      if (length > maxLength && this.validChain(chain)) {
        maxLength = length;
        newChain = chain;
      }
    }

    if (newChain) {
      this.chain = newChain
      return true;
    }
    return false;
  }
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  proof: number;
  previousHash: number
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number
}
