//	ramp.flowplayer.bwcheck-hls-1.0.3.js

//	JavaScript-based Dynamic Bitrate Adjustment / Bandwidth Monitor for Flowplayer using HLS
//	Copyright 2013 Paul Ramos
//	RAMP Holdings, Inc.

$f.addPlugin("rampBWHLS", function( options ) {
	var monitorInterval, bandwidthBps, bandwidthKbps, bandwidthMbps, clipInfo, baseUrl,
		isTransferring = false,
		artificialBandwidth,
		useArtificialBandwidth = false,
		self = this;

	self.onBegin(function( e ) {
		onBegin( e );
	});
	self.onResume(function( e ) {
		onBegin( e );
	});

	self.onFinish(function( e ) {
		onStop( e );
	});
	self.onStop(function( e ) {
		onStop( e );
	});
	self.onPause(function( e ) {
		onStop( e );
	});

	function onBegin( e ) {
		log("*** start monitoring");
		clipInfo = e;
		baseUrl = clipInfo.baseUrl;

		startMonitor();
	}

	function onStop( e ) {
		log("*** stop monitoring");
		stopMonitor();

		bandwidthBps = undefined;
		bandwidthKbps = undefined;
		bandwidthMbps = undefined;
		clipInfo = undefined;
		baseUrl = undefined;
		artificialBandwidth = undefined;
		useArtificialBandwidth = false;
	}

	function extend(to, from, includeFuncs) {
		var key;

		if (from) {
			for (key in from) {
				if (key) {
					if ( from[key] && typeof from[key] == "function" && ! includeFuncs )
						continue;
                    if ( from[key] && typeof from[key] == "object" && from[key].length === undefined) {
						var cp = {};
						extend(cp, from[key]);
						to[key] = cp;
					} else {
						to[key] = from[key];
					}
				}
			}
		}
		return to;
	}

	var opts = {
		interval: 20000,
		debug: false
	};

	extend(opts, options);

	// for testing
	bindToClass( "bandwidth", function( e ) {
		useArtificialBandwidth = true;
		artificialBandwidth = e.target.id;
	});

	document.getElementById("reset-bandwidth").onclick = function() {
		useArtificialBandwidth = false;
		artificialBandwidth = null;
	};

	// for testing
	if ( opts.debug ) {
		window.setBandwidthForBWHLS = function( bandwidth ) {
			useArtificialBandwidth = true;
			artificialBandwidth = bandwidth;
		};
	}

	function bindToClass( className, callback ) {
		var els = document.getElementsByClassName( className ),
			i = 0;

		for ( ; i < els.length; i++ ) {
			els[ i ].onClick = callback;
		}
	}

	function getBitrates( encodings ) {
		var key,
			bitrates =  [];

		for ( key in encodings ) {
			if ( encodings.hasOwnProperty( key ) && typeof encodings[ key ].bitrate == "number" ) {
				bitrates.push( encodings[ key ].bitrate );
			}
		}

		bitrates.sort(compareFunction);
		return bitrates;
	}

	function stopMonitor() {
		if ( monitorInterval ) {
			clearInterval( monitorInterval );
		}
	}

	function startMonitor() {
		if ( monitorInterval ) {
			clearInterval( monitorInterval );
		}
		getBandwidth();
		monitorInterval = setInterval(function() {
			// we don't want this to fire before the previous
			// transfer finishes
			if ( isTransferring ) {
				return;
			}

			getBandwidth();
		}, opts.interval );
	}

	function compareFunction( a, b) {
		if ( a < b ) {
			return -1;
		}
		if ( a > b ) {
			return 1;
		}

		return 0;
	}

	function getBandwidth() {
		var startTime, endTime, ajaxCall, downloadTest;

		// start benchmark
		isTransferring = true;
		downloadTest = new Image();

		downloadTest.onload = function() {
			var duration, bitsLoaded,
				speedBps, speedKbps, speedMbps;

			// end benchmark
			endTime = ( new Date() ).getTime();
			duration = ( endTime - startTime ) / 1000;
			bitsLoaded = opts.fileSize * 8;
			speedBps = bandwidthBps = (bitsLoaded / duration).toFixed(2);
			speedKbps = bandwidthKbps = (speedBps / 1024).toFixed(2);
			speedMbps = bandwidthMbps = (speedKbps / 1024).toFixed(2);

			checkSpeed();

			isTransferring = false;
		};

		startTime = ( new Date() ).getTime();
		downloadTest.src = opts.file +"?n=" +Math.random();

		/*ajaxCall = $.ajax({
			url: opts.file,
			cache: false
		}).done(function() {
			var duration, bitsLoaded, fileSize,
				speedBps, speedKbps, speedMbps;

			// end benchmark
			endTime = ( new Date() ).getTime();
			fileSize = ajaxCall.getResponseHeader("Content-Length");
			duration = ( endTime - startTime ) / 1000;
			bitsLoaded = fileSize * 8;
			speedBps = bandwidthBps = (bitsLoaded / duration).toFixed(2);
			speedKbps = bandwidthKbps = (speedBps / 1024).toFixed(2);
			speedMbps = bandwidthMbps = (speedKbps / 1024).toFixed(2);

			checkSpeed();

			isTransferring = false;
		});*/
	}

	function checkSpeed( ) {
		log( "checking speed, current bandwidth: ", bandwidthKbps );
		var i = 0,
			currentBitrate = $f().getClip().bitrate,
			encodings = $f().getClip().bitrateItems,
			chosenBitrate = 0,
			bitrates,
			chosenEncoding,
			possibleEncoding,
			possibleBitrate;
		
		if ( !encodings ) {
			return;
		}

		// lets get the bitrates out of the object bitrateItems, to know if we're on the highest/lowest settings
		// and avoid unncessary comparisons
		log("getting bitrates");
		bitrates = getBitrates( encodings );
	

		// debug - artificially set bandwidth to test switching
		// bandwidthKbps = 770;
		if ( useArtificialBandwidth ) {
			bandwidthKbps = artificialBandwidth;
		}

		log( "current bitrate: ", currentBitrate );
		log( ( useArtificialBandwidth ? "artificial " : "" ) + "threshold: ", ( bandwidthKbps - ( bandwidthKbps * 0.25 ) ) );

		// TODO possibly externalize finding an optimal bitrate
		for ( ; i < bitrates.length; i++ ) {
			possibleBitrate = bitrates[ i ];

			// make sure we get the bitrate closest to the bandwidth by 25%
			// TODO make this threshold configurable
			if ( ( possibleBitrate < ( bandwidthKbps - ( bandwidthKbps * 0.25 ) ) ) && possibleBitrate > chosenBitrate )  {
				chosenBitrate = possibleBitrate;
				log( "possible bitrate candidate: ", chosenBitrate );
			}
		}
		if ( chosenBitrate != currentBitrate ) {
			// select the lowest possible bitrate if we couldn't find one appropriate
			loadEncoding( chosenBitrate || bitrates[0] );
			if ( !chosenBitrate ) {
				log( "no suitable bandwidth - default to lowest" );
			}
			log( "new bitrate : ", chosenBitrate || bitrates[0]);
		}
		else {
			log("already at optimal bitrate");
		}
	
	}

	function loadEncoding( bitrate ) {
		log( "loading bitrate: ", bitrate );
		self.getPlugin("brselect").setBitrate( bitrate );
	}

	function log( message ) {
		if ( window.console && window.console.log && opts.debug ) {
			window.console.log( '[bwHLS] ' + message, arguments[1] ? arguments[1] : '...' );
		}
	}

	return self;
});