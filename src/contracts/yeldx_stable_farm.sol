pragma solidity 0.6.5;

interface IERC20 {
  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function allowance(address owner, address spender)
    external
    view
    returns (uint256);

  function approve(address spender, uint256 amount) external returns (bool);

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Context {
  constructor() internal {}

  // solhint-disable-previous-line no-empty-blocks

  function _msgSender() internal view returns (address payable) {
    return msg.sender;
  }

  function _msgData() internal view returns (bytes memory) {
    this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    return msg.data;
  }
}

contract Ownable is Context {
  address payable private _owner;

  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  constructor() internal {
    _owner = _msgSender();
    emit OwnershipTransferred(address(0), _owner);
  }

  function owner() public view returns (address payable) {
    return _owner;
  }

  modifier onlyOwner() {
    require(isOwner(), 'Ownable: caller is not the owner');
    _;
  }

  function isOwner() public view returns (bool) {
    return _msgSender() == _owner;
  }

  function renounceOwnership() public onlyOwner {
    emit OwnershipTransferred(_owner, address(0));
    _owner = address(0);
  }

  function transferOwnership(address payable newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  function _transferOwnership(address payable newOwner) internal {
    require(newOwner != address(0), 'Ownable: new owner is the zero address');
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}

contract ERC20 is Context, IERC20 {
  using SafeMath for uint256;

  mapping(address => uint256) _balances;

  mapping(address => mapping(address => uint256)) private _allowances;

  uint256 _totalSupply;

  function totalSupply() public view override returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view override returns (uint256) {
    return _balances[account];
  }

  function transfer(address recipient, uint256 amount)
    public
    override
    returns (bool)
  {
    _transfer(_msgSender(), recipient, amount);
    return true;
  }

  function allowance(address owner, address spender)
    public
    view
    override
    returns (uint256)
  {
    return _allowances[owner][spender];
  }

  function approve(address spender, uint256 amount)
    public
    override
    returns (bool)
  {
    _approve(_msgSender(), spender, amount);
    return true;
  }

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) public override returns (bool) {
    _transfer(sender, recipient, amount);
    _approve(
      sender,
      _msgSender(),
      _allowances[sender][_msgSender()].sub(
        amount,
        'ERC20: transfer amount exceeds allowance'
      )
    );
    return true;
  }

  function increaseAllowance(address spender, uint256 addedValue)
    public
    returns (bool)
  {
    _approve(
      _msgSender(),
      spender,
      _allowances[_msgSender()][spender].add(addedValue)
    );
    return true;
  }

  function decreaseAllowance(address spender, uint256 subtractedValue)
    public
    returns (bool)
  {
    _approve(
      _msgSender(),
      spender,
      _allowances[_msgSender()][spender].sub(
        subtractedValue,
        'ERC20: decreased allowance below zero'
      )
    );
    return true;
  }

  function _transfer(
    address sender,
    address recipient,
    uint256 amount
  ) internal {
    require(sender != address(0), 'ERC20: transfer from the zero address');
    require(recipient != address(0), 'ERC20: transfer to the zero address');

    _balances[sender] = _balances[sender].sub(
      amount,
      'ERC20: transfer amount exceeds balance'
    );
    _balances[recipient] = _balances[recipient].add(amount);
    emit Transfer(sender, recipient, amount);
  }

  function _mint(address account, uint256 amount) internal {
    require(account != address(0), 'ERC20: mint to the zero address');

    _totalSupply = _totalSupply.add(amount);
    _balances[account] = _balances[account].add(amount);
    emit Transfer(address(0), account, amount);
  }

  function _burn(address account, uint256 amount) internal {
    require(account != address(0), 'ERC20: burn from the zero address');

    _balances[account] = _balances[account].sub(
      amount,
      'ERC20: burn amount exceeds balance'
    );
    _totalSupply = _totalSupply.sub(amount);
    emit Transfer(account, address(0), amount);
  }

  function _approve(
    address owner,
    address spender,
    uint256 amount
  ) internal {
    require(owner != address(0), 'ERC20: approve from the zero address');
    require(spender != address(0), 'ERC20: approve to the zero address');

    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }

  function _burnFrom(address account, uint256 amount) internal {
    _burn(account, amount);
    _approve(
      account,
      _msgSender(),
      _allowances[account][_msgSender()].sub(
        amount,
        'ERC20: burn amount exceeds allowance'
      )
    );
  }
}

abstract contract ERC20Detailed is IERC20 {
  string private _name;
  string private _symbol;
  uint8 private _decimals;

  constructor(
    string memory name,
    string memory symbol,
    uint8 decimals
  ) public {
    _name = name;
    _symbol = symbol;
    _decimals = decimals;
  }

  function name() public view returns (string memory) {
    return _name;
  }

  function symbol() public view returns (string memory) {
    return _symbol;
  }

  function decimals() public view returns (uint8) {
    return _decimals;
  }
}

library SafeMath {
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, 'SafeMath: addition overflow');

    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    return sub(a, b, 'SafeMath: subtraction overflow');
  }

  function sub(
    uint256 a,
    uint256 b,
    string memory errorMessage
  ) internal pure returns (uint256) {
    require(b <= a, errorMessage);
    uint256 c = a - b;

    return c;
  }

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b, 'SafeMath: multiplication overflow');

    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    return div(a, b, 'SafeMath: division by zero');
  }

  function div(
    uint256 a,
    uint256 b,
    string memory errorMessage
  ) internal pure returns (uint256) {
    // Solidity only automatically asserts when dividing by 0
    require(b > 0, errorMessage);
    uint256 c = a / b;

    return c;
  }

  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    return mod(a, b, 'SafeMath: modulo by zero');
  }

  function mod(
    uint256 a,
    uint256 b,
    string memory errorMessage
  ) internal pure returns (uint256) {
    require(b != 0, errorMessage);
    return a % b;
  }
}

library Address {
  function isContract(address account) internal view returns (bool) {
    bytes32 codehash;
    bytes32 accountHash =
      0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
    // solhint-disable-next-line no-inline-assembly
    assembly {
      codehash := extcodehash(account)
    }
    return (codehash != 0x0 && codehash != accountHash);
  }

  function toPayable(address account) internal pure returns (address payable) {
    return address(uint160(account));
  }

  function sendValue(address payable recipient, uint256 amount) internal {
    require(address(this).balance >= amount, 'Address: insufficient balance');

    // solhint-disable-next-line avoid-call-value
    (bool success, ) = recipient.call{ value: amount }('');
    require(
      success,
      'Address: unable to send value, recipient may have reverted'
    );
  }
}

library SafeERC20 {
  using SafeMath for uint256;
  using Address for address;

  function safeTransfer(
    IERC20 token,
    address to,
    uint256 value
  ) internal {
    callOptionalReturn(
      token,
      abi.encodeWithSelector(token.transfer.selector, to, value)
    );
  }

  function safeTransferFrom(
    IERC20 token,
    address from,
    address to,
    uint256 value
  ) internal {
    callOptionalReturn(
      token,
      abi.encodeWithSelector(token.transferFrom.selector, from, to, value)
    );
  }

  function safeApprove(
    IERC20 token,
    address spender,
    uint256 value
  ) internal {
    require(
      (value == 0) || (token.allowance(address(this), spender) == 0),
      'SafeERC20: approve from non-zero to non-zero allowance'
    );
    callOptionalReturn(
      token,
      abi.encodeWithSelector(token.approve.selector, spender, value)
    );
  }

  function safeIncreaseAllowance(
    IERC20 token,
    address spender,
    uint256 value
  ) internal {
    uint256 newAllowance = token.allowance(address(this), spender).add(value);
    callOptionalReturn(
      token,
      abi.encodeWithSelector(token.approve.selector, spender, newAllowance)
    );
  }

  function safeDecreaseAllowance(
    IERC20 token,
    address spender,
    uint256 value
  ) internal {
    uint256 newAllowance =
      token.allowance(address(this), spender).sub(
        value,
        'SafeERC20: decreased allowance below zero'
      );
    callOptionalReturn(
      token,
      abi.encodeWithSelector(token.approve.selector, spender, newAllowance)
    );
  }

  function callOptionalReturn(IERC20 token, bytes memory data) private {
    require(address(token).isContract(), 'SafeERC20: call to non-contract');

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory returndata) = address(token).call(data);
    require(success, 'SafeERC20: low-level call failed');

    if (returndata.length > 0) {
      // Return data is optional
      // solhint-disable-next-line max-line-length
      require(
        abi.decode(returndata, (bool)),
        'SafeERC20: ERC20 operation did not succeed'
      );
    }
  }
}

interface IStrategy {
  function getId() external pure returns (bytes32);

  function approve(address token) external;

  function invest(address token, uint256 assetAmount)
    external
    returns (uint256);

  function redeem(address token, uint256 poolAmount) external returns (uint256);

  function balanceOf(address token, address _owner)
    external
    view
    returns (uint256);

  function getAssetAmount(address token, address _owner)
    external
    view
    returns (uint256);

  function getApr(address token) external view returns (uint256);

  function refresh(address token) external;
}

interface IController {
  function onDeposit(uint256 amount) external;

  function onWithdraw(uint256 amount) external;

  function calculateTokensEarned(
    uint256 amount,
    uint256 share,
    uint256 depositStartBlock
  ) external view returns (uint256); //1e18

  function lockEarnedTokens(uint256 tokenCount) external;
}

contract yStableFarm is ERC20, ERC20Detailed, Ownable {
  using SafeERC20 for IERC20;
  using Address for address;
  using SafeMath for uint256;

  bool paused = false; // pause deposit / withdraw
  uint256 immutable to18;

  address[] strategies;
  address public currentStrategy;
  address public immutable assetToken;

  struct UserData {
    uint256 depositStartBlock;
    uint256 tokensEarned;
    uint256 investedAsset;
  }
  mapping(address => UserData) userData;
  uint256 public marketingRate = 500000000000000000; //50% marketing
  uint256 public investedAsset = 0;
  uint256 public drainedMarketingFee = 0;
  address controllerAddress;

  event Invest(address token, uint256 amountIn, uint256 amountOut);
  event Redeem(address token, uint256 amountIn, uint256 amountOut);

  constructor(
    string memory name,
    string memory symbol,
    uint8 decimals,
    address token
  ) public ERC20Detailed(name, symbol, decimals) {
    to18 = uint256(10)**(18 - decimals);
    assetToken = token;
  }

  // To receive ETH after converting it from USDC
  fallback() external payable {}

  receive() external payable {}

  function withdrawAll() external onlyOwner {
    // ASSETS
    if (currentStrategy != address(0)) {
      _redeem(IStrategy(currentStrategy).balanceOf(assetToken, address(this)));
      // tranfer all of them back to holders (/*todo*/)
      IERC20(assetToken).transfer(
        msg.sender,
        IERC20(assetToken).balanceOf(address(this))
      );
    }
    // ETH
    owner().transfer(address(this).balance);
  }

  function deposit(uint256 _amount) external {
    require(_amount > 0, 'deposit must be greater than 0');
    require(!paused, 'operations paused');

    // Update exchangerate
    IStrategy(currentStrategy).refresh(assetToken);

    // first lock token rewards
    _lockEarnedTokens();

    (uint256 assetAmount, ) = _getAssetAmount();
    uint256 shares =
      _totalSupply > 0 ? (_amount.mul(_totalSupply)).div(assetAmount) : _amount; //y
    _mint(msg.sender, shares);

    UserData storage data = userData[msg.sender];
    data.investedAsset = data.investedAsset.add(_amount);
    investedAsset = investedAsset.add(_amount);

    // Transfer asset from user to this contract
    IERC20(assetToken).safeTransferFrom(msg.sender, address(this), _amount);
    // Invest using delegate
    _invest(_amount);
  }

  function withdraw(uint256 _shares) external {
    require(_shares > 0, 'shares == 0');
    require(_shares <= balanceOf(msg.sender), 'shares > balance');
    require(!paused, 'operations paused');

    // Update exchangerate
    IStrategy(currentStrategy).refresh(assetToken);

    // first lock token rewards
    _lockEarnedTokens();

    (uint256 assetAmount, uint256 fee) = _getAssetAmount();
    // Amount we pay back to the user
    uint256 withdrawAsset = (assetAmount.mul(_shares)).div(_totalSupply);

    // apply changes to investment
    UserData storage data = userData[msg.sender];
    uint256 withdrawInvestedAsset =
      (data.investedAsset.mul(_shares)).div(balanceOf(msg.sender));
    data.investedAsset = data.investedAsset.sub(withdrawInvestedAsset);
    investedAsset = investedAsset.sub(withdrawInvestedAsset);

    // How much has he earned
    uint256 earned = withdrawAsset.sub(withdrawInvestedAsset);

    // fee which has to be retrieved respecting already drained fees
    uint256 ourFee =
      (earned.mul(marketingRate)).div((uint256(1e18).sub(marketingRate)));
    if (drainedMarketingFee > 0)
      ourFee = ourFee.sub((ourFee.mul(drainedMarketingFee)).div(fee));

    log3(
      bytes32(fee),
      bytes32(drainedMarketingFee),
      bytes32(earned),
      bytes32(ourFee)
    );

    // Transform into tokens
    uint256 poolTokenAmount =
      IStrategy(currentStrategy).balanceOf(assetToken, address(this));
    uint256 poolAmount =
      ((withdrawAsset.add(ourFee)).mul(poolTokenAmount)).div(
        IStrategy(currentStrategy).getAssetAmount(assetToken, address(this))
      );
    if (poolAmount > poolTokenAmount) poolAmount = poolTokenAmount;

    _burn(msg.sender, _shares);

    assetAmount = _redeem(poolAmount);

    if (withdrawAsset > assetAmount) withdrawAsset = assetAmount;

    // Send assets back to sender
    IERC20(assetToken).safeTransfer(msg.sender, withdrawAsset);
  }

  function setMarketingRate(uint256 _marketingRate) external onlyOwner {
    marketingRate = _marketingRate;
  }

  function setControllerAddress(address _controllerAddress) external onlyOwner {
    controllerAddress = _controllerAddress;
  }

  function setPause(bool _pause) external onlyOwner {
    paused = _pause;
  }

  function addStrategy(address strategy) external onlyOwner {
    bytes32 newId = IStrategy(strategy).getId();
    // Check if we simply replace / update
    for (uint256 i = 0; i < strategies.length; i++) {
      if (newId == IStrategy(strategies[i]).getId()) {
        if (currentStrategy == strategies[i]) currentStrategy = strategy;
        strategies[i] = strategy;
        return;
      }
    }

    strategies.push(strategy);

    // Approve: allow strategy to withdraw assetTokens owned by this
    (bool success, bytes memory result) =
      strategy.delegatecall(
        abi.encodeWithSelector(IStrategy(strategy).approve.selector, assetToken)
      );
    require(success, 'Approve failed');
    result;

    if (strategies.length == 1) {
      currentStrategy = strategy;
      // invest all assets
      _invest(IERC20(assetToken).balanceOf(address(this)));
    }
  }

  function removeStrategy(address strategy) external onlyOwner {
    // Find the strategy, fill gap.
    uint256 numInserted = 0;
    for (uint256 i = 0; i < strategies.length; i++) {
      if (strategy != strategies[i]) {
        if (numInserted != i) strategies[numInserted] = strategies[i];
        ++numInserted;
      }
    }

    require(strategies.length > numInserted);
    strategies.pop();

    if (strategy == currentStrategy) {
      _redeem(IStrategy(currentStrategy).balanceOf(assetToken, address(this)));
      if (strategies.length > 0) {
        currentStrategy = strategies[0];
        _invest(IERC20(assetToken).balanceOf(address(this)));
      } else {
        currentStrategy = address(0);
      }
    }
  }

  function requestMarketingFee() external {
    require(msg.sender == controllerAddress, 'controller only');
    uint256 fee =
      getRequestableMarketingFee().sub(
        IERC20(assetToken).balanceOf(address(this))
      );

    if (fee == 0) return;

    // Convert fee (assetToken) in poolTokens
    uint256 poolTokenAmount =
      IStrategy(currentStrategy).balanceOf(assetToken, address(this));
    uint256 poolAmount =
      (fee.mul(poolTokenAmount)).div(
        IStrategy(currentStrategy).getAssetAmount(assetToken, address(this))
      );
    if (poolAmount > poolTokenAmount) poolAmount = poolTokenAmount;

    drainedMarketingFee.add(_redeem(poolAmount));
  }

  function rebalance() external {
    require(msg.sender == controllerAddress, 'controller only');
    uint256 maxApr = 0;
    address maxAprStrategy;
    for (uint256 i = 0; i < strategies.length; i++) {
      if (IStrategy(strategies[i]).getApr(assetToken) > maxApr) {
        maxApr = IStrategy(strategies[i]).getApr(assetToken);
        maxAprStrategy = strategies[i];
      }
    }
    if (maxAprStrategy != address(0) && maxAprStrategy != currentStrategy) {
      uint256 redeemed =
        _redeem(
          IStrategy(currentStrategy).balanceOf(assetToken, address(this))
        );
      currentStrategy = maxAprStrategy;
      _invest(redeemed);
    }
  }

  function getUIData(address _user)
    external
    view
    returns (
      uint256 yAmount,
      uint256 assetAmount,
      uint256 tokensEarned,
      uint256 apr,
      uint256 tvl
    )
  {
    (uint256 amount, ) = _getAssetAmount();
    return (
      balanceOf(_user),
      _totalSupply > 0
        ? (amount.mul(balanceOf(msg.sender))).div(_totalSupply)
        : 0,
      _getTokensEarned(_user),
      getApr(),
      amount
    );
  }

  function getUserData(address _user)
    external
    view
    returns (
      uint256 assetIn,
      uint256 blockStart,
      uint256 tokensEarned
    )
  {
    UserData storage data = userData[_user];
    return (data.investedAsset, data.depositStartBlock, data.tokensEarned);
  }

  function getApr() public view returns (uint256) {
    return IStrategy(currentStrategy).getApr(assetToken);
  }

  // return total requestable marketing fee
  function getRequestableMarketingFee() public view returns (uint256) {
    (, uint256 fee) = _getAssetAmount();
    return
      fee.sub(drainedMarketingFee).add(
        IERC20(assetToken).balanceOf(address(this))
      );
  }

  function _getTokensEarned(address _user) public view returns (uint256) {
    UserData storage data = userData[_user];
    return
      data.depositStartBlock > 0 && _totalSupply > 0
        ? data.tokensEarned.add(
          IController(controllerAddress).calculateTokensEarned(
            data.investedAsset.mul(to18),
            (balanceOf(msg.sender).mul(1e18)).div(_totalSupply),
            data.depositStartBlock
          )
        )
        : 0;
  }

  // called on deposit / withdraw time
  function _lockEarnedTokens() private {
    UserData storage data = userData[msg.sender];
    if (data.depositStartBlock > 0 && _totalSupply > 0) {
      uint256 tokensEarned =
        IController(controllerAddress).calculateTokensEarned(
          data.investedAsset.mul(to18),
          (balanceOf(msg.sender).mul(1e18)).div(_totalSupply),
          data.depositStartBlock
        );
      data.tokensEarned = data.tokensEarned.add(tokensEarned);
      IController(controllerAddress).lockEarnedTokens(tokensEarned);
    }
    data.depositStartBlock = block.number;
  }

  // Total Asset amount, reduced by our fee
  function _getAssetAmount() public view returns (uint256 amount, uint256 fee) {
    uint256 assetAmount =
      IStrategy(currentStrategy).getAssetAmount(assetToken, address(this)).add(
        drainedMarketingFee
      );
    // Fix muldiv inaccuraties
    assetAmount = assetAmount > investedAsset ? assetAmount : investedAsset;
    uint256 _fee =
      (assetAmount.sub(investedAsset).mul(marketingRate)).div(1e18);
    return (assetAmount.sub(_fee), _fee);
  }

  function _invest(uint256 assetAmount) private returns (uint256) {
    if (assetAmount > 0) {
      (bool success, bytes memory result) =
        currentStrategy.delegatecall(
          abi.encodeWithSelector(
            IStrategy(currentStrategy).invest.selector,
            assetToken,
            assetAmount
          )
        );
      require(success, 'Invest failed');
      uint256 poolAmount = abi.decode(result, (uint256));
      emit Invest(currentStrategy, assetAmount, poolAmount);
      return poolAmount;
    }
    return 0;
  }

  function _redeem(uint256 poolAmount) private returns (uint256) {
    if (poolAmount > 0) {
      (bool success, bytes memory result) =
        currentStrategy.delegatecall(
          abi.encodeWithSelector(
            IStrategy(currentStrategy).redeem.selector,
            assetToken,
            poolAmount
          )
        );
      require(success, 'Redeem failed');
      uint256 assetAmount = abi.decode(result, (uint256));
      emit Redeem(currentStrategy, poolAmount, assetAmount);
      return assetAmount;
    }
    return 0;
  }
}
