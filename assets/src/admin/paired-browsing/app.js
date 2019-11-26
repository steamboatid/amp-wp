/**
 * WordPress dependencies
 */
import { addQueryArgs, hasQueryArg, removeQueryArgs } from '@wordpress/url';
/**
 * Internal dependencies
 */
import './app.css';

const { app, history } = window;
const { ampSlug, ampPairedBrowsingQueryVar, ampValidationErrorsQueryVar } = app;

class PairedBrowsingApp {
	exitLink;

	/**
	 * Constructor.
	 */
	constructor() {
		this.nonAmpIframe = document.querySelector( '#non-amp iframe' );
		this.ampIframe = document.querySelector( '#amp iframe' );
		this.ampPageHasErrors = false;

		// Link to exit paired browsing.
		this.exitLink = document.getElementById( 'exit-link' );

		// Overlay that is displayed on the client that becomes disconnected.
		this.disconnectOverlay = document.querySelector( '.disconnect-overlay' );
		this.disconnectText = {
			general: document.querySelector( '.disconnect-overlay .dialog-text span.general' ),
			invalidAmp: document.querySelector( '.disconnect-overlay .dialog-text span.invalid-amp' ),
		};
		this.disconnectButtons = {
			continue: document.querySelector( '.disconnect-overlay .button.continue' ),
			exit: document.querySelector( '.disconnect-overlay .button.exit' ),
			goBack: document.querySelector( '.disconnect-overlay .button.go-back' ),
		};
		this.addDisconnectButtonListeners();

		// Load clients.
		Promise.all( this.getIframeLoadedPromises() );
	}

	/**
	 * Add event listeners for buttons on disconnect overlay.
	 */
	addDisconnectButtonListeners() {
		// The 'Continue' button simply hides the 'disconnected' overlay.
		this.disconnectButtons.continue.addEventListener( 'click', () => {
			this.disconnectOverlay.classList.remove( 'disconnected' );
		} );

		// The 'Exit' button navigates the parent window to the non-AMP version of the current URL.
		this.disconnectButtons.exit.addEventListener( 'click', () => {
			window.location.assign( this.exitLink.href );
		} );

		/*
		 * The 'Go back' button goes back to the previous page of the parent window.
		 */
		this.disconnectButtons.goBack.addEventListener( 'click', () => {
			window.history.back();
		} );
	}

	/**
	 * Return promises to load iframes asynchronously.
	 *
	 * @return {[Promise<Function>, Promise<Function>]} Promises that determine if the iframes are loaded.
	 */
	getIframeLoadedPromises() {
		return [
			new Promise( ( resolve ) => {
				this.nonAmpIframe.addEventListener( 'load', () => {
					this.toggleDisconnectOverlay( this.nonAmpIframe );
					resolve();
				} );
			} ),

			new Promise( ( resolve ) => {
				this.ampIframe.addEventListener( 'load', () => {
					this.toggleDisconnectOverlay( this.ampIframe );
					resolve();
				} );
			} ),
		];
	}

	/**
	 * Validates whether or not the window document is AMP compatible.
	 *
	 * @param {Document} doc Window document.
	 * @return {boolean} True if AMP compatible, false if not.
	 */
	documentIsAmp( doc ) {
		return doc.documentElement.hasAttribute( 'amp' ) ||
			doc.documentElement.hasAttribute( '⚡️' );
	}

	/**
	 * Toggles the 'disconnected' overlay for the supplied iframe.
	 *
	 * @param {HTMLIFrameElement} iframe The iframe that hosts the paired browsing client.
	 */
	toggleDisconnectOverlay( iframe ) {
		const isClientConnected = this.isClientConnected( iframe );

		if ( ! isClientConnected ) {
			if ( this.ampIframe === iframe && this.ampPageHasErrors ) {
				this.disconnectButtons.continue.classList.toggle( 'hidden', true );
				this.disconnectButtons.exit.classList.toggle( 'hidden', false );

				this.disconnectText.general.classList.toggle( 'hidden', true );
				this.disconnectText.invalidAmp.classList.toggle( 'hidden', false );
			} else {
				this.disconnectButtons.continue.classList.toggle( 'hidden', false );
				this.disconnectButtons.exit.classList.toggle( 'hidden', true );

				this.disconnectText.general.classList.toggle( 'hidden', false );
				this.disconnectText.invalidAmp.classList.toggle( 'hidden', true );
			}

			// Show the 'Go Back' button if the parent window has history.
			this.disconnectButtons.goBack.classList.toggle( 'hidden', 0 >= window.history.length );
		}

		// Applying the 'amp' class will overlay it on the AMP iframe.
		this.disconnectOverlay.classList.toggle(
			'amp',
			! isClientConnected && this.ampIframe === iframe,
		);

		this.disconnectOverlay.classList.toggle(
			'disconnected',
			! isClientConnected,
		);
	}

	/**
	 * Determines the status of the paired browsing client in an iframe.
	 *
	 * @param {HTMLIFrameElement} iframe The iframe.
	 */
	isClientConnected( iframe ) {
		if ( this.ampIframe === iframe && this.ampPageHasErrors ) {
			return false;
		}

		return null !== iframe.contentWindow &&
			null !== iframe.contentDocument &&
			true === iframe.contentWindow.ampPairedBrowsingClient;
	}

	/**
	 * Removes AMP related query variables from the supplied URL.
	 *
	 * @param {string} url URL string.
	 * @return {string} Modified URL without any AMP related query variables.
	 */
	removeAmpQueryVars( url ) {
		return removeQueryArgs( url, ampSlug, ampPairedBrowsingQueryVar, ampValidationErrorsQueryVar );
	}

	/**
	 * Adds the AMP query variable to the supplied URL.
	 *
	 * @param {string} url URL string.
	 * @return {string} Modified URL with the AMP query variable.
	 */
	addAmpQueryVar( url ) {
		return addQueryArgs(
			url,
			{
				[ ampSlug ]: '',
			},
		);
	}

	/**
	 * Adds the AMP paired browsing query variable to the supplied URL.
	 *
	 * @param {string} url URL string.
	 * @return {string} Modified URL with the AMP paired browsing query variable.
	 */
	addPairedBrowsingQueryVar( url ) {
		return addQueryArgs(
			url,
			{
				[ ampPairedBrowsingQueryVar ]: '1',
			},
		);
	}

	/**
	 * Removes the URL hash from the supplied URL.
	 *
	 * @param {string} url URL string.
	 * @return {string} Modified URL without the hash.
	 */
	removeUrlHash( url ) {
		const parsedUrl = new URL( url );
		parsedUrl.hash = '';
		return parsedUrl.href;
	}

	/**
	 * Checks if a URL has the 'amp_validation_errors' query variable.
	 *
	 * @param {string} url URL string.
	 * @return {boolean} True if such query var exists, false if not.
	 */
	urlHasValidationErrorQueryVar( url ) {
		return hasQueryArg( url, 'amp_validation_errors' );
	}

	/**
	 * Registers the provided client window with its parent, so that it can be managed by it.
	 *
	 * @param {Window} win Document window.
	 */
	registerClientWindow( win ) {
		let oppositeWindow;

		if ( win === this.ampIframe.contentWindow ) {
			if ( ! this.documentIsAmp( win.document ) ) {
				if ( this.urlHasValidationErrorQueryVar( win.location.href ) ) {
					/*
					 * If the AMP page has validation errors, mark the page as invalid so that the
					 * 'disconnected' overlay can be shown.
					 */
					this.ampPageHasErrors = true;
					this.toggleDisconnectOverlay( this.ampIframe );
					return;
				} else if ( win.document.querySelector( 'head > link[rel=amphtml]' ) ) {
					// Force the AMP iframe to always have an AMP URL, if an AMP version is available.
					win.location.replace( this.addAmpQueryVar( win.location.href ) );
					return;
				}

				/*
				 * If the AMP iframe has loaded a non-AMP page and none of the conditions above are
				 * true, then explicitly mark it as having errors and display the 'disconnected
				 * overlay.
				 */
				this.ampPageHasErrors = true;
				this.toggleDisconnectOverlay( this.ampIframe );
				return;
			}

			this.ampPageHasErrors = false;
			oppositeWindow = this.nonAmpIframe.contentWindow;
		} else {
			// Force the non-AMP iframe to always have a non-AMP URL.
			if ( this.documentIsAmp( win.document ) ) {
				win.location.replace( this.removeAmpQueryVars( win.location.href ) );
				return;
			}

			// Update the link used for exiting paired browsing.
			this.exitLink.href = this.nonAmpIframe.contentWindow.location.href;

			oppositeWindow = this.ampIframe.contentWindow;
		}

		// Synchronize scrolling from current window to its opposite.
		win.addEventListener(
			'scroll',
			() => {
				if ( oppositeWindow && oppositeWindow.ampPairedBrowsingClient && oppositeWindow.scrollTo ) {
					oppositeWindow.scrollTo( win.scrollX, win.scrollY );
				}
			},
			{ passive: true },
		);

		// Make sure the opposite iframe is set to match.
		if (
			oppositeWindow &&
			oppositeWindow.location &&
			(
				this.removeAmpQueryVars( this.removeUrlHash( oppositeWindow.location.href ) ) !==
				this.removeAmpQueryVars( this.removeUrlHash( win.location.href ) )
			)
		) {
			const url = oppositeWindow === this.ampIframe.contentWindow ?
				this.addAmpQueryVar( win.location.href ) :
				this.removeAmpQueryVars( win.location.href );

			oppositeWindow.location.replace( url );

			return;
		}

		document.title = '🔄 ' + win.document.title;

		history.replaceState(
			{},
			'',
			this.addPairedBrowsingQueryVar( this.removeAmpQueryVars( win.location.href ) ),
		);
	}
}

window.pairedBrowsingApp = new PairedBrowsingApp();
