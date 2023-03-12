const path = require('path')

const networkIndex = process.argv.findIndex((arg) => arg.includes('--network'))
const networkForPath = process.argv[networkIndex + 1];

const getNetwork = (networkForPath) => {
  switch (networkForPath) {
    case 'local':
      return 'localhost'
    case 'goerli-ovm':
      return 'optimism-goerli'
    case 'mainnet-ovm':
      return 'optimistic-mainnet'
    default:
      throw Error('invalid network type')
  }
}

const getETHNetwork = (networkForPath) => {
  switch (networkForPath) {
    case 'local':
    case 'goerli-ovm':
      return 'optimism-goerli'
    case 'mainnet-ovm':
      return 'optimism'
    default:
      throw Error('invalid network type')
  }
}

const getStartBlock = (networkForPath) => {
  switch (networkForPath) {
    case 'local':
      return 1
    case 'mainnet-ovm':
      return 80035549
    default:
      throw Error('invalid network type')
  }
}

const data = require(path.join('./config/config.json'))
const network = getNetwork(networkForPath)
const ethNetwork = getETHNetwork(networkForPath);
console.log({ network, ethNetwork })
const getABIPath = (contractName) => path.join('./abis', network + '_' + contractName + '.json')
const startBlock = getStartBlock(networkForPath); 

const dataSources = [
  {
    kind: 'ethereum/contract',
    name: 'AccountFactory',
    network: ethNetwork, 
    source: {
      address: data[`${network}_AccountFactoryAddress`],
      abi: 'AccountFactory',
      startBlock: startBlock // on local 1 on optimism 230000
    },
    mapping: {
      kind: 'ethereum/events',
      apiVersion: '0.0.6',
      language: 'wasm/assemblyscript',
      file: './src/mappings/accountFactory.ts',
      entities: ['AccountFactory'],
      abis: [
        {
          name: 'AccountFactory',
          file: getABIPath('AccountFactory'),
        },
      ],
      eventHandlers: [
        {
          event: 'NewAccount(indexed address,address)',
          handler: 'handleNewAccount',
        },
      ]
    }
  }
]

const templates = [
  {
    kind: 'ethereum/contract',
    name: 'AccountOrder',
    network: ethNetwork,
    source: {
      abi: 'AccountOrder',
    },
    mapping: {
      kind: 'ethereum/events',
      apiVersion: '0.0.6',
      language: 'wasm/assemblyscript',
      file: './src/mappings/accountOrder.ts',
      entities: ['AccountOrder'], //This value is currently not used by TheGraph at all, it just cant be empty
      abis: [
        {
          name: 'AccountOrder',
          file: getABIPath('AccountOrder'),
        },
      ],
      eventHandlers: [
        {
          event: 'Deposit(indexed address,uint256)',
          handler: 'handleDeposit',
        },
        {
          event: 'Withdraw(indexed address,uint256)',
          handler: 'handleWithdraw',
        },
        {
          event: 'OrderFilled(indexed address,uint256)',
          handler: 'handleOrderFilled',
        },
        {
          event: 'OrderCancelled(indexed address,uint256)',
          handler: 'handleOrderCancelled',
        },
        {
          event: 'StrikeOrderPlaced(indexed address,uint256,((uint8,bytes32,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256),bytes32,uint256))',
          handler: 'handleStrikeOrderPlaced',
        },
      ],
    },
  },
]

module.exports = {
  specVersion: '0.0.2',
  description: 'Otus Account Order',
  repository: 'https://github.com/otus-finance/otus-account-order-subgraph',
  schema: {
    file: './src/schema.graphql',
  },
  dataSources,
  templates,
}