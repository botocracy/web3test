import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { withTranslation } from 'react-i18next';
import { colors } from '../../theme';

import Snackbar from '../snackbar';
import Asset from './asset';
import Loader from '../loader';

import {
  ERROR,
  POOL_BALANCES,
  POOL_INVEST,
  POOL_REDEEM,
  FILTER_BALANCE,
  FILTER_STAKE,
  CONNECTION_CHANGED,
} from '../../stores/constants';

import Store from '../../stores';
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

const styles = (theme) => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1200px',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '20px',
  },
  investedContainerLoggedOut: {
    display: 'flex',
    flex: '1 100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '40px',
    width: '100%',
  },
  investedContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  titleInvested: {
    margin: '15px 10px 15px',
  },
  investedVaults: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridColumnGap: '0',
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridColumnGap: '24px',
    },
    [theme.breakpoints.up('xl')]: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridColumnGap: '24px',
    },
  },
  exclusivesContainer: {
    backgroundColor: colors.investGray,
    margin: '0 20px',
    [theme.breakpoints.up('md')]: {
      margin: '0',
    },
  },
  exclusivesTitle: {
    marginTop: '20px',
    marginBottom: '20px',
    [theme.breakpoints.up('md')]: {
      marginTop: '0',
      marginBottom: 'auto',
    },
  },
  balancesContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    padding: '12px 12px',
    position: 'relative',
  },
  connectContainer: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '450px',
    [theme.breakpoints.up('md')]: {
      width: '450',
    },
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  introCenter: {
    maxWidth: '500px',
    textAlign: 'center',
    display: 'flex',
    padding: '24px 0px',
  },
  introText: {
    paddingLeft: '20px',
  },
  actionButton: {
    '&:hover': {
      backgroundColor: '#2F80ED',
    },
    padding: '12px',
    backgroundColor: '#2F80ED',
    border: '1px solid #9C9DA0',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      padding: '15px',
    },
  },
  overlay: {
    position: 'absolute',
    background: 'RGBA(200, 200, 200, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #9C9DA0',
    cursor: 'pointer',

    right: '0px',
    top: '10px',
    height: '70px',
    width: '160px',
    [theme.breakpoints.up('md')]: {
      right: '0px',
      top: '10px',
      height: '90px',
      width: '210px',
    },
  },
  heading: {
    display: 'none',
    paddingTop: '12px',
    flex: 2,
    flexShrink: 0,
    [theme.breakpoints.up('sm')]: {
      paddingTop: '5px',
      display: 'block',
    },
  },
  headingName: {
    paddingTop: '5px',
    flex: 2,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    minWidth: '100%',
    [theme.breakpoints.up('sm')]: {
      minWidth: 'auto',
    },
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap',
    },
  },
  assetIcon: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    borderRadius: '20px',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    marginRight: '20px',
    [theme.breakpoints.up('sm')]: {
      height: '40px',
      width: '40px',
      marginRight: '24px',
    },
  },
  iconInvested: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'left',
    [theme.breakpoints.down('sm')]: {
      margin: '20px 0 20px',
      alignItems: 'center',
    },
  },
  addressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    overflow: 'hidden',
    flex: 1,
    whiteSpace: 'nowrap',
    fontSize: '0.83rem',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
    padding: '28px 30px',

    border: '1px solid ' + colors.borderBlue,
    alignItems: 'center',
    maxWidth: 'calc(100vw - 24px)',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '100%',
      maxWidth: 'auto',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    [theme.breakpoints.up('lg')]: {
      width: '100%',
      maxWidth: 'auto',
    },
  },
  between: {
    width: '40px',
    height: '40px',
  },
  expansionPanel: {
    maxWidth: 'calc(100vw - 24px)',
    width: '100%',
  },
  versionToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tableHeadContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investAllContainer: {
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  disclaimer: {
    padding: '12px',
    // border: '1px solid rgb(174, 174, 174)',
    borderRadius: '0.75rem',
    marginBottom: '24px',
    background: colors.whiteLight,
  },
  walletAddress: {
    padding: '0px 12px',
  },
  walletTitle: {
    flex: 1,
    color: colors.darkGray,
  },
  grey: {
    color: colors.darkGray,
  },
});

class InvestSimple extends Component {
  constructor(props) {
    super(props);

    this.state = {
      assets: store.getAssets(),
      snackbarType: null,
      snackbarMessage: null,
      hideV1: true,
      value: 1,
      YELDAPY: 0,
    };
    this.getYELDPrice();
    //this.autoRefreshDataInterval()
  }

  autoRefreshDataInterval() {
    setInterval(() => {
      this.refresh();
    }, 8e2);
  }

  async getYELDPrice() {
    /*
    const priceUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=yeld-finance&vs_currencies=usd'

    const req = await fetch(priceUrl, {
      headers: {
        'content-type': 'application/json',
      }
    })
    const res = await req.json()
    const price = res['yeld-finance'].usd
    const yeldToRewardPerDay = window.web3.utils.fromWei(await this.props.yDAI.methods.yeldToRewardPerDay().call())

    // 365 days * 100 yeld * yeld price * 100(%) / 1 million since that's the equivalence
    const rawAPY = 365 * yeldToRewardPerDay * price * 100 / 1e6

    this.setState({ YELDAPY: rawAPY })
    */
  }

  componentDidMount() {
    emitter.on(POOL_INVEST, this.investReturned);
    emitter.on(POOL_REDEEM, this.redeemReturned);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(POOL_BALANCES, this.balancesReturned);
    emitter.on(CONNECTION_CHANGED, this.connectionChanged);
  }

  componentWillUnmount() {
    emitter.removeListener(POOL_INVEST, this.investReturned);
    emitter.removeListener(POOL_REDEEM, this.redeemReturned);
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(POOL_BALANCES, this.balancesReturned);
    emitter.removeListener(CONNECTION_CHANGED, this.connectionChanged);
  }

  refresh() {
    dispatcher.dispatch({ type: POOL_BALANCES, content: {} });
  }

  balancesReturned = (balances) => {
    this.setState(balances);
    //setTimeout(this.refresh, 300000);
  };

  connectionChanged = (provider) => {
    if (provider) {
      const { t } = this.props;
      dispatcher.dispatch({ type: POOL_BALANCES, content: {} });
      const snackbarObj = {
        snackbarMessage: t('Unlock.WalletConnected'),
        snackbarType: 'Info',
        expanded: null,
      };
      this.setState(snackbarObj);
    }
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: 'Error',
      };
      that.setState(snackbarObj);
    });
  };

  investReturned = (result) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: result.txHash,
        snackbarType: 'Hash',
      };
      that.setState(snackbarObj);
    });
    dispatcher.dispatch({ type: POOL_BALANCES, content: result });
  };

  redeemReturned = (result) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: result.txHash,
        snackbarType: 'Hash',
      };
      that.setState(snackbarObj);
    });
    dispatcher.dispatch({ type: POOL_BALANCES, content: result });
  };

  render() {
    const { classes, connected } = this.props;
    const { loading, value } = this.state;

    if (!connected) {
      return (
        <div className={classes.root}>
          <div className={classes.investedContainerLoggedOut}>
            <Typography variant={'h5'} className={classes.disaclaimer}>
              This project is in beta. Use at your own risk.
            </Typography>
            <div className={classes.introCenter}>
              <Typography variant="h3">
                Connect your wallet to continue
              </Typography>
            </div>
          </div>
          {this.renderSnackbar()}
        </div>
      );
    }

    return (
      <div className={classes.root}>
        {/*<div className={classes.twoColumns}>*/}
        <div className={classes.iconInvested}>
          <img
            alt="Optimized Yield Farming"
            src={require('../../assets/dollar-sign.png').default}
            height={'65px'}
          />
        </div>
        <div className={classes.investedContainer}>
          <Typography
            variant={'h3'}
            className={classes.titleInvested}
            style={{ textAlign: 'left' }}
          >
            {' '}
            Your Optimized Yield Farm{' '}
          </Typography>
          <div className={classes.investedVaults}>
            {connected && value === 1 && this.renderAssetBlocksv2()}
          </div>
        </div>
        {/*</div>*/}

        {loading && <Loader />}
        {this.renderSnackbar()}
        <Typography
          variant={'h5'}
          className={classes.disaclaimer}
          style={{ marginTop: '24px' }}
        >
          This project is in beta. Use at your own risk.
        </Typography>
      </div>
    );
  }

  handleTabChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  onChange = (event) => {
    let val = [];
    val[event.target.id] = event.target.checked;
    this.setState(val);
  };

  renderAssetBlocksv2 = () => {
    const { assets, expanded } = this.state;
    const { classes, t, connected } = this.props;
    const width = window.innerWidth;
    return assets.map((asset) => {
      return (
        <Accordion
          className={classes.expansionPanel}
          square
          key={asset.id + '_expand'}
          expanded={expanded === asset.id}
          onChange={() => {
            this.handleChange(asset.id, asset.disabled);
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className={classes.assetSummary}>
              <div className={classes.headingName}>
                <div className={classes.assetIcon}>
                  <img
                    alt=""
                    src={
                      require('../../assets/' + asset.symbol + '-logo.png')
                        .default
                    }
                    height={width > 600 ? '40px' : '30px'}
                    style={asset.disabled ? { filter: 'grayscale(100%)' } : {}}
                  />
                </div>
                <div>
                  <Typography variant={'h3'}>{asset.name}</Typography>
                  <Typography variant={'h5'} className={classes.grey}>
                    {asset.description}
                  </Typography>
                </div>
              </div>
              <div
                className={classes.heading}
                style={{ flex: '4', textAlign: 'center' }}
              >
                <Typography variant={'h3'}>
                  {asset.maxApr
                    ? (asset.maxApr * 100 + this.state.YELDAPY).toFixed(2) +
                      ' %'
                    : '0.00 %'}
                </Typography>
                <Typography variant={'h4'}>
                  ({this.state.YELDAPY.toFixed(2)} % in YELD)
                </Typography>
                <Typography variant={'h5'} className={classes.grey}>
                  {t('InvestSimple.InterestRate')}
                </Typography>
              </div>
              <div className={classes.heading}>
                <Typography variant={'h3'}>
                  {asset.balance
                    ? asset.balance.toFixed(4) +
                      ' ' +
                      (asset.tokenSymbol ? asset.tokenSymbol : asset.symbol)
                    : '0.00 ' +
                      (asset.tokenSymbol ? asset.tokenSymbol : asset.symbol)}
                </Typography>
                <Typography variant={'h5'} className={classes.grey}>
                  {t('InvestSimple.AvailableBalance')}
                </Typography>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Asset
              asset={asset}
              startLoading={this.startLoading}
              connected={connected}
            />
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  handleChange = (id, disabled) => {
    const expandedId = this.state.expanded === id ? null : id;
    this.setState({ expanded: expandedId });
  };

  startLoading = () => {
    this.setState({ loading: true });
  };

  renderSnackbar = () => {
    const { snackbarType, snackbarMessage } = this.state;
    if (snackbarMessage)
      return (
        <Snackbar type={snackbarType} message={snackbarMessage} open={true} />
      );
  };
}

export default withTranslation()(withRouter(withStyles(styles)(InvestSimple)));
