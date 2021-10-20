/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ampViewTheme from './theme-install/view/theme';

const ampThemeInstall = {

	/**
	 * Init function.
	 */
	init() {
		this.addTab();
		this.overrideViews();
	},

	/**
	 * Add new tab for PX Enhanced theme in theme install page.
	 */
	addTab() {
		const filterLinks = document.querySelector( '.filter-links' );
		if ( ! filterLinks ) {
			return;
		}

		const listItem = document.createElement( 'li' );
		const anchorElement = document.createElement( 'a' );
		const spanElement = document.createElement( 'span' );
		spanElement.classList.add( 'amp-logo-icon' );

		anchorElement.append( spanElement );
		anchorElement.append( ' ' );
		anchorElement.append( __( 'AMP Compatible', 'amp' ) );
		anchorElement.setAttribute( 'href', '#' );
		anchorElement.setAttribute( 'data-sort', 'amp-compatible' );

		listItem.appendChild( anchorElement );

		filterLinks.prepend( listItem );
	},

	/**
	 * Override theme view.
	 */
	overrideViews() {
		wp.themes.view.Theme = ampViewTheme;
	},

};

domReady( () => {
	ampThemeInstall.init();
} );
