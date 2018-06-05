import { murmurHash } from 'murmurhash-native';

export class Blockchain {
  chain: Block[] = [];
  currentTransactions: Transaction[] = []

  constructor() { }

  createBlock(proof, previousHash = '') {
    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof,
      previousHash: previousHash || this.hash(this.chain[this.chain.length - 1])
    }

    this.currentTransactions = [];
    this.chain.push(block);
  }

  addTransaction(sender, recipient, amount) {
    this.currentTransactions.push({ sender, recipient, amount });
    // return a non existent block.
  }

  hash(block: Block): string {
    return murmurHash(JSON.stringify(block));
  }

  get last_block() {
    return this.chain[this.chain.length - 1];
  }
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  proof: number;
  previousHash: string
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number
}