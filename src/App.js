import React, { Component } from 'react';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import interestTheme from './theme';
import { colors } from './theme'
import {
  Switch,
  Route
} from "react-router-dom";
import IpfsRouter from 'ipfs-react-router'
import Header from './components/header';

import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const store = require('./stores/store').default.store

interface IAppState {
  connected: boolean;
  address: string;
  chainId: number;
  networkName: string;
}

const INITIAL_STATE: IAppState = {
  connected: false,
  address: null,
  chainId: 1,
  networkName: 'mainnet',
};

class App extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    };

    this.web3Modal = new Web3Modal({
      network: this.state.networkName,
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
    this.ethersProvider = null;
    this.web3Provider = null;
  }

  componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.setup();
    }
  }

  subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    
    provider.on("close", () => {
      this.resetApp()
    });
    
    provider.on("disconnect", () => {
      this.resetApp()
    });
    
    provider.on("accountsChanged", async (accounts: string[]) => {
      await this.setState({ address: accounts[0] });
    });
    
    provider.on("chainChanged", async (chainId: number) => {
      const networkName = await this.ethersProvider.getNetwork().name;
      await this.setState({ chainId, networkName });
    });

    provider.on("networkChanged", async (networkId: number) => {
      const network = await this.ethersProvider.getNetwork();
      const chainId = network.chainId;
      const networkName = network.name;
      await this.setState({ chainId, networkName });
    });
  };

  getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    }
    return providerOptions
  }
  
  setup = async () => {
    try {
      this.web3Provider = await this.web3Modal.connect()
      await this.subscribeProvider(this.web3Provider)
      
      this.ethersProvider = new ethers.providers.Web3Provider(this.web3Provider)
      const accounts = await this.ethersProvider.listAccounts()
      const address = accounts[0]
      const network = await this.ethersProvider.getNetwork()
      const chainId = network.chainId
      const networkName = network.name

      await this.setState({
        connected: true,
        address: address,
        chainId,
        networkName
      })
      store.setProvider(this.ethersProvider)
    } catch (e) {
      console.log(e)
      await this.resetApp()
    }
  }

  resetApp = async () => {
    store.setProvider(null)
    if (this.ethersProvider) {
      this.ethersProvider = null;
      this.web3Provider = null;
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({ ...INITIAL_STATE });
  };
  
  render() {
    return (
      <MuiThemeProvider theme={createMuiTheme(interestTheme)}>
        <CssBaseline />
        <IpfsRouter>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            alignItems: 'center',
            background: colors.white,
          }}>
            <Switch>
              <Route path="/">
                <Header
                  onConnect = {this.setup}
                  onDisconnect = {this.resetApp}
                  connected = {this.state.connected}
                  address = {this.state.address}
                />
              </Route>
            </Switch>
          </div>
        </IpfsRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
