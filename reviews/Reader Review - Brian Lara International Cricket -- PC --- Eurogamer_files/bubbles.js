/* The Bubble Machine by Mark Kennedy */
/* namespace bm */
var bm_tested = false;
var bm_supported = false;

// open bubbles refresh every X seconds...
// ...using this timer
var bm_refreshTimer = false;

/* class */
function bm_Conf( name, href, refresh ) {
	this.bmName = name;
	this.bmHref = href;
	// millisecs
	this.bmRefresh = refresh;
}

/* class */
function egArray() {
	var args = egArray.arguments;
	var cc;
	for( cc = 0; cc < args.length; cc ++ ) {
		this[ cc ] = args[ cc ];
	}
	// length is readonly/private on IE
	this.size = args.length;
	this.length = args.length;

	// method: find - finds first element matching predicate
	// predicate is a function used to match an array element
	this.find = function( predicate, args ) {
		if( typeof( predicate ) != "function" ) {
			return -2;
		}
		var ii;
		for( ii = 0; ii < this.size; ii ++ ) {
			if( predicate( this[ ii ], args ) ) {
				return ii;
			}
		}
		return -1;
	}
	this.getLength = function() { return size; }
}
egArray.prototype = new Array();

// Configuration

var bm_bubble_conf = new egArray(
	new bm_Conf( "comments", "bubble_comments.xml.php", 60000 ),
	new bm_Conf( "files", "bubble_files.xml.php", 0 ),
	new bm_Conf( "features", "bubble_features.xml.php", 300000 ),
	new bm_Conf( "news", "bubble_news.xml.php", 300000 ),
	new bm_Conf( "videos", "bubble_videos.xml.php", 300000 ),
	new bm_Conf( "screenshots", "bubble_screenshots.xml.php", 300000 )
);

var bm_current_bubble = false;
var bm_current_bubble_name = false;

/* protected */
function _bm_deleteCurrentBubble() {
	var check_name;
	if( bm_current_bubble != false ) {
		// delete thing
		bp = bm_current_bubble.parentNode;
		bp.removeChild( bm_current_bubble );
		bm_current_bubble = false;
		check_name = bm_current_bubble_name;
		bm_current_bubble_name = false;
	} 
	// return name of last bubble
	return check_name;
}

/* public */
function bm_closeAll() {
	_bm_deleteCurrentBubble();
}

/* private */
function _bm_testSupport() {
	// test browser support
	if( false == bm_tested ) {
		// setup body event handlers
		//document.getElementById( "theTop" ).onclick = _bm_deleteCurrentBubble;
		document.documentElement.onclick = _bm_deleteCurrentBubble;
		// do some tests()
		bm_supported = true;
	}
	bm_tested = true;
	return bm_supported;
}

/* public */
function bm_refreshOpenBubble() {
	if( _bm_testSupport() == false ) {
		return;
	}

	if( bm_current_bubble ) {
		var name = bm_current_bubble_name;
		var target = bm_current_bubble.parentNode;
		_bm_deleteCurrentBubble();
		bm_openBubble( target, name );
	}
}

/* public */
function bm_toggleBubble( target, bubbleName ) {
	if( _bm_testSupport() == false ) {
		// allow browser to follow link
		return true;
	}

	// must stop current timer
	if( bm_refreshTimer ) {
		window.clearTimeout( bm_refreshTimer );
	}

	var check_name = _bm_deleteCurrentBubble();

	// make sure this wasn't the bubble we were closing
	if( check_name != bubbleName ) {
		return bm_openBubble( target, bubbleName );
	}
	return false;
}

var _bm_current_dom;
var _bm_current_target;
var _bm_current_conf;

function bm_openBubble( target, bubbleName ) {
	// get source
	var conf = bm_bubble_conf.find(
		function( el, bubbleName ) {
			if( el.bmName == bubbleName ) {
				return true;
			} else {
				return false;
			}
		},
		bubbleName
	);
	if( conf >= 0 ) {
		var source = bm_bubble_conf[ conf ].bmHref;
		_bm_current_target = target;
		_bm_current_conf = conf;
		_bm_getSource( source );
		//alert( Sarissa.serialize( _bm_current_dom ) );
		return false;
	}
}

function _bm_createBubble() {
	if( _bm_current_dom ) {
		if( _bm_current_dom.readyState >= 4 ) {
			var conf = _bm_current_conf;
			var target = _bm_current_target;
			var content = _bm_processSource( _bm_current_dom );
			var bubble = _bm_writeBubble( target, bm_bubble_conf[ conf ].bmName, conf, content );
			if( bubble == false ) {
				// couldn't write the bubble for whatever reason,
				// so forward to real page
				return true;
			}
			bm_current_bubble = bubble;
			bm_current_bubble_name = bm_bubble_conf[ conf ].bmName;

			// don't let silly values
			if( bm_bubble_conf[ conf ].bmRefresh > 999 ) {
				bm_refreshTimer = window.setTimeout( "bm_refreshOpenBubble()", bm_bubble_conf[ conf ].bmRefresh );
			}

			// finished with this
			_bm_current_dom = false;
			_bm_current_target = false;
			_bm_current_conf = false;
			
		}
	}

	// bubble conf didn't exist, so try going to page
	return true;
	
	// if anything fails, set bm_supported = false;
}
/* private */
function _bm_writeBubble( target, name, conf, content ) {

	if( content == false ) {
		//alert( "Parse error" );
		window.location = target.getElementsByTagName( "a" )[ 0 ].href;
		return false;
	}

	var bubble = document.createElement( "div" );
	var title = document.createElement( "h4" );
	title.appendChild( document.createTextNode( content.title ) );

	var closeLink = document.createElement( "a" );
	closeLink.appendChild( document.createTextNode( "close" ) );
	closeLink.setAttribute( "href", "javascript: bm_closeAll()" );
	var moreLink = document.createElement( "a" );
	moreLink.appendChild( document.createTextNode( "show all" ) );
	moreLink.setAttribute( "href", content.masterlink );

	title.appendChild( document.createTextNode( " (" ) );
	title.appendChild( closeLink );
	title.appendChild( document.createTextNode( ") (" ) );
	title.appendChild( moreLink );
	title.appendChild( document.createTextNode( ")" ) );

	bubble.appendChild( title );

	var table = document.createElement( "table" );
	table.setAttribute( "cellspacing", "0" );
	var thead = document.createElement( "thead" );
	var tbody = document.createElement( "tbody" );
	table.setAttribute( "class", "bm-list" );
	//table.appendChild( document.createElement( "col" ) );
	//table.appendChild( document.createElement( "col" ) );

	// setup titles
	var ii;
	var heading;
	heading = document.createElement( "th" );
	heading.appendChild( document.createTextNode( content.itemtitle ) );
	thead.appendChild( heading );

	for( ii = 0; ii < content.fields.length; ii ++ ) {
		heading = document.createElement( "th" );
		heading.appendChild( document.createTextNode( content.fields[ ii ] ) );
		thead.appendChild( heading );
	}

	table.appendChild( thead );

	table.appendChild( tbody );

	var tr = document.createElement( "tr" );
	var th = document.createElement( "th" );
	var tds = new Array();
	var td_texts = new Array();

	var a = document.createElement( "a" );
	var th_text = document.createTextNode( "" );

	a.appendChild( th_text );
	th.appendChild( a );
	tr.appendChild( th );

	for( ii = 0; ii < content.fields.length; ii ++ ) {
		tds[ ii ] = document.createElement( "td" );
		td_texts[ ii ] = document.createTextNode( "" );
		tds[ ii ].appendChild( td_texts[ ii ] );
		tr.appendChild( tds[ ii ] );
	}

	var cc;
	for( cc = 0; cc < content.items.length; cc ++ ) {
		a.setAttribute( "href", content.items[ cc ].href );
		th_text.nodeValue = content.items[ cc ].disp;
		for( ii = 0; ii < content.items[ cc ].fields.length; ii ++ ) {
			td_texts[ ii ].nodeValue = content.items[ cc ].fields[ ii ];
		}
		tbody.appendChild( tr.cloneNode( true ) );
	}

	var listWrapper = document.createElement( "div" );
	listWrapper.setAttribute( "class", "bm-listWrapper" );
	var listFooter = document.createElement( "div" );
	listFooter.setAttribute( "class", "bm-listFooter" );
	var footP = document.createElement( "p" );
	if( bm_bubble_conf[ conf ].bmRefresh > 999 ) {
		footP.appendChild( document.createTextNode( "This list will automatically refresh every " + Math.floor( bm_bubble_conf[ conf ].bmRefresh / 1000 ) + " secs if left open" ) );
	} else {
		footP.appendChild( document.createTextNode( " " ) );
	}
	listFooter.appendChild( footP );
	listWrapper.appendChild( table );
	bubble.appendChild( listWrapper );
	bubble.appendChild( listFooter );
	bubble.setAttribute( "id", "bm-" + name );
	bubble.setAttribute( "class", "bm-bubble" );

	target.appendChild( bubble );

	return bubble;
}

/* private */
function _bm_getSource( source ) {
	_bm_current_dom = Sarissa.getDomDocument();
	_bm_current_dom.async = true;
	_bm_current_dom.onreadystatechange = _bm_createBubble;
	_bm_current_dom.load( source );
}

function _bm_processSource( dom ) {

	if( dom.parseError != 0 ) {
		return false;
	}
	
	var links = new Array();
	xmlLinks = dom.documentElement.getElementsByTagName( "list" )[ 0 ]
		.getElementsByTagName( "item" );
	xmlFields = dom.documentElement.getElementsByTagName( "field" );
	if( xmlLinks.length > 0 ) {
		var cc;
		for( cc = 0; cc < xmlLinks.length; cc ++ ) {
			itemfields = new Array();
			var ii;
			for( ii = 0; ii < xmlFields.length; ii ++ ) {
				itemfields.push(
					xmlLinks[ cc ].getAttribute(
						xmlFields[ ii ].getAttribute( "attr" )
					)
				);
			}
			xmlLinks[ cc ].normalize();
			links.push(
				new link(
					xmlLinks[ cc ].getAttribute( "href" ),
					xmlLinks[ cc ].childNodes[ 0 ].nodeValue,
					itemfields
				)
			);
		}

		var fields = new Array();
		for( ii = 0; ii < xmlFields.length; ii ++ ) {
			fields.push(
				xmlFields[ ii ].getAttribute( "title" )
			);
		}

		var content = new Object();
		content.items = links;
		content.fields = fields;
		xmlTitle = dom.documentElement.getElementsByTagName( "title" )[ 0 ];
		xmlTitle.normalize();
		content.title = xmlTitle.childNodes[ 0 ].nodeValue;
		content.itemtitle = dom.documentElement.getElementsByTagName( "list" )[ 0 ].
			getAttribute( "item-title" );
		content.masterlink = dom.documentElement.getElementsByTagName( "list" )[ 0 ].
			getAttribute( "master-href" );
		return content;
	}

	function link( $href, $disp, $meta ) {
		this.href = $href;
		this.disp = $disp;
		this.fields = $meta;
	}
	return false;

}

