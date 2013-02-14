$(".bandwidth").on("click", function( e ) {
	if ( e.target.classList.contains("waiting") ) {
		e.target.classList.remove("waiting");
		testBitrate( e );
	}
	else {
		e.target.classList.add("waiting");
		setBandwidth( e );
	}

});

function setBandwidth( e ) {
	var bandwidth = e.target.id;

	e.target.classList.add("bitrate");
	e.target.classList.remove("bandwidth");
	e.target.innerHTML = e.target.attributes['data-bitrate'].value;

	window.setBandwidthForBWHLS( bandwidth );
}

function testBitrate( e ) {
	var bandwidth = e.target.id;
		expectedBitrate = e.target.attributes['data-bitrate'].value;

	e.target.classList.add("bandwidth");
	e.target.classList.remove("bitrate");
	e.target.innerHTML = e.target.id;

	test("Test Bandwidth " +bandwidth , function() {
		equal( $f().getClip().bitrate, expectedBitrate, "Should be " +expectedBitrate );
	});
}