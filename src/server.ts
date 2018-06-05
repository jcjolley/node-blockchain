import { Blockchain } from './blockchain';
import express = require('express');
import bodyParser = require('body-parser');
import uuid = require('uuidv4');

export function setupServer() {
  const blockchain = new Blockchain();
  const nodeId = uuid();
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/transactions/new', (req, res) => {
    const { sender, recipient, amount } = req.body;
    if (!sender || !recipient || !amount) {
      return res.sendStatus(400);
    }

    const nextBlockIndex = blockchain.addTransaction(sender, recipient, amount);
    res.send(`Transaction will be added to block ${nextBlockIndex}`)
  })

  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>A Blockchain Example</title>
        </head>
        <body>
          <h1> Welcome to a simple blockchain example </h1>
          <div>
            <h3>API</h3>
            <ul>
              <li>GET <a href="/mine">/mine</a></li>
              <li>GET <a href="/chain">/chain</a></li>
              <li>GET <a href="/nodes/resolve">/nodes/resolve</a></li>
              <li>POST <a href="/nodes/register">/nodes/register</a><li>
            </ul>

            <p> Enjoy! </p>
          </div>
        </body>
      </html> 
    `)
  })

  app.get('/mine', (req, res) => {
    const lastBlock = blockchain.lastBlock;
    const lastProof = lastBlock.proof;
    const proof = blockchain.proofOfWork(lastProof);

    blockchain.addTransaction(0, nodeId, 1) // Send 1 new 'coin' to user from '0' signifying from blockchain

    const previousHash = blockchain.hash(lastBlock);
    const block = blockchain.createBlock(proof, previousHash);
    const { index, transactions } = block;
    res.send(JSON.stringify({
      message: 'New Block Forged',
      index,
      transactions,
      proof,
      previousHash
    }));
  })

  app.get('/chain', (req, res) => {
    res.send(JSON.stringify({
      chain: blockchain.chain,
      length: blockchain.chain.length
    }))
  })

  app.post('/nodes/register', (req, res) => {
    const { nodes } = req.body
    if (nodes && Array.isArray(nodes)) {
      nodes.forEach(blockchain.registerNode);
    }

    res.send(JSON.stringify({
      message: 'New nodes have been added.',
      totalNodes: blockchain.nodes.size
    }));
  })

  app.get('/nodes/resolve', (req, res) => {
    const wasReplaced = blockchain.resolveConflicts();

    res.send(JSON.stringify({
      message: wasReplaced ? 'Chain Replaced' : 'Chain Authoritative',
      [wasReplaced ? 'chain' : 'newChain']: blockchain.chain
    }))
  })

  return app;
}