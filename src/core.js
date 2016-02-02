/**
 * @package EntegreJS
 * @subpackage core
 * @author James Linden <kodekrash@gmail.com>
 * @copyright 2016 James Linden
 * @license MIT
 */

class Entegre {

	constructor() {
		this.idc = 1;
		this.factory = {};
		this.widget = {};
		this.tag = {};
		this.control = {};
		this.plugin = {};
		this.utility = {};
		this.events = {};
	}

	startevents() {
		if( this.utility.events ) {
			this.events = new this.utility.events();
		}
		return this;
	}

	id( p ) {
		var s = ( p && p.length > 0 ? p : 'ejs' ) + this.idc;
		this.idc ++;
		return s;
	}
	
	type( o, t ) {
		var x = Object.prototype.toString.call( o );
		x = x.substring( 8, ( x.length - 1 ) ).toLowerCase();
		if( t ) {
			return ( t == x );
		}
		return x;
	}
	
	iterable( x ) {
		var y = this.type( x );
		return ( y == 'object' || y == 'array' );
	}
	
	empty( x ) {
		if( x == null ) {
			return true;
		}
		if( x.length > 0 ) {
			return false;
		}
		if( x.length === 0 ) {
			return true;
		}
		for( var k in x ) {
			if( Object.prototype.hasOwnProperty.call( x, k ) ) {
				return false;
			}
		}
		return true;
	}
	
	random( min, max ) {
		min = new Number( min );
		max = new Number( max );
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}
	
	chunk( x, s ) {
		if( x && this.type( x, 'array' ) ) {
			s = parseInt( s );
			if( x.length > s ) {
				var y = [];
				while( x.length > 0 ) {
					var z = [];
					for( var i = 1; i <= s; i ++ ) {
						if( x.length > 0 ) {
							z.push( x.shift() );
						}
					}
					y.push( z );
				}
				return y;
			}
		}
		return x;
	}
	
	node( t, a, c ) {
		return new E.factory.node( t, a, c );
	}
	
}

var E = new Entegre();

E.utility.events = class {

	constructor() {
		this.e = {};
	}

	register( n ) {
		if( n && !E.empty( n ) && !( n in this.e ) ) {
			this.e[ n ] = [];
		}
		return this;
	}

	listen( n, f ) {
		if( n && !E.empty( n ) && f && E.type( f, 'function' ) ) {
			this.register( n );
			this.e[ n ].push( f );
		}
		return this;
	}

	trigger( n, a ) {
		this.register( n );
		this.e[ n ].forEach( function( c ) {
			c( a );
		} );
		return this;
	}

};

E.startevents();

E.factory.attr = class {
	
	constructor() {
		this.a = {};
	}

	_attr( k, v ) {
		k = k.toString();
		if( !( k in this.a ) ) {
			this.a[ k ] = [];
		}
		this.a[ k ].push( v );
	}

	attr( k, v ) {
		if( !( E.empty( k ) && E.empty( v ) ) ) {
			if( E.iterable( k ) ) {
				if( E.empty( v ) ) {
					for( var k1 in k ) {
						this._attr( k1, k[ k1 ] );
					}
				} else {
					for( var k1 in k ) {
						this._attr( k1, v );
					}
				}
			} else {
				this._attr( k, v );
			}
		}
		return this;
	}

	_buildattr( k, v ) {
		return `${ k.toString() }="${ ( E.iterable( v ) ? v.join( ' ' ) : v ) }"`;
	}
	
	buildattrs() {
		var s = [];
		for( var k in this.a ) {
			s.push( this._buildattr( k, this.a[ k ] ) );
		}
		return s.join( ' ' );
	}

};

E.factory.iterable = class extends E.factory.attr {

	constructor() {
		super();
		this.c = [];
	}

	child( v ) {
		if( v && !E.empty( v ) ) {
			if( E.type( v, 'array' ) ) {
				for( var k in v ) {
					this.c.push( v[ k ] );
				}
			} else {
				this.c.push( v );
			}
		}
		return this;
	}

};

E.factory.base = class extends E.factory.iterable {

	constructor() {
		super();
	}

	buildchildren() {
		var s = [];
		for( var k in this.c ) {
			if( this.c[ k ].build ) {
				s.push( this.c[ k ].build() );
			} else if( this.c[ k ].toString ) {
				s.push( this.c[ k ].toString() );
			} else {
				s.push( this.c[ k ] );
			}
		}
		return s.join( '' );
	}

};

E.factory.node = class extends E.factory.base {

	constructor( tag, attrs, children ) {
		super();
		this.t = ( tag && tag.toString().length > 0 ) ? tag.toString().toLowerCase() : '';
		this.attr( attrs );
		this.child( children );
	}

	build() {
		var nc = [ 'br', 'hr', 'img', 'link', 'meta', 'meta-equiv', 'input' ];
		var a = this.buildattrs();
		var s = `<${ this.t + ( !E.empty( a ) ? ' ' + a : '' ) }>`;
		if( !( this.t in nc ) ) {
			s += `${ this.buildchildren() }</${ this.t }>`;
		}
		return s;
	}
	
	toString() {
		return this.build();
	}
	
	put( t ) {
		if( !E.empty( t ) ) {
			$( t ).append( this.build() );
		}
		return this;
	}

};

E.factory.deck = class extends E.factory.attr {

	constructor() {
		super();
		this.c = [];
	}

	card( title, body, attr ) {
		var x = {
			'title': E.empty( title ) ? null : title,
			'body': E.empty( body ) ? null : body,
			'attr': !E.empty( attr ) && E.iterable( attr ) ? attr : {}
		};
		this.c.push( x );
		return this;
	}

};

E.factory.paginated = class {

	constructor() {
		this.d = [];
		this.opage = 10;
		this.ostart = 0;
	}

	item( x ) {
		if( !E.empty( x ) ) {
			this.d.push( x );
		}
		return this;
	}
	
	items( x ) {
		if( !E.empty( x ) && E.type( x, 'array' ) ) {
			this.d = x;
		}
		return this;
	}

	pagesize( x ) {
		this.opage = parseInt( x );
		return this;
	}

	_total() {
		return this.d.length;
	}

	_first() {
		return ( this.ostart > 0 ? 0 : null );
	}

	_last() {
		var i = ( Math.ceil( this._total() / this.opage ) - 1 ) * this.opage;
		return ( i <= this.ostart ) ? null : i;
	}

	_prev() {
		var i = ( this.ostart - this.opage );
		return ( i >= 0 ) ? i : null;
	}

	_next() {
		var i = ( this.ostart + this.opage );
		return ( i <= this._total() ) ? i : null;
	}

	_pagestart() {
		return ( this.ostart + 1 );
	}
	
	_pageend() {
		var i = ( this.ostart + this.opage );
		return ( i > this._total() ? this._total() : i );
	}

	_controls() {
		if( this._total() > this.opage ) {
			var x = new E.widget.pager( { 'class': 'e-pagination' } );
			x.button( $E( 'glyphicon','step-backward' ), '#' + this.id, false, { 'data-index': this._first(), 'title': 'First page', 'class': 'page-first' } );
			x.button( $E( 'glyphicon','triangle-left' ), '#' + this.id, false, { 'data-index': this._prev(), 'title': 'Previous page', 'class': 'page-prev' } );
			x.button( $E( 'glyphicon','triangle-right' ), '#' + this.id, false, { 'data-index': this._next(), 'title': 'Next page', 'class': 'page-next' } );
			x.button( $E( 'glyphicon','step-forward' ), '#' + this.id, false, { 'data-index': this._last(), 'title': 'Last page', 'class': 'page-last' } );
			return x;
		}
		return '';
	}

	updatecontrols( id ) {
		$('div[data-instance="' + id + '"] .e-pagination li').hide();
		var x = this._first();
		if( x != null ) {
			$('div[data-instance="' + id + '"] .e-pagination li a.page-first').data('index',x);
			$('div[data-instance="' + id + '"] .e-pagination li a.page-first').parent().show();
		}
		var x = this._prev();
		if( x != null ) {
			$('div[data-instance="' + id + '"] .e-pagination li a.page-prev').data('index',x);
			$('div[data-instance="' + id + '"] .e-pagination li a.page-prev').parent().show();
		}
		var x = this._next();
		if( x != null ) {
			$('div[data-instance="' + id + '"] .e-pagination li a.page-next').data('index',x);
			$('div[data-instance="' + id + '"] .e-pagination li a.page-next').parent().show();
		}
		var x = this._last();
		if( x != null ) {
			$('div[data-instance="' + id + '"] .e-pagination li a.page-last').data('index',x);
			$('div[data-instance="' + id + '"] .e-pagination li a.page-last').parent().show();
		}
	}

	_status() {
		return 'Showing records <span class="e-pagination-start"></span> to <span class="e-pagination-end"></span> of <span class="e-pagination-total"></span>';
	}

	updatestatus( id ) {
		$('div[data-instance="' + id + '"] .e-pagination-start').html( this._pagestart() );
		$('div[data-instance="' + id + '"] .e-pagination-end').html( this._pageend() );
		$('div[data-instance="' + id + '"] .e-pagination-total').html( this._total() );
	}

	data( i ) {
		this.ostart = parseInt( i );
		var r = [];
		for( var i = ( this._pagestart() - 1 ); i < this._pageend(); i ++ ) {
			r.push( this.d[ i ] );
		}
		return r;
	}

	toString() {
		return this.build();
	}
	
	put( t ) {
		if( !E.empty( t ) ) {
			$( t ).append( this.build() );
			E.events.trigger( `${this.id}:pager`, 0 );
		}
		return this;
	}
	
};

function $E( cls, arg ) {
	cls = cls.toString().toLowerCase();
	var ptr = false;
	if( cls in E.widget ) {
		ptr = E.widget[ cls ];
	} else if ( cls in E.plugin ) {
		ptr = E.plugin[ cls ];
	} else if ( cls in E.control ) {
		ptr = E.control[ cls ];
	}
	if( ptr !== false ) {
		if( arg ) {
			return new ptr( arg );
		} else {
			return new ptr();
		}
	}
	return false;
}

$('body').on( 'click', '.e-pagination a', function() {
	E.events.trigger( $(this).parents('.e-pagination-instance').data('instance') + ':pager', $(this).data('index') );
	$(this).blur();
} );