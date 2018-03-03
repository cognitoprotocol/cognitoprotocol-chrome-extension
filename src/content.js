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
jQuery(document).ready(function() {
	var forbidden = ["google.", "facebook.", "outlook.", "live.", "youtube.", "hotmail.", "yahoo.", "mail"];
	var i;
	for(i = 0; i < forbidden.length; i++) {
		if(document.location.href.toLowerCase().indexOf(forbidden[i]) >= 0) {
			return;
		}
	}
	
	var arr = jQuery("body").text().match(/[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g);
	
	if(typeof arr !== "undefined" && arr !== null) {
		var j;
		var addr;
		for(j = 0; j < arr.length; j++) {
			if(typeof arr[j] === "undefined" || arr[j] === null) {
				continue;
			}
			addr = arr[j];
			
			var lowerCaseCount = addr.replace(/[^a-z]/g, "").length;
			var upperCaseCount = addr.replace(/[^A-Z]/g, "").length;
			var digitCount = addr.replace(/[^0-9]/g, "").length;
			if(lowerCaseCount < 5 || upperCaseCount < 5 || digitCount < 2) {
				continue;
			}
			
			chrome.runtime.sendMessage({
				applicationCode: "cognitoprotocol",
				action: "resolve",
				addr: addr
			}); 
		}
	}
});

window.CognitoExt = function() {};

window.CognitoExt.onResolutionHelper = function(addr, html, needle) {
	var allElements = jQuery("div,span,b,i,p,li");
	var i;
	for(i = 0; i < allElements.length; i++) {
		var current = allElements.get(i);
		if(jQuery(current).html().indexOf(needle) >= 0) {
			var replaced = jQuery(current).html().replace(needle, html);
			jQuery(current).html(replaced);			
		}
	}
};

window.CognitoExt.onResolution = function(addr, html) {
	var needle1 = ">" + addr + "<";
	window.CognitoExt.onResolutionHelper(addr, ">" + html + "<", needle1);
	
	var needle2 = " " + addr;
	window.CognitoExt.onResolutionHelper(addr, " " + html, needle2);
	
	var needle3 = "(" + addr + ")";
	window.CognitoExt.onResolutionHelper(addr, "(" + html + ")", needle3);
};