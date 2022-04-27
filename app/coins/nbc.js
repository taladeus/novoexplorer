var Decimal = require("decimal.js");
Decimal8 = Decimal.clone({ precision:8, rounding:8 });

var btcCurrencyUnits = [
	{
		name:"NBC",
		multiplier:1,
		default:true,
		values:["", "nbc", "NBC"],
		decimalPlaces:8
	},
	{
		name:"mNBC",
		multiplier:1000,
		values:["mNBC"],
		decimalPlaces:5
	},
	{
		name:"bits",
		multiplier:1000000,
		values:["bits"],
		decimalPlaces:2
	},
	{
		name:"sat",
		multiplier:100000000,
		values:["sat", "satoshi"],
		decimalPlaces:0
	}
];

module.exports = {
	name:"NBC",
	ticker:"NBC",
	logoUrl:"/img/logo/nbc.png",
	siteTitle:"novoblocks.info",
	pageTitle: "Novo Bitcoin Explorer",
	siteDescriptionHtml:"<b>novoblocks.info - Novo Bitcoin Explorer</b> is <a href='novoblocks.info).",
	nodeTitle:"Novo Bitcoin Full Node",
	nodeUrl:"https://github.com/novobitcoin/novobitcoin-release/releases",
	// demoSiteUrl: "https://btc.chaintools.io",
	miningPoolsConfigUrls:[
		 "https://raw.githubusercontent.com/waqas64/Blockchain-Known-Pools/master/pools.json",
		 "https://raw.githubusercontent.com/btccom/Blockchain-Known-Pools/master/pools.json"
	],
	maxBlockWeight: 4000000,
	currencyUnits:btcCurrencyUnits,
	currencyUnitsByName:{"NBC":btcCurrencyUnits[0], "mNBC":btcCurrencyUnits[1], "bits":btcCurrencyUnits[2], "sat":btcCurrencyUnits[3]},
	baseCurrencyUnit:btcCurrencyUnits[3],
	feeSatoshiPerByteBucketMaxima: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 75, 100, 150],
	genesisBlockHash: "0000000000b3de1ef5bd7c20708dbafc3df0441877fa4a59cda22b4c2d4f39ce",
	genesisCoinbaseTransactionId: "cbdb156beade97595e5d6ff8b0ee609033030bec41851576e30c4f5a68e2cbeb",
	genesisCoinbaseTransaction: {
		"hex": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0804ffff001d02fd04ffffffff0100f2052a01000000434104f5eeb2b10c944c6b9fbcfff94c35bdeecd93df977882babc7f3a2cf7f5c81d3b09a68db7f0e04f21de5d4230e75e6dbe7ad16eefe0d4325a62067dc6f369446aac00000000",
		"txid": "cbdb156beade97595e5d6ff8b0ee609033030bec41851576e30c4f5a68e2cbeb",
		"hash": "cbdb156beade97595e5d6ff8b0ee609033030bec41851576e30c4f5a68e2cbeb",
		"size": 222,
		"vsize": 222,
		"version": 1,
		"confirmations":83613,
		"vin": [
			{
				"coinbase": "044a78de11325468652054696d65732030322f4465632f3230323120466f75727468206a616220746f2066696768742076617269616e7473",
				"sequence": 4294967295
			}
		],
		"vout": [
			{
				"value": 2000000,
				"n": 0,
				"scriptPubKey": {
					"asm": "OP_DUP OP_HASH160 0567b5f0544536d023fbb123b830f626d9c80389 OP_EQUALVERIFY OP_CHECKSIG",
					"hex": "76a9140567b5f0544536d023fbb123b830f626d9c8038988ac",
					"reqSigs": 1,
					"type": "pubkey",
					"addresses": [
						"1VacuUmCWinPGg4ecD5WPYPFGezUKRjzs"
					]
				}
			}
		],
		"blockhash": "0000000000b3de1ef5bd7c20708dbafc3df0441877fa4a59cda22b4c2d4f39ce",
		"time": 1638457291,
		"blocktime": 1638457291
	},
	genesisCoinbaseOutputAddressScripthash:"8b01df4e368ea28f8dc0423bcf7a4923e3a12d307c875e47a0cfbf90b5c39161",
	
	blockRewardFunction:function(blockHeight) {
		var eras = [ new Decimal8(2000000) ];
		for (var i = 1; i < 34; i++) {
			var previous = eras[i - 1];
			eras.push(new Decimal8(previous).dividedBy(2));
		}

		var index = Math.floor(blockHeight / 210000);

		return eras[index];
	}
};