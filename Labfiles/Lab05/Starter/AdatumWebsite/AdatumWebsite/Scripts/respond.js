/* NUGET: BEGIN LICENSE TEXT
 *
 * Microsoft grants you the right to use these script files for the sole
 * purpose of either: (i) interacting through your browser with the Microsoft
 * website or online service, subject to the applicable licensing or use
 * terms; or (ii) using the files as included with a Microsoft product subject
 * to that product's license terms. Microsoft reserves all other rights to the
 * files not expressly granted by Microsoft, whether by implication, estoppel
 * or otherwise. Insofar as a script file is dual licensed under GPL,
 * Microsoft neither took the code under GPL nor distributes it thereunder but
 * under the terms set out in this paragraph. All notices and licenses
 * below are for informational purposes only.
 *
 * NUGET: END LICENSE TEXT */
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
window.matchMedia = window.matchMedia || (function(doc, undefined){
  
  var bool,
      docElem  = doc.documentElement,
      refNode  = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement('body'),
      div      = doc.createElement('div');
  
  div.id = 'mq-test-1';
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);
  
  return function(q){
    
    div.innerHTML = '&shy;<style media="'+q+'"> #mq-test-1 { width: 42px; }</style>';
    
    docElem.insertBefore(fakeBody, refNode);
    bool = div.offsetWidth == 42;  
    docElem.removeChild(fakeBody);
    
    return { matches: bool, media: q };
  };
  
})(document);




/*! Respond.js v1.2.0: min/max-width media query polyfill. (c) Scott Jehl. MIT/GPLv2 Lic. j.mp/respondjs  */
(function( win ){
	//exposed namespace
	win.respond		= {};
	
	//define update even in native-mq-supporting browsers, to avoid errors
	respond.update	= function(){};
	
	//expose media query support flag for external use
	respond.mediaQueriesSupported	= win.matchMedia && win.matchMedia( "only all" ).matches;
	
	//if media queries are supported, exit here
	if( respond.mediaQueriesSupported ){ return; }
	
	//define vars
	var doc 			= win.document,
		docElem 		= doc.documentElement,
		mediastyles		= [],
		rules			= [],
		appendedEls 	= [],
		parsedSheets 	= {},
		resizeThrottle	= 30,
		head 			= doc.getElementsByTagName( "head" )[0] || docElem,
		base			= doc.getElementsByTagName( "base" )[0],
		links			= head.getElementsByTagName( "link" ),
		requestQueue	= [],
		
		//loop stylesheets, send text content to translate
		ripCSS			= function(){
			var sheets 	= links,
				sl 		= sheets.length,
				i		= 0,
				//vars for loop:
				sheet, href, media, isCSS;

			for( ; i < sl; i++ ){
				sheet	= sheets[ i ],
				href	= sheet.href,
				media	= sheet.media,
				isCSS	= sheet.rel && sheet.rel.toLowerCase() === "stylesheet";

				//only links plz and prevent re-parsing
				if( !!href && isCSS && !parsedSheets[ href ] ){
					// selectivizr exposes css through the rawCssText expando
					if (sheet.styleSheet && sheet.styleSheet.rawCssText) {
						translate( sheet.styleSheet.rawCssText, href, media );
						parsedSheets[ href ] = true;
					} else {
						if( (!/^([a-zA-Z:]*\/\/)/.test( href ) && !base)
							|| href.replace( RegExp.$1, "" ).split( "/" )[0] === win.location.host ){
							requestQueue.push( {
								href: href,
								media: media
							} );
						}
					}
				}
			}
			makeRequests();
		},
		
		//recurse through request queue, get css text
		makeRequests	= function(){
			if( requestQueue.length ){
				var thisRequest = requestQueue.shift();
				
				ajax( thisRequest.href, function( styles ){
					translate( styles, thisRequest.href, thisRequest.media );
					parsedSheets[ thisRequest.href ] = true;
					makeRequests();
				} );
			}
		},
		
		//find media blocks in css text, convert to style blocks
		translate			= function( styles, href, media ){
			var qs			= styles.match(  /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi ),
				ql			= qs && qs.length || 0,
				//try to get CSS path
				href		= href.substring( 0, href.lastIndexOf( "/" )),
				repUrls		= function( css ){
					return css.replace( /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g, "$1" + href + "$2$3" );
				},
				useMedia	= !ql && media,
				//vars used in loop
				i			= 0,
				j, fullq, thisq, eachq, eql;

			//if path exists, tack on trailing slash
			if( href.length ){ href += "/"; }	
				
			//if no internal queries exist, but media attr does, use that	
			//note: this currently lacks support for situations where a media attr is specified on a link AND
				//its associated stylesheet has internal CSS media queries.
				//In those cases, the media attribute will currently be ignored.
			if( useMedia ){
				ql = 1;
			}
			

			for( ; i < ql; i++ ){
				j	= 0;
				
				//media attr
				if( useMedia ){
					fullq = media;
					rules.push( repUrls( styles ) );
				}
				//parse for styles
				else{
					fullq	= qs[ i ].match( /@media *([^\{]+)\{([\S\s]+?)$/ ) && RegExp.$1;
					rules.push( RegExp.$2 && repUrls( RegExp.$2 ) );
				}
				
				eachq	= fullq.split( "," );
				eql		= eachq.length;
					
				for( ; j < eql; j++ ){
					thisq	= eachq[ j ];
					mediastyles.push( { 
						media	: thisq.split( "(" )[ 0 ].match( /(only\s+)?([a-zA-Z]+)\s?/ ) && RegExp.$2 || "all",
						rules	: rules.length - 1,
						hasquery: thisq.indexOf("(") > -1,
						minw	: thisq.match( /\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ), 
						maxw	: thisq.match( /\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" )
					} );
				}	
			}

			applyMedia();
		},
        	
		lastCall,
		
		resizeDefer,
		
		// returns the value of 1em in pixels
		getEmValue		= function() {
			var ret,
				div = doc.createElement('div'),
				body = doc.body,
				fakeUsed = false;
									
			div.style.cssText = "position:absolute;font-size:1em;width:1em";
					
			if( !body ){
				body = fakeUsed = doc.createElement( "body" );
				body.style.background = "none";
			}
					
			body.appendChild( div );
								
			docElem.insertBefore( body, docElem.firstChild );
								
			ret = div.offsetWidth;
								
			if( fakeUsed ){
				docElem.removeChild( body );
			}
			else {
				body.removeChild( div );
			}
			
			//also update eminpx before returning
			ret = eminpx = parseFloat(ret);
								
			return ret;
		},
		
		//cached container for 1em value, populated the first time it's needed 
		eminpx,
		
		//enable/disable styles
		applyMedia			= function( fromResize ){
			var name		= "clientWidth",
				docElemProp	= docElem[ name ],
				currWidth 	= doc.compatMode === "CSS1Compat" && docElemProp || doc.body[ name ] || docElemProp,
				styleBlocks	= {},
				lastLink	= links[ links.length-1 ],
				now 		= (new Date()).getTime();

			//throttle resize calls	
			if( fromResize && lastCall && now - lastCall < resizeThrottle ){
				clearTimeout( resizeDefer );
				resizeDefer = setTimeout( applyMedia, resizeThrottle );
				return;
			}
			else {
				lastCall	= now;
			}
										
			for( var i in mediastyles ){
				var thisstyle = mediastyles[ i ],
					min = thisstyle.minw,
					max = thisstyle.maxw,
					minnull = min === null,
					maxnull = max === null,
					em = "em";
				
				if( !!min ){
					min = parseFloat( min ) * ( min.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 );
				}
				if( !!max ){
					max = parseFloat( max ) * ( max.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 );
				}
				
				// if there's no media query at all (the () part), or min or max is not null, and if either is present, they're true
				if( !thisstyle.hasquery || ( !minnull || !maxnull ) && ( minnull || currWidth >= min ) && ( maxnull || currWidth <= max ) ){
						if( !styleBlocks[ thisstyle.media ] ){
							styleBlocks[ thisstyle.media ] = [];
						}
						styleBlocks[ thisstyle.media ].push( rules[ thisstyle.rules ] );
				}
			}
			
			//remove any existing respond style element(s)
			for( var i in appendedEls ){
				if( appendedEls[ i ] && appendedEls[ i ].parentNode === head ){
					head.removeChild( appendedEls[ i ] );
				}
			}
			
			//inject active styles, grouped by media type
			for( var i in styleBlocks ){
				var ss		= doc.createElement( "style" ),
					css		= styleBlocks[ i ].join( "\n" );
				
				ss.type = "text/css";	
				ss.media	= i;
				
				//originally, ss was appended to a documentFragment and sheets were appended in bulk.
				//this caused crashes in IE in a number of circumstances, such as when the HTML element had a bg image set, so appending beforehand seems best. Thanks to @dvelyk for the initial research on this one!
				head.insertBefore( ss, lastLink.nextSibling );
				
				if ( ss.styleSheet ){ 
		        	ss.styleSheet.cssText = css;
		        } 
		        else {
					ss.appendChild( doc.createTextNode( css ) );
		        }
		        
				//push to appendedEls to track for later removal
				appendedEls.push( ss );
			}
		},
		//tweaked Ajax functions from Quirksmode
		ajax = function( url, callback ) {
			var req = xmlHttp();
			if (!req){
				return;
			}	
			req.open( "GET", url, true );
			req.onreadystatechange = function () {
				if ( req.readyState != 4 || req.status != 200 && req.status != 304 ){
					return;
				}
				callback( req.responseText );
			}
			if ( req.readyState == 4 ){
				return;
			}
			req.send( null );
		},
		//define ajax obj 
		xmlHttp = (function() {
			var xmlhttpmethod = false;	
			try {
				xmlhttpmethod = new XMLHttpRequest();
			}
			catch( e ){
				xmlhttpmethod = new ActiveXObject( "Microsoft.XMLHTTP" );
			}
			return function(){
				return xmlhttpmethod;
			};
		})();
	
	//translate CSS
	ripCSS();
	
	//expose update for re-running respond later on
	respond.update = ripCSS;
	
	//adjust on resize
	function callMedia(){
		applyMedia( true );
	}
	if( win.addEventListener ){
		win.addEventListener( "resize", callMedia, false );
	}
	else if( win.attachEvent ){
		win.attachEvent( "onresize", callMedia );
	}
})(this);

// SIG // Begin signature block
// SIG // MIIaswYJKoZIhvcNAQcCoIIapDCCGqACAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFOUxUIg8Gqmq
// SIG // ZzTQOc5mQ4X/uR83oIIVejCCBLswggOjoAMCAQICEzMA
// SIG // AABZ1nPNUY7wIsUAAAAAAFkwDQYJKoZIhvcNAQEFBQAw
// SIG // dzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBMB4XDTE0MDUyMzE3
// SIG // MTMxNVoXDTE1MDgyMzE3MTMxNVowgasxCzAJBgNVBAYT
// SIG // AlVTMQswCQYDVQQIEwJXQTEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MQ0wCwYDVQQLEwRNT1BSMScwJQYDVQQLEx5uQ2lwaGVy
// SIG // IERTRSBFU046RjUyOC0zNzc3LThBNzYxJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggEi
// SIG // MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDGbE7P
// SIG // aFP974De6IvEsfB+B84ePOwMjDWHTOlROry2sJZ3Qvr/
// SIG // PM/h2uKJ+m5CAJlbFt0JZDjiUvvfjvqToz27h49uuIfJ
// SIG // 0GBPz5yCkW2RG3IQs9hDfFlKYF3GsFXQJ9vy9r3yIMYi
// SIG // LJ5riy1s6ngEyUvBcAnnth2vmowGP3hw+nbu0iQUdrKu
// SIG // ICiDHKnwSJI/ooX3g8rFUdCVIAN50le8E7VOuLRsVh9T
// SIG // HhW7zzA//TsBzV9yaPfK85lmM6hdIo8dbsraZdIrHCSs
// SIG // n3ypEIqF4m0uXEr9Sbl7QLFTxt9HubMjTiJHHNPBuUl2
// SIG // QnLOkIYOJPXCPLkJNj+oU1xW/l9hAgMBAAGjggEJMIIB
// SIG // BTAdBgNVHQ4EFgQUWygas811DWM9/Zn1mxUCSBrLpqww
// SIG // HwYDVR0jBBgwFoAUIzT42VJGcArtQPt2+7MrsMM1sw8w
// SIG // VAYDVR0fBE0wSzBJoEegRYZDaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljcm9z
// SIG // b2Z0VGltZVN0YW1wUENBLmNybDBYBggrBgEFBQcBAQRM
// SIG // MEowSAYIKwYBBQUHMAKGPGh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0VGltZVN0
// SIG // YW1wUENBLmNydDATBgNVHSUEDDAKBggrBgEFBQcDCDAN
// SIG // BgkqhkiG9w0BAQUFAAOCAQEAevAN9EVsNJYOd/DiwEIF
// SIG // YfeI03r9iNWn9fd/8gj21f3LynR82wmp39YVB5m/0D6H
// SIG // hGJ7wgaOyoto4j3fnlrFjLKpXP5ZYib11/l4tm60CpBl
// SIG // ZulRCPF8yaO3BDdGxeeCPihc709xpOexJVrlQ1QzCH+k
// SIG // sFUt0YJwSBEgDSaBDu8GJXSrhcPDjOIUX+gFVI+6homq
// SIG // lq6UYiX5r2mICgyxUcQJ77iAfFOQebvpj9BI8GLImfFl
// SIG // NDv3zrX7Zpi5olmZXT6VnxS/NbT7mHIkKQzzugR6gjn7
// SIG // Rs3x4LIWvH0g+Jw5FSWhJi3Wi4G9xr2wnVT+RwtfLU4q
// SIG // 9IfqtQ+1t+2SKTCCBOwwggPUoAMCAQICEzMAAADKbNUy
// SIG // EjXE4VUAAQAAAMowDQYJKoZIhvcNAQEFBQAweTELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0
// SIG // IENvZGUgU2lnbmluZyBQQ0EwHhcNMTQwNDIyMTczOTAw
// SIG // WhcNMTUwNzIyMTczOTAwWjCBgzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAQ8AMIIBCgKCAQEAlnFd7QZG+oTLnVu3Rsew
// SIG // 4bQROQOtsRVzYJzrp7ZuGjw//2XjNPGmpSFeVplsWOSS
// SIG // oQpcwtPcUi8MZZogYUBTMZxsjyF9uvn+E1BSYJU6W7lY
// SIG // pXRhQamU4K0mTkyhl3BJJ158Z8pPHnGERrwdS7biD8XG
// SIG // J8kH5noKpRcAGUxwRTgtgbRQqsVn0fp5vMXMoXKb9CU0
// SIG // mPhU3xI5OBIvpGulmn7HYtHcz+09NPi53zUwuux5Mqnh
// SIG // qaxVTUx/TFbDEwt28Qf5zEes+4jVUqUeKPo9Lc/PhJiG
// SIG // cWURz4XJCUSG4W/nsfysQESlqYsjP4JJndWWWVATWRhz
// SIG // /0MMrSvUfzBAZwIDAQABo4IBYDCCAVwwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwMwHQYDVR0OBBYEFB9e4l1QjVaGvko8
// SIG // zwTop4e1y7+DMFEGA1UdEQRKMEikRjBEMQ0wCwYDVQQL
// SIG // EwRNT1BSMTMwMQYDVQQFEyozMTU5NStiNDIxOGYxMy02
// SIG // ZmNhLTQ5MGYtOWM0Ny0zZmM1NTdkZmM0NDAwHwYDVR0j
// SIG // BBgwFoAUyxHoytK0FlgByTcuMxYWuUyaCh8wVgYDVR0f
// SIG // BE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jcmwvcHJvZHVjdHMvTWljQ29kU2lnUENB
// SIG // XzA4LTMxLTIwMTAuY3JsMFoGCCsGAQUFBwEBBE4wTDBK
// SIG // BggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNDb2RTaWdQQ0FfMDgtMzEt
// SIG // MjAxMC5jcnQwDQYJKoZIhvcNAQEFBQADggEBAHdc69eR
// SIG // Pc29e4PZhamwQ51zfBfJD+0228e1LBte+1QFOoNxQIEJ
// SIG // ordxJl7WfbZsO8mqX10DGCodJ34H6cVlH7XPDbdUxyg4
// SIG // Wojne8EZtlYyuuLMy5Pbr24PXUT11LDvG9VOwa8O7yCb
// SIG // 8uH+J13oxf9h9hnSKAoind/NcIKeGHLYI8x6LEPu/+rA
// SIG // 4OYdqp6XMwBSbwe404hs3qQGNafCU4ZlEXcJjzVZudiG
// SIG // qAD++DF9LPSMBZ3AwdV3cmzpTVkmg/HCsohXkzUAfFAr
// SIG // vFn8/hwpOILT3lKXRSkYTpZbnbpfG6PxJ1DqB5XobTQN
// SIG // OFfcNyg1lTo4nNTtaoVdDiIRXnswggW8MIIDpKADAgEC
// SIG // AgphMyYaAAAAAAAxMA0GCSqGSIb3DQEBBQUAMF8xEzAR
// SIG // BgoJkiaJk/IsZAEZFgNjb20xGTAXBgoJkiaJk/IsZAEZ
// SIG // FgltaWNyb3NvZnQxLTArBgNVBAMTJE1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eTAeFw0xMDA4
// SIG // MzEyMjE5MzJaFw0yMDA4MzEyMjI5MzJaMHkxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jvc29mdCBD
// SIG // b2RlIFNpZ25pbmcgUENBMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAsnJZXBkwZL8dmmAgIEKZdlNs
// SIG // PhvWb8zL8epr/pcWEODfOnSDGrcvoDLs/97CQk4j1XIA
// SIG // 2zVXConKriBJ9PBorE1LjaW9eUtxm0cH2v0l3511iM+q
// SIG // c0R/14Hb873yNqTJXEXcr6094CholxqnpXJzVvEXlOT9
// SIG // NZRyoNZ2Xx53RYOFOBbQc1sFumdSjaWyaS/aGQv+knQp
// SIG // 4nYvVN0UMFn40o1i/cvJX0YxULknE+RAMM9yKRAoIsc3
// SIG // Tj2gMj2QzaE4BoVcTlaCKCoFMrdL109j59ItYvFFPees
// SIG // CAD2RqGe0VuMJlPoeqpK8kbPNzw4nrR3XKUXno3LEY9W
// SIG // PMGsCV8D0wIDAQABo4IBXjCCAVowDwYDVR0TAQH/BAUw
// SIG // AwEB/zAdBgNVHQ4EFgQUyxHoytK0FlgByTcuMxYWuUya
// SIG // Ch8wCwYDVR0PBAQDAgGGMBIGCSsGAQQBgjcVAQQFAgMB
// SIG // AAEwIwYJKwYBBAGCNxUCBBYEFP3RMU7TJoqV4ZhgO6gx
// SIG // b6Y8vNgtMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBB
// SIG // MB8GA1UdIwQYMBaAFA6sgmBAVieX5SUT/CrhClOVWeSk
// SIG // MFAGA1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jv
// SIG // c29mdHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYw
// SIG // RAYIKwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQu
// SIG // Y3J0MA0GCSqGSIb3DQEBBQUAA4ICAQBZOT5/Jkav629A
// SIG // sTK1ausOL26oSffrX3XtTDst10OtC/7L6S0xoyPMfFCY
// SIG // gCFdrD0vTLqiqFac43C7uLT4ebVJcvc+6kF/yuEMF2nL
// SIG // pZwgLfoLUMRWzS3jStK8cOeoDaIDpVbguIpLV/KVQpzx
// SIG // 8+/u44YfNDy4VprwUyOFKqSCHJPilAcd8uJO+IyhyugT
// SIG // pZFOyBvSj3KVKnFtmxr4HPBT1mfMIv9cHc2ijL0nsnlj
// SIG // VkSiUc356aNYVt2bAkVEL1/02q7UgjJu/KSVE+Traeep
// SIG // oiy+yCsQDmWOmdv1ovoSJgllOJTxeh9Ku9HhVujQeJYY
// SIG // XMk1Fl/dkx1Jji2+rTREHO4QFRoAXd01WyHOmMcJ7oUO
// SIG // jE9tDhNOPXwpSJxy0fNsysHscKNXkld9lI2gG0gDWvfP
// SIG // o2cKdKU27S0vF8jmcjcS9G+xPGeC+VKyjTMWZR4Oit0Q
// SIG // 3mT0b85G1NMX6XnEBLTT+yzfH4qerAr7EydAreT54al/
// SIG // RrsHYEdlYEBOsELsTu2zdnnYCjQJbRyAMR/iDlTd5aH7
// SIG // 5UcQrWSY/1AWLny/BSF64pVBJ2nDk4+VyY3YmyGuDVyc
// SIG // 8KKuhmiDDGotu3ZrAB2WrfIWe/YWgyS5iM9qqEcxL5rc
// SIG // 43E91wB+YkfRzojJuBj6DnKNwaM9rwJAav9pm5biEKgQ
// SIG // tDdQCNbDPTCCBgcwggPvoAMCAQICCmEWaDQAAAAAABww
// SIG // DQYJKoZIhvcNAQEFBQAwXzETMBEGCgmSJomT8ixkARkW
// SIG // A2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEt
// SIG // MCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNh
// SIG // dGUgQXV0aG9yaXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIx
// SIG // MDQwMzEzMDMwOVowdzELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEh
// SIG // MB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // n6Fssd/bSJIqfGsuGeG94uPFmVEjUK3O3RhOJA/u0afR
// SIG // TK10MCAR6wfVVJUVSZQbQpKumFwwJtoAa+h7veyJBw/3
// SIG // DgSY8InMH8szJIed8vRnHCz8e+eIHernTqOhwSNTyo36
// SIG // Rc8J0F6v0LBCBKL5pmyTZ9co3EZTsIbQ5ShGLieshk9V
// SIG // UgzkAyz7apCQMG6H81kwnfp+1pez6CGXfvjSE/MIt1Nt
// SIG // UrRFkJ9IAEpHZhEnKWaol+TTBoFKovmEpxFHFAmCn4Tt
// SIG // VXj+AZodUAiFABAwRu233iNGu8QtVJ+vHnhBMXfMm987
// SIG // g5OhYQK1HQ2x/PebsgHOIktU//kFw8IgCwIDAQABo4IB
// SIG // qzCCAacwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU
// SIG // IzT42VJGcArtQPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGG
// SIG // MBAGCSsGAQQBgjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2A
// SIG // FA6sgmBAVieX5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYK
// SIG // CZImiZPyLGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJ
// SIG // bWljcm9zb2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9v
// SIG // dCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWt
// SIG // THNY9AcTLmUwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvbWljcm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUF
// SIG // BwEBBEgwRjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRS
// SIG // b290Q2VydC5jcnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // DQYJKoZIhvcNAQEFBQADggIBABCXisNcA0Q23em0rXfb
// SIG // znlRTQGxLnRxW20ME6vOvnuPuC7UEqKMbWK4VwLLTiAT
// SIG // UJndekDiV7uvWJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciN
// SIG // SOLwUxXdT6uS5OeNatWAweaU8gYvhQPpkSokInD79vzk
// SIG // eJkuDfcH4nC8GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiL
// SIG // ID/iBxoy+cwxSnYxPStyC8jqcD3/hQoT38IKYY7w17gX
// SIG // 606Lf8U1K16jv+u8fQtCe9RTciHuMMq7eGVcWwEXChQO
// SIG // 0toUmPU8uWZYsy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oY
// SIG // emIp76KbKTQGdxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOk
// SIG // qHQ1uE7FcSMSJnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkh
// SIG // gJ4VMGboQhJeGsieIiHQQ+kr6bv0SMws1NgygEwmKkgk
// SIG // X1rqVu+m3pmdyjpvvYEndAYR7nYhv5uCwSdUtrFqPYmh
// SIG // dmG0bqETpr+qR/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQC
// SIG // PS2vWY+45CHltbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZ
// SIG // kocTdSIvMqgIbqBbjCW/oO+EyiHW6x5PyZruSeD3AWVv
// SIG // iQt9yGnI5m7qp5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJ
// SIG // E6P9MYIEpTCCBKECAQEwgZAweTELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENvZGUgU2ln
// SIG // bmluZyBQQ0ECEzMAAADKbNUyEjXE4VUAAQAAAMowCQYF
// SIG // Kw4DAhoFAKCBvjAZBgkqhkiG9w0BCQMxDAYKKwYBBAGC
// SIG // NwIBBDAcBgorBgEEAYI3AgELMQ4wDAYKKwYBBAGCNwIB
// SIG // FTAjBgkqhkiG9w0BCQQxFgQU5LaVYs9sNxGGul9cTg0+
// SIG // 06d8u/cwXgYKKwYBBAGCNwIBDDFQME6gJoAkAE0AaQBj
// SIG // AHIAbwBzAG8AZgB0ACAATABlAGEAcgBuAGkAbgBnoSSA
// SIG // Imh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9sZWFybmlu
// SIG // ZyAwDQYJKoZIhvcNAQEBBQAEggEAHrxwidNve3CM0Wfd
// SIG // ADSgPO7L8SYtNaM2BG/ty4AzFFtAMhsb+7eyOx0ON18L
// SIG // th8+cUZpmYlrCxjZfAR1Bz7fjo6GGD64+Y7X4bbirMb2
// SIG // JrjSUSpjjiyB9Fu5YZwfjKOor12vAzJhCBrbF8mVu163
// SIG // ISiRTcvBcP3rQb4SPnNFWqKJEz2izuUXV6Zh8PSTLuHa
// SIG // 9yLoz2bbJilwziqwDDnBTUsC4wc3Y4iBqfXaziYqGb89
// SIG // CyJ/k50vJ2hqMOoiTFQJ7hgy5BOsY9q2QWQqg/PRqdlw
// SIG // pj1n1tis2gA+k58yt8GApZFnAWISE5CgREXpsLPPgNT1
// SIG // Sab3JBOOuZMDXSh+j6GCAigwggIkBgkqhkiG9w0BCQYx
// SIG // ggIVMIICEQIBATCBjjB3MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSEwHwYDVQQDExhNaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0ECEzMAAABZ1nPNUY7wIsUAAAAAAFkwCQYFKw4DAhoF
// SIG // AKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJ
// SIG // KoZIhvcNAQkFMQ8XDTE0MDkxODA5MDIyNFowIwYJKoZI
// SIG // hvcNAQkEMRYEFHcT0Lm625WmWLu07zvSmsDdnCnmMA0G
// SIG // CSqGSIb3DQEBBQUABIIBADEc/Lt2cNLkVOfOGuO0xwXf
// SIG // QKVTJ83jy8OCp01B//SEV2smZBbjHa9SvY3a7WI6Rh6m
// SIG // x9Jm71/ve2AC6lUeAXOMdGtY/AdsjpnAjuEix/PAi//j
// SIG // NS7jwadeSwrLsfCR4XndKSv0pq1rRZtjyGBuFmeHFX4v
// SIG // y8HKExlhEMp4LAAr/JofYT8PHD3Dm2lhyjJ2WsMsUUYk
// SIG // QrI/HhslO3iziy3EvJwdp2U3xPntx3QMFtcCWgWWZnIs
// SIG // U2bQtqcira07Pb1IYaK8jeTv1HGpvCOywbzf/FJu92/r
// SIG // 4r0WqN4DqDwBefokHdwv2Y31wR+k5yb0J3VfD53qf31J
// SIG // cnkFzoGLdng=
// SIG // End signature block
