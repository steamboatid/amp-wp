/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import {
	APP_ROOT_ID,
	CSS_BUDGET_BYTES,
	POST_ID,
	VALIDATED_URLS_REST_PATH,
} from 'amp-settings'; // From WP inline script.

/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { render, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Loading } from '../components/loading';
import { ErrorBoundary } from '../components/error-boundary';
import { ErrorContextProvider } from '../components/error-context-provider';
import { ErrorScreen } from '../components/error-screen';
import { ValidatedUrl, ValidatedUrlProvider } from '../components/validated-url-provider';
import StylesheetsSummary from './components/stylesheets-summary';

let errorHandler;

/**
 * Context providers for the settings page.
 *
 * @param {Object} props Component props.
 * @param {any} props.children Context consumers.
 */
function Providers( { children } ) {
	global.removeEventListener( 'error', errorHandler );

	return (
		<ErrorContextProvider>
			<ErrorBoundary>
				<ValidatedUrlProvider
					cssBudgetBytes={ Number( CSS_BUDGET_BYTES ) }
					hasErrorBoundary={ true }
					postId={ Number( POST_ID ) }
					validatedUrlsRestPath={ VALIDATED_URLS_REST_PATH }
				>
					{ children }
				</ValidatedUrlProvider>
			</ErrorBoundary>
		</ErrorContextProvider>
	);
}
Providers.propTypes = {
	children: PropTypes.any,
};

/**
 * Validated URL page application root.
 */
function Root() {
	const {
		cssBudgetBytes,
		fetchingValidatedUrl,
		stylesheetSizes,
	} = useContext( ValidatedUrl );

	if ( fetchingValidatedUrl !== false ) {
		return <Loading />;
	}

	return (
		<StylesheetsSummary
			cssBudgetBytes={ cssBudgetBytes }
			stylesheetSizes={ stylesheetSizes }
		/>
	);
}

domReady( () => {
	const root = document.getElementById( APP_ROOT_ID );

	if ( ! root ) {
		return;
	}

	errorHandler = ( event ) => {
		// Handle only own errors.
		if ( event.filename && /amp-validated-url-page(\.min)?\.js/.test( event.filename ) ) {
			render( <ErrorScreen error={ event.error } />, root );
		}
	};

	global.addEventListener( 'error', errorHandler );

	render(
		<Providers>
			<Root appRoot={ root } />
		</Providers>,
		root,
	);
} );