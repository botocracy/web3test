import async from 'async';
import {
  ERROR,
  YELD_CONTRACT,
  YELD_RETIREMENT,
  YELD_STAKE,
  YELD_UNSTAKE,
  YELD_REDEEM,
  CONNECTION_CHANGED,
  POOL_BALANCES,
  POOL_INVEST,
  POOL_REDEEM,
  POOL_HASH,
  FILTER_AMOUNT,
  FILTER_BURNED,
  FILTER_SUPPLY,
  FILTER_BALANCE,
  FILTER_STAKE,
} from './constants';

import config from '../config/config';
import yeldConfig from '../config/yeldConfig';

const ethers = require('ethers');
const Emitter = require('events').EventEmitter;
const Dispatcher = require('flux').Dispatcher;

var emitter = new Emitter();
var dispatcher = new Dispatcher();

const burnAddress = '0x0000000000000000000000000000000000000000';

class Store {
  constructor() {
    this.ethersProvider = null;
    this.eventProvider = null;
    this.address = null;
    this.chainId = 1;

    this.retirementYeldContract = null;
    this.yeldContract = null;

    this.assets = [
      {
        id: 'DAIv2',
        name: 'DAI',
        symbol: 'DAI',
        description: 'DAI Stablecoin',
        investSymbol: 'yDAI',
        contract: null,
        tokenContract: null,
        maxApr: 0,
        balance: 0,
        investedBalance: 0,
        currentBalance: 0,
        decimals: 18,
        version: 2,
        disabled: false,
        invest: 'deposit',
        redeem: 'withdraw',
        tokenEarned: 0,
        tvl: 0,
      },
      {
        id: 'USDCv2',
        name: 'USD Coin',
        symbol: 'USDC',
        description: 'USD//C',
        investSymbol: 'yUSDC',
        contract: null,
        tokenContract: null,
        maxApr: 0,
        balance: 0,
        investedBalance: 0,
        currentBalance: 0,
        decimals: 6,
        poolValue: 0,
        version: 2,
        disabled: false,
        invest: 'deposit(uint256)',
        redeem: 'withdraw(uint256)',
        tokenEarned: 0,
        tvl: 0,
      },
      {
        id: 'USDTv2',
        name: 'USDT',
        symbol: 'USDT',
        description: 'Tether USD',
        investSymbol: 'yUSDT',
        contract: null,
        tokenContract: null,
        maxApr: 0,
        balance: 0,
        investedBalance: 0,
        currentBalance: 0,
        decimals: 6,
        poolValue: 0,
        version: 2,
        disabled: false,
        invest: 'deposit',
        redeem: 'withdraw',
        tokenEarned: 0,
        tvl: 0,
      },
      {
        id: 'TUSDv2',
        name: 'TUSD',
        symbol: 'TUSD',
        description: 'TrueUSD',
        investSymbol: 'yTUSD',
        contract: null,
        tokenContract: null,
        maxApr: 0,
        balance: 0,
        investedBalance: 0,
        currentBalance: 0,
        decimals: 18,
        poolValue: 0,
        version: 2,
        disabled: false,
        invest: 'deposit',
        redeem: 'withdraw',
        tokenEarned: 0,
        tvl: 0,
      },
    ];

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case YELD_CONTRACT:
            this.getYeldContractData(payload.content);
            break;
          case YELD_RETIREMENT:
            this.getRetirementContractData(payload.content);
            break;
          case POOL_BALANCES:
            this.getPoolBalances(payload.content);
            break;
          case POOL_INVEST:
            this.poolInvest(payload);
            break;
          case POOL_REDEEM:
            this.poolRedeem(payload);
            break;
          case YELD_STAKE:
            this.stakeYeld(payload.content);
            break;
          case YELD_UNSTAKE:
            this.unstakeYeld(payload.content);
            break;
          case YELD_REDEEM:
            this.redeemYeld(payload.content);
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getAssets = () => {
    return this.assets;
  };

  setProvider(provider, eventProvider, chainId, address) {
    if (this.eventProvider) this.eventProvider.removeAllListeners();

    this.ethersProvider = provider;
    this.eventProvider = eventProvider;
    this.chainId = chainId;
    this.address = address;
    if (!this.setupContracts()) this.ethersProvider = null;
    else if (eventProvider) this.setupEvents();
    emitter.emit(CONNECTION_CHANGED, provider, address);
  }

  isConnected = () => {
    return this.ethersProvider !== null;
  };

  setupContracts = async () => {
    if (this.yeldContract) this.yeldContract.removeAllListeners();

    this.assets.map((asset) => {
      asset.contract = asset.tokenContract = null;
      return true;
    });

    if (this.ethersProvider) {
      const chainAddresses = yeldConfig.addresses[this.chainId];
      if (!chainAddresses) return false;

      const signer = this.ethersProvider.getSigner();

      this.assets.map((asset) => {
        if (chainAddresses[asset.id].yeld !== '') {
          asset.contract = new ethers.Contract(
            chainAddresses[asset.id].yeld,
            yeldConfig.stableFarmAbi,
            signer
          );
          asset.tokenContract = new ethers.Contract(
            chainAddresses[asset.id].token,
            config.erc20ABI,
            signer
          );
          asset.disabled = false;
        } else {
          asset.disabled = true;
        }
        return true;
      });

      this.retirementYeldContract = new ethers.Contract(
        chainAddresses.retirementYeldAddresses,
        yeldConfig.retirementYeldAbi,
        signer
      );
      this.yeldContract = new ethers.Contract(
        chainAddresses.yeldAddress,
        yeldConfig.yeldAbi,
        signer
      );
    }
    return true;
  };

  setupEvents() {
    // Event listener if YELD is Transfered to burnAdress
    const filter = this.yeldContract.filters.Transfer(null, burnAddress);
    this.eventProvider.on(filter, (log, event) => {
      this.getYeldContractData([FILTER_BURNED]);
    });
  }

  getYeldContractData(filter) {
    if (filter.length)
      async.parallel(
        [
          (callbackInner) => {
            this._getYeldAmount(filter, callbackInner);
          },
          (callbackInner) => {
            this._getYeldTotalSupply(filter, callbackInner);
          },
          (callbackInner) => {
            this._getYeldBurned(filter, callbackInner);
          },
        ],
        (err, data) => {
          if (err) {
            console.log(err);
            emitter.emit(ERROR, { error: err.toString() });
          } else {
            var asset = {};
            if (data[0] !== null) asset.yeldAmount = data[0];
            if (data[1] !== null) asset.totalSupply = data[1];
            if (data[2] !== null) asset.yeldBurned = data[2];
            emitter.emit(YELD_CONTRACT, asset);
          }
        }
      );
  }

  getRetirementContractData(filter) {
    if (filter.length)
      async.parallel(
        [
          (callbackInner) => {
            this._getStakeInfo(filter, callbackInner);
          },
          (callbackInner) => {
            this._getRetirementBalance(filter, callbackInner);
          },
        ],
        (err, data) => {
          if (err) {
            console.log(err);
            emitter.emit(ERROR, { error: err.message });
          } else {
            var asset = {};
            if (data[0] !== null) asset.stake = data[0];
            if (data[1] !== null) asset.balance = data[1];
            emitter.emit(YELD_RETIREMENT, asset);
          }
        }
      );
  }

  getPoolBalances = async (filter) => {
    async.map(
      this.assets,
      (asset, callback) => {
        if (filter.id === undefined || filter.id === asset.id) {
          async.parallel(
            [
              (callbackInner) => {
                this._getERC20Balance(asset, filter.items, callbackInner);
              },
              (callbackInner) => {
                this._getUIPoolData(asset, filter.items, callbackInner);
              },
            ],
            (err, data) => {
              if (err) {
                console.log(err);
                callback(err);
              } else {
                asset.balance = data[0];
                asset.investedBalance = data[1].investedBalance;
                asset.currentBalance = data[1].currentBalance;
                asset.maxApr = data[1].maxApr;
                asset.tokenEarned = data[1].tokenEarned;
                asset.tvl = data[1].tvl;
                callback(null, asset);
              }
            }
          );
        } else callback(null, asset);
      },
      (err, assets) => {
        if (err) {
          return emitter.emit(ERROR, err);
        }

        return emitter.emit(POOL_BALANCES, assets);
      }
    );
  };

  stakeYeld = async (amount) => {
    try {
      const retirementYeldAddress =
        yeldConfig.addresses[this.chainId].retirementYeldAddresses;
      const allowance = await this.yeldContract.allowance(
        this.address,
        retirementYeldAddress
      );
      const amountToStake = this.toWei(amount);

      if (allowance.lt(amountToStake)) {
        const tx = await this.yeldContract.approve(
          retirementYeldAddress,
          amountToStake
        );
        await tx.wait();
      }

      const tx = await this.retirementYeldContract.stakeYeld(amountToStake);
      await tx.wait();

      emitter.emit(YELD_STAKE);
    } catch (e) {
      emitter.emit(YELD_STAKE, { error: e.message });
    }
  };

  unstakeYeld = async (amount) => {
    try {
      const amountToUnstake = this.toWei(amount);

      const tx = await this.retirementYeldContract.unstake(amountToUnstake);
      await tx.wait();

      emitter.emit(YELD_UNSTAKE);
    } catch (e) {
      emitter.emit(YELD_UNSTAKE, { error: e.message });
    }
  };

  redeemYeld = async (amount) => {
    try {
      const tx = await this.retirementYeldContract.redeemETH();
      await tx.wait();

      emitter.emit(YELD_REDEEM);
    } catch (e) {
      emitter.emit(YELD_REDEEM, { error: e.message });
    }
  };

  poolInvest = async (payload) => {
    try {
      const { asset, amount } = payload.content;
      const investAmount = this.toWei(amount, asset.decimals);
      const allowance = await asset.tokenContract.allowance(
        this.address,
        asset.contract.address
      );

      if (allowance.lt(investAmount)) {
        const tx = await asset.tokenContract.approve(
          asset.contract.address,
          investAmount
        );
        await tx.wait();
      }

      const tx = await asset.contract.functions[asset.invest](investAmount);
      emitter.emit(POOL_HASH, tx.hash);

      await tx.wait();
      emitter.emit(POOL_INVEST, { id: asset.id, txHash: tx.hash });
    } catch (e) {
      emitter.emit(ERROR, e);
    }
  };

  poolRedeem = async (payload) => {
    try {
      const { asset, amount } = payload.content;
      const redeemAmount = this.toWei(amount, asset.decimals);

      const tx = await asset.contract.functions[asset.redeem](redeemAmount);
      emitter.emit(POOL_HASH, tx.hash);

      await tx.wait();
      emitter.emit(POOL_REDEEM, { id: asset.id, txHash: tx.hash });
    } catch (e) {
      emitter.emit(ERROR, e);
    }
  };

  _getYeldAmount = async (filter, callback) => {
    if (!filter.includes(FILTER_AMOUNT)) return callback(null, null);

    try {
      const result = await this.yeldContract.balanceOf(this.address);
      callback(null, this.fromWei(result));
    } catch (e) {
      console.log(e);
      return callback(e);
    }
  };

  _getYeldBurned = async (filter, callback) => {
    if (!filter.includes(FILTER_BURNED)) return callback(null, null);

    try {
      const result = await this.yeldContract.balanceOf(burnAddress);
      callback(null, this.fromWei(result));
    } catch (e) {
      console.log(e);
      return callback(e);
    }
  };

  _getYeldTotalSupply = async (filter, callback) => {
    if (!filter.includes(FILTER_SUPPLY)) return callback(null, null);

    try {
      const result = await this.yeldContract.totalSupply();
      callback(null, this.fromWei(result));
    } catch (e) {
      console.log(e);
      return callback(e);
    }
  };

  _getStakeInfo = async (filter, callback) => {
    if (!filter.includes(FILTER_STAKE)) return callback(null, null);

    try {
      const result = await this.retirementYeldContract.stakes(this.address);
      callback(null, result);
    } catch (e) {
      console.log(e);
      return callback(e);
    }
  };

  _getRetirementBalance = async (filter, callback) => {
    if (!filter.includes(FILTER_BALANCE)) return callback(null, null);

    try {
      const retirementYeldAddress =
        yeldConfig.addresses[this.chainId].retirementYeldAddresses;
      const result = await this.ethersProvider.getBalance(
        retirementYeldAddress
      );
      callback(null, result);
    } catch (e) {
      console.log(e);
      return callback(e);
    }
  };

  _getERC20Balance = async (asset, filter, callback) => {
    if (!asset.contract) return callback(null, asset.balance);

    try {
      const balance = await asset.tokenContract.balanceOf(this.address);
      callback(null, this.fromWei(balance, asset.decimals));
    } catch (ex) {
      console.log(ex);
      return callback(ex);
    }
  };

  _getUIPoolData = async (asset, filter, callback) => {
    if (!asset.contract) return callback(null, asset);

    try {
      const data = await asset.contract.getUIData(this.address);
      const result = {
        investedBalance: this.fromWei(data.yAmount, asset.decimals),
        currentBalance: this.fromWei(data.assetAmount, asset.decimals),
        maxApr: this.fromWei(data.apr),
        tokenEarned: this.fromWei(data.tokensEarned),
        tvl: this.fromWei(data.tvl, asset.decimals),
      };
      callback(null, result);
    } catch (ex) {
      console.log(ex);
      return callback(ex);
    }
  };

  fromWei(number, decimals = 18) {
    return parseFloat(ethers.utils.formatUnits(number, decimals));
  }

  toWei(number, decimals = 18) {
    const parsed =
      typeof number === 'number' ? number.toFixed(decimals) : number;
    return ethers.utils.parseUnits(parsed, decimals);
  }
}

var store = new Store();

export default {
  store: store,
  emitter: emitter,
  dispatcher: dispatcher,
};
