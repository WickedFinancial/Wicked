# Avow / wicked.finance / Green Candle

## Problem
### Tl;Dr quick explanation
We allow users to earn the **best DeFi yields** they can, **with No currency risk**. 
Put simply, getting ~20% rewards from your favourite yearn pool, but not USDs but in EUR(or any other currency user needs to pay his daily expenses in like IR, DNK etc)


# Avow / wicked.finance / Green Candle

## Problem
### Tl;Dr quick explanation
We make it easy for users to protect against currency risk. Almost all of the stable coins, and yield products in DeFi are denominated in USD. This is a problem for people living outside of US whose expenses are in other currencies (Eur, IR, RR). We leverage UMA LSP contracts to achieve this.

#### Example

1. Longoria is living in Europe and has expenses in euros. She is an Eth bull and doesn't want to sell her Eth. She needs money to cover her daily expenses, so she takes out a loan against her Eth. The problem is, all main borrowing protocols allow her to take a loan only in USD stable coins. With the help of our protocol, she can take a debt in LUSD but have exposure to Euro. She will simply draw 10 000 LUSD against her collateral and uses 20% to protect against dollar appreciation. She goes to wicked.financial to buy a currency protection against dollar appreciation.  She will open a new USD/EUR position and sells her short tokens to Shorty. 

2. Shorty buys short tokens from Longoria. Now he has either insured for Euro depreciation against US dollar, or perhaps he just thinks that dollar (compared to euro) will go up. As with Longoria, he only needs one fifth (20%) of value to insure his Euro holdings or stands to make five times his collateral if he is speculator. 

### Home page text
**The protocol for currency hedging**
Wicked protocol allows you to hedge your currency risk or speculate on its price. 
[Learn more](https://wicked.financial/about)
> takes user to about page/section with thorough explanation of how it works

[Go to dashboard](https://wicked.financial/dashboard) 
> takes user to dashboard page/section which would show positions that a user can take.





### Longer explanation

Our platform can be used by people who want to partake in high DeFi yields but do not want to be denominated in US dollars. 
This is true for most people living outside US, who pay their daily expenses in euro, rupee or any other currency. 

### how it works
Our platform works with any standard ERC20 token, that is provided by a MarketMaker as a collateral. User needs to choose  his local currency, desired intrest bearing token, expiry and amount.
For examle, Alice will pick  her local currency, in this case euro, yearn vault [crvUSDP](https://yearn.finance/vaults/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417). She will choose to insure position of size 10 000 Euro for the next three months. 

There are two main smart contracts we leverage for this functionality. LSP contract from UMA protocol and AMM form balancer. 

### Under the hood
#### Roles

**marketMaker**
There needs to be marketMaker(could be us) who is the first to create the position. He is "market neutral", if the LS pair payout ratio dictated by the oracle (USD/EUR)  at expiry isn't much different to the ratio at creation, it could be highly volatile during the contract lifetime. In fact this is prefered by the MarketMaker as his profits depend entirily on the AMM fees. e.g. if USD/EUR is 1.2 at creation, the price can go to 0.9 or 1.5, but as long as it approaches 1.2 at expiry, the marketMaker will be happy to take the position. If the price at the expiry of the LSP contract is significantly different from the creation price, he could be in loss. To summarize, his *profit = AMMfees - impermanentLoss)*

**insuree**
The position of insuree(Alice) is as follows. She is long the collateral of the LSP contract and usually pays premium for this. This is effectively done by providing collateral and minting long+short tokens and then selling her shortTokens to the amm discount usually at a discounted price. 
		

**insurer**
The position of insurer(Bob) is as follows. He is short the collateral of the LSP contract and usually receives premium for this. This is effectively done by providing collateral and minting long+short tokens and then selling his longTokens to the amm discount usually at a discounted price. 

**Things to observe**
At the time of minting LSP tokens the minter(sponsor) has the the same exposure as if he was just holding the collateral. 
It is when he is holding *only* either long or short token that he is taking up a position. Therefore the only way how he can become long is to either buy long tokens or mint both and sell short tokens and vice versa.
In a perfect world, we would have have someone willing to go short for everyone going long and vice versa. In reality this is not the case. Therefore we need to incentivize the other side every time there is a more people who want to go long than those willing to go short and vice versa.
This is done by with the help of AMM. Since Alice(long) needs to hold only longTokens, the mechanism needs to make this possible and easy for her. She would send in the collateral, mint LSpair and sold shortTokens to the AMM for which she would receive longTokens. The premium she is paying for this is determined by the amount of shortTokens she receives for her longTokens from the AMM. She will usually receive less then is the "true price"(determined by the oracle). Our main added value is, that we are removing the complexity and providing Alice with the option to execute this trade easily and doing the calculation to determine how many percent of her collateral she is paying for this protection. 

#### Contract life cycle 
Actions (marked by numbers)
- Initialisation 
	- marketMaker
		1. marketMaker(could be us) needs to create the LSP contract with given parameters
		2. marketMaker initializes AMM for LS token pair.
-  lifetime (users)
	-  makret participants
		1. makretParticipants can open long or short position, by minting token pair and selling one token of the pair to the AMM.
		2. makretParticipants can close their position by buying the token they do not hold from the AMM and redeeming the pair for the collateral.
	-  liquidity providers
		1.  can provide liquidity to the AMM in exchange for trading fees
-  expiry
	 1. users get payout in collateral from the LSP contract in the ratio specified by the payout function. 
	2.  marketMaker & liquidity providers withdraw all the LS tokens from the AMMs and claims the collateral from the LSP contract.

#### Strengths of the mechanism
- Once market is established, anyone can become either long or short, without the need to look for the other party
- The mechanism selfregulates by changing price in the AMM based on the market demand of long and short tokens.
#### Weaknesses of the mechanism
- every market needs to be established by a marketMaker. He needs to pay for the gass of deploying the LSP contract. He is willing to take the impermanent loss in exchange for AMM fees. 
- initial liquidity 
	- the more liquidity marketMaker is willing to provide, the cheaper it is for market participants to open their long/short positions. The more collateral he is providing, the less relative profit he will receive and the higher risk he is taking. He needs to strike the right balance, since if he provides too little liquidity, there will be very few participants since it becomes very expensive for them to open their positions. 

#### User flow + UI description

##### Opening positions
0. There are two buttons on the homepage "insure" or "provide insurance"(site could change color scheme based on which mode is selected).

	1. Alice will come to the homepage, there are two buttons, "insure" and "provide insurance" she will click "insure".

	1. She wiil pick her local currency she wants to insure against from the currencies available
	2. Then new page will come up that will show her the investment options arranged as tiles
		- Every Investment option element will show collateral token + net APR in **bold** + gross APR minus protection in grey. She picks yearn vault [crvUSDP](https://yearn.finance/vaults/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417)  with APR of **12%**(15%-3%) of since it currently gives her the best profit.  
	3. She will put in how much crvUSDP tokens she wants to insure. Popup will inform her, that due the the slippage her APR would be 10%. If she accepts, the transaction will get generated and sent to her for confirmation.  After that she will receive long tokens to her address.

1. Bob will come to the homepage, there are two buttons, "insure" and "provide insurance" he will click "provide insurance".
2. He will see a panel / list of positions he can take. Every position(element) will include APR for protection, APR for collateral, Combined APR, currency pair, u derlying of collateral(USD only for now) and expiry.

#### Closing positions (before expiry)
#### Closing positions (after expiry)




#### Example


1. Alice - wants to get big defi yields which are on USD denominated Yearn vault, but she is living in Europe, hence doesn't want to be exposed to dollar fluctuations. She is willing to pay for this and get a little bit worse earning rate than she would get. She will get 13% APR instead of 15% should would otherwise get.

2. Bob - is a professional market maker. He can provide Alice this serving of hedging against dollar fluctuations for 2% yield. If he wants to be market neutral he can hedge this position on centralized exchange. 

### Longer explanation

Our platform can be used by people who want to partake in high DeFi yields but do not want to be denominated in US dollars. 
This is true for most people living outside US, who pay their daily expenses in euro, rupee or any other currency. 

### how it works
Our platform works with any standard ERC20 token, that is provided by a MarketMaker as a collateral. User needs to choose  his local currency, desired intrest bearing token, expiry and amount.
For examle, Alice will pick  her local currency, in this case euro, yearn vault [crvUSDP](https://yearn.finance/vaults/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417). She will choose to insure position of size 10 000 Euro for the next three months. 

There are two main smart contracts we leverage for this functionality. LSP contract from UMA protocol and AMM form balancer. 

### Under the hood
#### Roles

**marketMaker**
There needs to be marketMaker(could be us) who is the first to create the position. He is "market neutral", if the LS pair payout ratio dictated by the oracle (USD/EUR)  at expiry isn't much different to the ratio at creation, it could be highly volatile during the contract lifetime. In fact this is prefered by the MarketMaker as his profits depend entirily on the AMM fees. e.g. if USD/EUR is 1.2 at creation, the price can go to 0.9 or 1.5, but as long as it approaches 1.2 at expiry, the marketMaker will be happy to take the position. If the price at the expiry of the LSP contract is significantly different from the creation price, he could be in loss. To summarize, his *profit = AMMfees - impermanentLoss)*

**insuree**
The position of insuree(Alice) is as follows. She is long the collateral of the LSP contract and usually pays premium for this. This is effectively done by providing collateral and minting long+short tokens and then selling her shortTokens to the amm discount usually at a discounted price. 
		

**insurer**
The position of insurer(Bob) is as follows. He is short the collateral of the LSP contract and usually receives premium for this. This is effectively done by providing collateral and minting long+short tokens and then selling his longTokens to the amm discount usually at a discounted price. 

**Things to observe**
At the time of minting LSP tokens the minter(sponsor) has the the same exposure as if he was just holding the collateral. 
It is when he is holding *only* either long or short token that he is taking up a position. Therefore the only way how he can become long is to either buy long tokens or mint both and sell short tokens and vice versa.
In a perfect world, we would have have someone willing to go short for everyone going long and vice versa. In reality this is not the case. Therefore we need to incentivize the other side every time there is a more people who want to go long than those willing to go short and vice versa.
This is done by with the help of AMM. Since Alice(long) needs to hold only longTokens, the mechanism needs to make this possible and easy for her. She would send in the collateral, mint LSpair and sold shortTokens to the AMM for which she would receive longTokens. The premium she is paying for this is determined by the amount of shortTokens she receives for her longTokens from the AMM. She will usually receive less then is the "true price"(determined by the oracle). Our main added value is, that we are removing the complexity and providing Alice with the option to execute this trade easily and doing the calculation to determine how many percent of her collateral she is paying for this protection. 

#### Contract life cycle 
Actions (marked by numbers)
- Initialisation 
	- marketMaker
		1. marketMaker(could be us) needs to create the LSP contract with given parameters
		2. marketMaker initializes AMM for LS token pair.
-  lifetime (users)
	-  makret participants
		1. makretParticipants can open long or short position, by minting token pair and selling one token of the pair to the AMM.
		2. makretParticipants can close their position by buying the token they do not hold from the AMM and redeeming the pair for the collateral.
	-  liquidity providers
		1.  can provide liquidity to the AMM in exchange for trading fees
-  expiry
	 1. users get payout in collateral from the LSP contract in the ratio specified by the payout function. 
	2.  marketMaker & liquidity providers withdraw all the LS tokens from the AMMs and claims the collateral from the LSP contract.

#### Strengths of the mechanism
- Once market is established, anyone can become either long or short, without the need to look for the other party
- The mechanism selfregulates by changing price in the AMM based on the market demand of long and short tokens.
#### Weaknesses of the mechanism
- every market needs to be established by a marketMaker. He needs to pay for the gass of deploying the LSP contract. He is willing to take the impermanent loss in exchange for AMM fees. 
- initial liquidity 
	- the more liquidity marketMaker is willing to provide, the cheaper it is for market participants to open their long/short positions. The more collateral he is providing, the less relative profit he will receive and the higher risk he is taking. He needs to strike the right balance, since if he provides too little liquidity, there will be very few participants since it becomes very expensive for them to open their positions. 

#### User flow + UI description

##### Opening positions
0. There are two buttons on the homepage "insure" or "provide insurance"(site could change color scheme based on which mode is selected).

	1. Alice will come to the homepage, there are two buttons, "insure" and "provide insurance" she will click "insure".

	1. She wiil pick her local currency she wants to insure against from the currencies available
	2. Then new page will come up that will show her the investment options arranged as tiles
		- Every Investment option element will show collateral token + net APR in **bold** + gross APR minus protection in grey. She picks yearn vault [crvUSDP](https://yearn.finance/vaults/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417)  with APR of **12%**(15%-3%) of since it currently gives her the best profit.  
	3. She will put in how much crvUSDP tokens she wants to insure. Popup will inform her, that due the the slippage her APR would be 10%. If she accepts, the transaction will get generated and sent to her for confirmation.  After that she will receive long tokens to her address.

1. Bob will come to the homepage, there are two buttons, "insure" and "provide insurance" he will click "provide insurance".
2. He will see a panel / list of positions he can take. Every position(element) will include APR for protection, APR for collateral, Combined APR, currency pair, u derlying of collateral(USD only for now) and expiry.

#### Closing positions (before expiry)
#### Closing positions (after expiry)



