/**
 * Copyright (C) 2017 CognitoProtocol.com
 * All Rights Reserved.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
var CognitoExt = function() {};

cognitoQuery(document).ready(function() {
	cognitoQuery.ajaxSetup({
		cache: true
	});
});

CognitoExt.walletCache = {};

chrome.runtime.onMessage.addListener (
    function(msg, sender, sendResponse) {
        if(msg.applicationCode == "cognitoprotocol") {
			if(msg.action === "resolve") {
				CognitoExt.resolveWalletAddress(msg.addr);
			}
        }
    }
);

CognitoExt.generateNewCacheKey = function() {
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    return hex;
};

var cachekey;
chrome.storage.sync.get("cachekey", function (obj) {
    if(typeof obj === "undefined" || obj == null || typeof obj.cachekey === "undefined" || obj.cachekey == null) {
		console.log("No cachekey");
		cachekey = CognitoExt.generateNewCacheKey();
		chrome.storage.sync.set({"cachekey": cachekey}, function() {});
		var extensionVer = CognitoExt.getExtensionVer();
		var thanksUrl = "https://chrome.cognitoprotocol.com/thanks/?tag=ch&ver=" + extensionVer;
		chrome.tabs.create({ url: thanksUrl });
	} else {
		cachekey = obj.cachekey;
	}
});

CognitoExt.getExtensionVer = function() {
	var manifestData = chrome.runtime.getManifest();
	return manifestData.version;
};

CognitoExt.resolveWalletAddress = function(addr) {
	if(typeof CognitoExt.walletCache[addr] !== "undefined" && CognitoExt.walletCache[addr] !== null) {
		chrome.tabs.executeScript(null, {
			file: 'jquery-3.2.1.min.js'
		});
		
		chrome.tabs.executeScript(null,{code:"CognitoExt.onResolution(\"" + encodeURIComponent(addr) + "\", " + JSON.stringify(CognitoExt.walletCache[addr]) + ");"});
	}
	
	var extensionVer = CognitoExt.getExtensionVer();
    cognitoQuery.ajax({
		type: "POST",
		url: "https://chromeresolver.cognitoprotocol.com/resolve_ch2/?ver=" + extensionVer + "&cb=" + Math.random(),
		dataType:"json",
		data: {
			"addr": addr
		},
		success: function(data) {
			if(data.success) {
				CognitoExt.walletCache[data.addr] = data.html;
				
				chrome.tabs.executeScript(null, {
					file: 'jquery-3.2.1.min.js'
				});

				chrome.tabs.executeScript(null,{code:"CognitoExt.onResolution(\"" + encodeURIComponent(addr) + "\", " + JSON.stringify(CognitoExt.walletCache[addr]) + ");"});
			}
		}
	});
};
