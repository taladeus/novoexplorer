var credentials = require("./credentials.js");
var coins = require("./coins.js");

var currentCoin = "NBC";

module.exports = {
	cookiePassword: "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
	demoSite: false,
	coin: currentCoin,

	rpcBlacklist:[
		"addnode",
		"backupwallet",
		"bumpfee",
		"clearbanned",
		"createmultisig",
		"disconnectnode",
		"dumpprivkey",
		"dumpwallet",
		"encryptwallet",
		"generate",
		"generatetoaddress",
		"getaccountaddrss",
		"getaddressesbyaccount",
		"getbalance",
		"getnewaddress",
		"getrawchangeaddress",
		"getreceivedbyaccount",
		"getreceivedbyaddress",
		"gettransaction",
		"getunconfirmedbalance",
		"getwalletinfo",
		"importaddress",
		"importmulti",
		"importprivkey",
		"importprunedfunds",
		"importpubkey",
		"importwallet",
		"keypoolrefill",
		"listaccounts",
		"listaddressgroupings",
		"listlockunspent",
		"listreceivedbyaccount",
		"listreceivedbyaddress",
		"listsinceblock",
		"listtransactions",
		"listunspent",
		"listwallets",
		"lockunspent",
		"logging",
		"move",
		"preciousblock",
		"pruneblockchain",
		"removeprunedfunds",
		"rescanblockchain",
		"savemempool",
		"sendfrom",
		"sendmany",
		"sendtoaddress",
		"sendrawtransaction",
		"setaccount",
		"setban",
		"setnetworkactive",
		"signmessage",
		"signmessagewithprivatekey",
		"signrawtransaction",
		"stop",
		"submitblock",
		"verifychain",
		"walletlock",
		"walletpassphrase",
		"walletpassphrasechange",
	],

	// https://uasf.saltylemon.org/electrum
	electrumXServers:[
		// set host & port of electrum servers to connect to
		// protocol can be "tls" or "tcp", it defaults to "tcp" if port is 50001 and "tls" otherwise
		// {host: "sv1.hsmiths.com", port:60004, protocol: "ssl"},
	    // {host: "satoshi.vision.cash", port:50002, protocol: "ssl"},
		// {host: "electrum.qtornado.com", port:50001, protocol: "tcp"},
		// {host: "electrum.coinucopia.io", port:50001, protocol: "tcp"},

	],

	site: {
		blockTxPageSize:10,
		addressTxPageSize:10,
		txMaxInput:10,
		browseBlocksPageSize:20
	},

	credentials: credentials,

	// Edit "ipWhitelistForRpcCommands" regex to limit access to RPC Browser / Terminal to matching IPs
	ipWhitelistForRpcCommands:/^(127\.0\.0\.1)?(\:\:1)?$/,

	siteTools:[


		{name:"Node Status", url:"/node-status", desc:"Summary of this node: version, network, uptime, etc.", fontawesome:"fas fa-broadcast-tower"},
		{name:"Peers", url:"/peers", desc:"Detailed info about the peers connected to this node.", fontawesome:"fas fa-sitemap"},

		{name:"Browse Blocks", url:"/blocks", desc:"Browse all blocks in the blockchain.", fontawesome:"fas fa-cubes"},
		{name:"Transaction Stats", url:"/tx-stats", desc:"See graphs of total transaction volume and transaction rates.", fontawesome:"fas fa-chart-bar"},

		{name:"Mempool Summary", url:"/mempool-summary", desc:"Detailed summary of the current mempool for this node.", fontawesome:"fas fa-clipboard-list"},
		{name:"Unconfirmed Transactions", url:"/unconfirmed-tx", desc:"Browse unconfirmed/pending transactions.", fontawesome:"fas fa-unlock-alt"},

		// {name:"Notifications", url:"/notifications", desc:"Get notifications on slack, twitter, telegram...", fontawesome:"fas fa-bullhorn"},

	],

	donationAddresses:{
		coins:["NBC"],
		sites:{"NBC":"https://novoblocks.info"},

		"NBC":{address:"1A3fgHqx9eg1DS3ThfK72YphcysjemHcix"},
	},
};
