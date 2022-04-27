var Decimal = require("decimal.js");
var request = require("request");

var config = require("./config.js");
var coins = require("./coins.js");
var coinConfig = coins[config.coin];

var ipCache = {};

var memoPrefixes = [
	{ prefix: '365', action: 'Set name' },
	{ prefix: '621', action: 'Post memo' },
	{ prefix: '877', action: 'Reply to memo' },
	{ prefix: '1133', action: 'Like / tip memo' },
	{ prefix: '1389', action: 'Set profile text' },
	{ prefix: '1645', action: 'Follow user' },
	{ prefix: '1901', action: 'Unfollow user' },
	{ prefix: '2669', action: 'Set profile picture' },
	// {prefix:'2925', action:'Repost memo'}, planned
	{ prefix: '3181', action: 'Post topic message' },
	{ prefix: '3437', action: 'Topic follow' },
	{ prefix: '3693', action: 'Topic unfollow' },
	{ prefix: '4205', action: 'Create poll' },
	{ prefix: '4973', action: 'Add poll option' },
	{ prefix: '5229', action: 'Poll vote' }
	// {prefix:'9325', action:'Send money'}, planned
  ];

var exponentScales = [
	{val:1000000000000000000000000000000000, name:"?", abbreviation:"V", exponent:"33"},
	{val:1000000000000000000000000000000, name:"?", abbreviation:"W", exponent:"30"},
	{val:1000000000000000000000000000, name:"?", abbreviation:"X", exponent:"27"},
	{val:1000000000000000000000000, name:"yotta", abbreviation:"Y", exponent:"24"},
	{val:1000000000000000000000, name:"zetta", abbreviation:"Z", exponent:"21"},
	{val:1000000000000000000, name:"exa", abbreviation:"E", exponent:"18"},
	{val:1000000000000000, name:"peta", abbreviation:"P", exponent:"15"},
	{val:1000000000000, name:"tera", abbreviation:"T", exponent:"12"},
	{val:1000000000, name:"giga", abbreviation:"G", exponent:"9"},
	{val:1000000, name:"mega", abbreviation:"M", exponent:"6"},
	{val:1000, name:"kilo", abbreviation:"K", exponent:"3"}
];

function redirectToConnectPageIfNeeded(req, res) {
	if (!req.session.host) {
		req.session.redirectUrl = req.originalUrl;
		
		res.redirect("/");
		res.end();
		
		return true;
	}
	
	return false;
}

function getOpReturnTags(hex){
	var result = {};

	var ss = hex.split(' ');
	//var tsp = ss[1].substring(0, 8)
	//var scriptBody = ss[1].substring(8)
	if(ss && ss.length > 1){
		let msp = ss[1].split(0)[0];	
		var mpr = memoPrefixes.filter(p => { return p.prefix === msp })
		if (mpr && mpr.length > 0) {
		result.tag = "memo.cash";
		result.memoCashPrefix = mpr[0].prefix;
		result.action = mpr[0].action	;
		return result;	
		}

		var ascii = hex2ascii(ss[1]);
		if(ascii.includes("yours.org") && ascii.length < 10) {
			result.tag = "yours.org";
			return result;
		}
	}


	return result;
}


function hex2ascii(hex) {
	var str = "";
	for (var i = 0; i < hex.length; i += 2) {
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	
	return str;
}

function splitArrayIntoChunks(array, chunkSize) {
	var j = array.length;
	var chunks = [];
	
	for (var i = 0; i < j; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}

	return chunks;
}

function getRandomString(length, chars) {
    var mask = '';
	
    if (chars.indexOf('a') > -1) {
		mask += 'abcdefghijklmnopqrstuvwxyz';
	}
	
    if (chars.indexOf('A') > -1) {
		mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	}
	
    if (chars.indexOf('#') > -1) {
		mask += '0123456789';
	}
    
	if (chars.indexOf('!') > -1) {
		mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
	}
	
    var result = '';
    for (var i = length; i > 0; --i) {
		result += mask[Math.floor(Math.random() * mask.length)];
	}
	
	return result;
}

var formatCurrencyCache = {};

function formatCurrencyAmountWithForcedDecimalPlaces(amount, formatType, forcedDecimalPlaces) {
	if (formatCurrencyCache[formatType]) {
		var dec = new Decimal(amount);
		dec = dec.times(formatCurrencyCache[formatType].multiplier);

		var decimalPlaces = formatCurrencyCache[formatType].decimalPlaces;
		if (decimalPlaces == 0 && dec < 1) {
			decimalPlaces = 5;
		}

		if (forcedDecimalPlaces >= 0) {
			decimalPlaces = forcedDecimalPlaces;
		}

		return addThousandsSeparators(dec.toDecimalPlaces(decimalPlaces)) + " " + formatCurrencyCache[formatType].name;
	}

	for (var x = 0; x < coins[config.coin].currencyUnits.length; x++) {
		var currencyUnit = coins[config.coin].currencyUnits[x];

		for (var y = 0; y < currencyUnit.values.length; y++) {
			var currencyUnitValue = currencyUnit.values[y];

			if (currencyUnitValue == formatType) {
				formatCurrencyCache[formatType] = currencyUnit;

				var dec = new Decimal(amount);
				dec = dec.times(currencyUnit.multiplier);

				var decimalPlaces = currencyUnit.decimalPlaces;
				if (decimalPlaces == 0 && dec < 1) {
					decimalPlaces = 5;
				}

				if (forcedDecimalPlaces >= 0) {
					decimalPlaces = forcedDecimalPlaces;
				}

				return addThousandsSeparators(dec.toDecimalPlaces(decimalPlaces)) + " " + currencyUnit.name;
			}
		}
	}
	
	return amount;
}

function formatCurrencyAmount(amount, formatType) {
	return formatCurrencyAmountWithForcedDecimalPlaces(amount, formatType, -1);
}

function formatCurrencyAmountInSmallestUnits(amount, forcedDecimalPlaces) {
	return formatCurrencyAmountWithForcedDecimalPlaces(amount, coins[config.coin].currencyUnits[coins[config.coin].currencyUnits.length - 1].name, forcedDecimalPlaces);
}

// ref: https://stackoverflow.com/a/2901298/673828
function addThousandsSeparators(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	return parts.join(".");
}

function formatExchangedCurrency(amount) {
	if (global.exchangeRate != null) {
		var dec = new Decimal(amount);
		dec = dec.times(global.exchangeRate);

		return addThousandsSeparators(dec.toDecimalPlaces(2)) + " " + coins[config.coin].exchangeRateData.exchangedCurrencyName;
	}

	return "";
}

function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function seededRandomIntBetween(seed, min, max) {
	var rand = seededRandom(seed);
	return (min + (max - min) * rand);
}

function logMemoryUsage() {
	var mbUsed = process.memoryUsage().heapUsed / 1024 / 1024;
	mbUsed = Math.round(mbUsed * 100) / 100;

	var mbTotal = process.memoryUsage().heapTotal / 1024 / 1024;
	mbTotal = Math.round(mbTotal * 100) / 100;

	//console.log("memoryUsage: heapUsed=" + mbUsed + ", heapTotal=" + mbTotal + ", ratio=" + parseInt(mbUsed / mbTotal * 100));
}

function getMinerFromCoinbaseTx(tx) {
	if (tx == null || tx.vin == null || tx.vin.length == 0) {
		return null;
	}
	
	if (global.miningPoolsConfigs) {
		for (var i = 0; i < global.miningPoolsConfigs.length; i++) {
			var miningPoolsConfig = global.miningPoolsConfigs[i];

			for (var payoutAddress in miningPoolsConfig.payout_addresses) {
				if (miningPoolsConfig.payout_addresses.hasOwnProperty(payoutAddress)) {
					if (tx.vout && tx.vout.length > 0 && tx.vout[0].scriptPubKey && tx.vout[0].scriptPubKey.addresses && tx.vout[0].scriptPubKey.addresses.length > 0) {
						if (tx.vout[0].scriptPubKey.addresses[0] == payoutAddress) {
							var minerInfo = miningPoolsConfig.payout_addresses[payoutAddress];
							minerInfo.identifiedBy = "payout address " + payoutAddress;

							return minerInfo;
						}
					}
				}
			}

			for (var coinbaseTag in miningPoolsConfig.coinbase_tags) {
				if (miningPoolsConfig.coinbase_tags.hasOwnProperty(coinbaseTag)) {
					if (hex2ascii(tx.vin[0].coinbase).indexOf(coinbaseTag) != -1) {
						var minerInfo = miningPoolsConfig.coinbase_tags[coinbaseTag];
						minerInfo.identifiedBy = "coinbase tag '" + coinbaseTag + "'";

						return minerInfo;
					}
				}
			}
		}
	}

	if(tx.vin[0].coinbase)
	{
		return hex2ascii(tx.vin[0].coinbase);
	}
	
	return null
}

function getTxTotalInputOutputValues(tx, txInputs, blockHeight) {
	var totalInputValue = new Decimal(0);
	var totalOutputValue = new Decimal(0);

	try {
		if(Array.isArray(tx.vin)){
		for (var i = 0; i < tx.vin.length; i++) {
			if (tx.vin[i].coinbase) {
				totalInputValue = totalInputValue.plus(new Decimal(coinConfig.blockRewardFunction(blockHeight)));

			} else {
				var txInput = txInputs[i];

				if (txInput) {
					try {
						var vout = txInput.vout[tx.vin[i].vout];
						if (vout.value) {
							totalInputValue = totalInputValue.plus(new Decimal(vout.value));
						}
					} catch (err) {
						console.log("Error getting tx.totalInputValue: err=" + err + ", txid=" + tx.txid + ", index=tx.vin[" + i + "]");
					}
				}
			}
		}
		
		for (var i = 0; i < tx.vout.length; i++) {
			totalOutputValue = totalOutputValue.plus(new Decimal(tx.vout[i].value));
		}
	}
	} catch (err) {
		console.log("Error computing total input/output values for tx: err=" + err + ", tx=" + JSON.stringify(tx) + ", txInputs=" + JSON.stringify(txInputs) + ", blockHeight=" + blockHeight);
	}

	return {input:totalInputValue, output:totalOutputValue};
}

function getBlockTotalFeesFromCoinbaseTxAndBlockHeight(coinbaseTx, blockHeight) {
	if (coinbaseTx == null) {
		return 0;
	}

	var blockReward = coinConfig.blockRewardFunction(blockHeight);

	var totalOutput = new Decimal(0);
	for (var i = 0; i < coinbaseTx.vout.length; i++) {
		var outputValue = coinbaseTx.vout[i].value;
		if (outputValue > 0) {
			totalOutput = totalOutput.plus(new Decimal(outputValue));
		}
	}

	return totalOutput.minus(new Decimal(blockReward));
}

function refreshExchangeRate() {
	if (coins[config.coin].exchangeRateData) {
		request(coins[config.coin].exchangeRateData.jsonUrl, function(error, response, body) {
			if (!error && response && response.statusCode && response.statusCode == 200) {
				var responseBody = JSON.parse(body);

				var exchangeRate = coins[config.coin].exchangeRateData.responseBodySelectorFunction(responseBody);
				if (exchangeRate > 0) {
					global.exchangeRate = exchangeRate;
					global.exchangeRateUpdateTime = new Date();

					console.log("Using exchange rate: " + global.exchangeRate + " USD/" + coins[config.coin].name + " starting at " + global.exchangeRateUpdateTime);

				} else {
					console.log("Unable to get exchange rate data");
				}
			} else {
				console.log("Error:");
				console.log(error);
				console.log("Response:");
				console.log(response);
			}
		});
	}
}

// Uses IPStack.com API
function geoLocateIpAddresses(ipAddresses) {
	return new Promise(function(resolve, reject) {
		var chunks = splitArrayIntoChunks(ipAddresses, 1);

		var promises = [];
		for (var i = 0; i < chunks.length; i++) {
			var ipStr = "";
			for (var j = 0; j < chunks[i].length; j++) {
				if (j > 0) {
					ipStr = ipStr + ",";
				}

				ipStr = ipStr + chunks[i][j];
			}

			if (ipCache[ipStr] != null) {
				promises.push(new Promise(function(resolve2, reject2) {
					resolve2(ipCache[ipStr]);
				}));

			} else if (config.credentials.ipStackComApiAccessKey && config.credentials.ipStackComApiAccessKey.trim().length > 0) {
				var apiUrl = "http://api.ipstack.com/" + ipStr + "?access_key=" + config.credentials.ipStackComApiAccessKey;
				promises.push(new Promise(function(resolve2, reject2) {
					request(apiUrl, function(error, response, body) {
						if (error) {
							reject2(error);

						} else {
							resolve2(response);
						}
					});
				}));
			} else {
				promises.push(new Promise(function(resolve2, reject2) {
					resolve2(null);
				}));
			}
		}

		Promise.all(promises).then(function(results) {
			var ipDetails = {ips:[], detailsByIp:{}};

			for (var i = 0; i < results.length; i++) {
				var res = results[i];
				if (res != null && res["statusCode"] == 200) {
					var resBody = JSON.parse(res["body"]);
					var ip = resBody["ip"];

					ipDetails.ips.push(ip);
					ipDetails.detailsByIp[ip] = resBody;

					if (ipCache[ip] == null) {
						ipCache[ip] = res;
					}
				}
			}

			resolve(ipDetails);
		});
	});
}

function parseExponentStringDouble(val) {
	var [lead,decimal,pow] = val.toString().split(/e|\./);
	return +pow <= 0 
		? "0." + "0".repeat(Math.abs(pow)-1) + lead + decimal
		: lead + ( +pow >= decimal.length ? (decimal + "0".repeat(+pow-decimal.length)) : (decimal.slice(0,+pow)+"."+decimal.slice(+pow)));
}

function formatLargeNumber(n, decimalPlaces) {
	for (var i = 0; i < exponentScales.length; i++) {
		var item = exponentScales[i];

		var fraction = new Decimal(n / item.val);
		if (fraction >= 1) {
			return [fraction.toDecimalPlaces(decimalPlaces), item];
		}
	}

	return [new Decimal(n).toDecimalPlaces(decimalPlaces), {}];
}


module.exports = {
	redirectToConnectPageIfNeeded: redirectToConnectPageIfNeeded,
	hex2ascii: hex2ascii,
	splitArrayIntoChunks: splitArrayIntoChunks,
	getRandomString: getRandomString,
	formatCurrencyAmount: formatCurrencyAmount,
	formatCurrencyAmountWithForcedDecimalPlaces: formatCurrencyAmountWithForcedDecimalPlaces,
	formatExchangedCurrency: formatExchangedCurrency,
	addThousandsSeparators: addThousandsSeparators,
	formatCurrencyAmountInSmallestUnits: formatCurrencyAmountInSmallestUnits,
	seededRandom: seededRandom,
	seededRandomIntBetween: seededRandomIntBetween,
	logMemoryUsage: logMemoryUsage,
	getMinerFromCoinbaseTx: getMinerFromCoinbaseTx,
	getBlockTotalFeesFromCoinbaseTxAndBlockHeight: getBlockTotalFeesFromCoinbaseTxAndBlockHeight,
	refreshExchangeRate: refreshExchangeRate,
	parseExponentStringDouble: parseExponentStringDouble,
	formatLargeNumber: formatLargeNumber,
	geoLocateIpAddresses: geoLocateIpAddresses,
	getTxTotalInputOutputValues: getTxTotalInputOutputValues,
	getOpReturnTags: getOpReturnTags
};
