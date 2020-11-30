import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography, TextField, Button, IconButton } from '@material-ui/core';
import AutorenewIcon from '@material-ui/icons/Autorenew';

import { withTranslation } from 'react-i18next';

import {
  ERROR,
  POOL_INVEST,
  POOL_REDEEM,
  POOL_BALANCES,
} from '../../stores/constants';

import Store from '../../stores';
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;

const styles = (theme) => ({
  value: {
    cursor: 'pointer',
  },
  actionInput: {
    padding: '0px 0px 12px 0px',
    fontSize: '0.5rem',
  },
  balances: {
    width: '100%',
    textAlign: 'right',
    paddingRight: '20px',
    cursor: 'pointer',
  },
  actionsContainer: {
    paddingBottom: '12px',
    display: 'flex',
    flex: '1',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  title: {
    paddingRight: '24px',
  },
  actionButton: {
    height: '47px',
  },
  tradeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sepperator: {
    borderBottom: 'none',
    margin: '0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.up('md')]: {
      width: '40px',
    },
  },
  scaleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0px 0px 12px 0px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  scale: {
    minWidth: '10px',
    [theme.breakpoints.down('sm')]: {
      padding: '10px 16px',
    },
  },
  buttonText: {
    fontWeight: '700',
  },
  headingContainer: {
    width: '100%',
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  heading: {
    paddingBottom: '12px',
    flex: 1,
    flexShrink: 0,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  right: {
    textAlign: 'right',
  },
});

class Asset extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      amountError: false,
      redeemAmount: '',
      redeemAmountError: false,
      generatedYELD: 0,
    };
  }

  componentWillMount() {
    emitter.on(POOL_INVEST, this.investReturned);
    emitter.on(POOL_REDEEM, this.redeemReturned);
    emitter.on(ERROR, this.errorReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(POOL_INVEST, this.investReturned);
    emitter.removeListener(POOL_REDEEM, this.redeemReturned);
    emitter.removeListener(ERROR, this.errorReturned);
  }

  investReturned = () => {
    this.setState({ loading: false, amount: '' });
  };

  redeemReturned = (txHash) => {
    this.setState({ loading: false, redeemAmount: '' });
  };

  errorReturned = (error) => {
    this.setState({ loading: false });
  };

  render() {
    const { classes, asset, t, connected } = this.props;
    const {
      amount,
      amountError,
      redeemAmount,
      redeemAmountError,
      loading,
    } = this.state;

    return (
      <div className={classes.actionsContainer}>
        <div className={classes.tradeContainer}>
          {!asset.disabled && (
            <div className={classes.balances}>
              <Typography variant="h3" className={classes.title}></Typography>
              <Typography
                variant="h4"
                onClick={() => {
                  this.setAmount(100);
                }}
                className={classes.value}
                noWrap
              >
                {'Balance: ' +
                  (asset.balance ? asset.balance.toFixed(4) : '0.0000')}{' '}
                {asset.tokenSymbol ? asset.tokenSymbol : asset.symbol}
              </Typography>
            </div>
          )}
          <TextField
            fullWidth
            className={classes.actionInput}
            id={'amount'}
            value={amount}
            error={amountError}
            onChange={this.onChange}
            disabled={loading || asset.disabled}
            placeholder="0.00"
            variant="outlined"
            onKeyDown={this.inputKeyDown}
          />
          <div className={classes.scaleContainer}>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setAmount(25);
              }}
            >
              <Typography variant={'h5'}>25%</Typography>
            </Button>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setAmount(50);
              }}
            >
              <Typography variant={'h5'}>50%</Typography>
            </Button>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setAmount(75);
              }}
            >
              <Typography variant={'h5'}>75%</Typography>
            </Button>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setAmount(100);
              }}
            >
              <Typography variant={'h5'}>100%</Typography>
            </Button>
          </div>
          <Button
            className={classes.actionButton}
            variant="outlined"
            color="primary"
            disabled={loading || !connected || asset.disabled || amount <= 0}
            onClick={async () => {
              this.onInvest();
            }}
            fullWidth
          >
            <Typography
              className={classes.buttonText}
              variant={'h5'}
              color={asset.disabled ? '' : 'secondary'}
            >
              {asset.disabled ? t('Asset.Disabled') : t('Asset.Earn')}
            </Typography>
          </Button>
          {/*<div style={{textAlign: 'center'}}>Depositing new tokens will reset your rewards! Claim them first before depositing</div>*/}
        </div>
        <div className={classes.sepperator}>
          <IconButton
            onClick={this.onReload}
            disabled={loading || !connected || asset.disabled}
          >
            <AutorenewIcon />
          </IconButton>
        </div>
        <div className={classes.tradeContainer}>
          {!asset.disabled && (
            <div className={classes.balances}>
              <Typography variant="h3" className={classes.title}></Typography>
              <Typography
                variant="h4"
                onClick={() => {
                  this.setRedeemAmount(100);
                }}
                className={classes.value}
                noWrap
              >
                {asset.investedBalance
                  ? asset.investedBalance.toFixed(4)
                  : '0.0000'}{' '}
                {asset.investSymbol} (
                {asset.currentBalance ? asset.currentBalance.toFixed(4) : '0'}{' '}
                {asset.tokenSymbol ? asset.tokenSymbol : asset.symbol} )
              </Typography>
            </div>
          )}
          <TextField
            fullWidth
            className={classes.actionInput}
            id={'redeemAmount'}
            value={redeemAmount}
            error={redeemAmountError}
            onChange={this.onChange}
            disabled={loading || asset.disabled}
            placeholder="0.00"
            variant="outlined"
            onKeyDown={this.inputRedeemKeyDown}
          />
          <div className={classes.scaleContainer}>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setRedeemAmount(25);
              }}
            >
              <Typography variant={'h5'}>25%</Typography>
            </Button>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setRedeemAmount(50);
              }}
            >
              <Typography variant={'h5'}>50%</Typography>
            </Button>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setRedeemAmount(75);
              }}
            >
              <Typography variant={'h5'}>75%</Typography>
            </Button>
            <Button
              className={classes.scale}
              variant="text"
              disabled={loading || asset.disabled}
              color="primary"
              onClick={() => {
                this.setRedeemAmount(100);
              }}
            >
              <Typography variant={'h5'}>100%</Typography>
            </Button>
          </div>
          <Button
            className={classes.actionButton}
            variant="outlined"
            color="primary"
            disabled={
              loading || !connected || redeemAmount <= 0 || asset.disabled
            }
            onClick={async () => {
              this.onRedeem();
            }}
            fullWidth
          >
            <Typography
              className={classes.buttonText}
              variant={'h5'}
              color={asset.disabled ? '' : 'secondary'}
            >
              {asset.disabled ? t('Asset.Disabled') : t('Asset.Claim')}
            </Typography>
          </Button>
          {asset.tokenEarned.toFixed(4)} YELD earned
        </div>
      </div>
    );
  }

  onChange = (event) => {
    let val = [];
    val[event.target.id] = event.target.value;
    this.setState(val);
  };

  inputKeyDown = (event) => {
    if (event.which === 13) {
      this.onInvest();
      return true;
    }
    return false;
  };

  onInvest = () => {
    this.setState({ amountError: false });

    var { amount } = this.state;
    const { asset, startLoading } = this.props;

    if (amount > asset.balance && amount - asset.balance < 1e-4)
      amount = asset.balance;

    if (!amount || isNaN(amount) || amount <= 0 || amount > asset.balance) {
      this.setState({ amountError: true });
      return false;
    }

    this.setState({ loading: true });
    startLoading();
    dispatcher.dispatch({
      type: POOL_INVEST,
      content: { amount: amount, asset: asset },
    });
  };

  onRedeem = () => {
    this.setState({ redeemAmountError: false });

    var { redeemAmount } = this.state;
    const { asset, startLoading } = this.props;

    if (
      redeemAmount > asset.investedBalance &&
      redeemAmount - asset.investedBalance < 1e-3
    )
      redeemAmount = asset.investedBalance;

    if (
      !redeemAmount ||
      isNaN(redeemAmount) ||
      redeemAmount <= 0 ||
      redeemAmount > asset.investedBalance
    ) {
      this.setState({ redeemAmountError: true });
      return false;
    }

    this.setState({ loading: true });
    startLoading();

    dispatcher.dispatch({
      type: POOL_REDEEM,
      content: { amount: redeemAmount, asset: asset },
    });
  };

  onReload = () => {
    const { asset } = this.props;
    dispatcher.dispatch({ type: POOL_BALANCES, content: { id: asset.id } });
  };

  setAmount = (percent) => {
    if (this.state.loading) {
      return;
    }

    const { asset } = this.props;

    const balance = asset.balance;
    let amount = (balance * percent) / 100;

    this.setState({ amount: amount.toFixed(4) });
  };

  setRedeemAmount = (percent) => {
    if (this.state.loading) {
      return;
    }

    const balance = this.props.asset.investedBalance;
    let amount = (balance * percent) / 100;

    this.setState({ redeemAmount: amount.toFixed(4) });
  };
}

export default withTranslation()(
  withRouter(withStyles(styles, { withTheme: true })(Asset))
);
