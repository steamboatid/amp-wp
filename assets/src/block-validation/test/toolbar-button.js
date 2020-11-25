/**
 * External dependencies
 */
import { act } from 'react-dom/test-utils';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, render } from '@wordpress/element';
import { dispatch } from '@wordpress/data';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import '@wordpress/block-editor'; // Block editor data store needed.

/**
 * Internal dependencies
 */
import { createStore } from '../store';
import { addToolbarButtonToBlock } from '../add-toolbar-button-to-block';

let container, block;
let toolbarButtonWasRendered = false;

const TEST_BLOCK = 'my-plugin/test-block';

jest.mock( '../use-inline-data', () => ( {
	useInlineData: () => ( {
		blockSources: {
			'my-plugin/test-block': {
				source: 'plugin',
				name: 'My plugin',
			},
		},
	} ),
} ) );

jest.mock( '../amp-toolbar-button', () => ( {
	AMPToolbarButton() {
		toolbarButtonWasRendered = true;

		return null;
	} } ) );

registerBlockType( TEST_BLOCK, {
	attributes: {},
	save: noop,
	category: 'widgets',
	title: 'test block',
} );

describe( 'ToolbarButton: filtering with errors', () => {
	beforeAll( () => {
		block = createBlock( TEST_BLOCK, {} );
		dispatch( 'core/block-editor' ).insertBlock( block );

		createStore( {
			reviewLink: 'http://review-link.test',
			validationErrors: [
				{
					clientId: block.clientId,
					code: 'DISALLOWED_TAG',
					status: 3,
					term_id: 12,
					title: 'Invalid script: <code>jquery.js</code>',
					type: 'js_error',
				},
			],
		} );
	} );

	beforeEach( () => {
		container = document.createElement( 'ul' );
		document.body.appendChild( container );
		toolbarButtonWasRendered = false;
	} );

	afterEach( () => {
		document.body.removeChild( container );
		container = null;
	} );

	it( 'is filtered correctly with a class component', () => {
		class UnfilteredComponent extends Component {
			render() {
				return (
					<div id="default-component-element">
						{ '' }
					</div>
				);
			}
		}

		const FilteredComponent = addToolbarButtonToBlock( UnfilteredComponent );

		act( () => {
			render(
				<FilteredComponent clientId={ block.clientId } />,
				container,
			);
		} );

		expect( container.querySelector( '#default-component-element' ) ).not.toBeNull();
		expect( toolbarButtonWasRendered ).toBe( true );
	} );

	it( 'is filtered correctly with a function component', () => {
		function UnfilteredComponent() {
			return (
				<div id="default-component-element">
					{ '' }
				</div>
			);
		}

		const FilteredComponent = addToolbarButtonToBlock( UnfilteredComponent );

		act( () => {
			render(
				<FilteredComponent clientId={ block.clientId } />,
				container,
			);
		} );

		expect( container.querySelector( '#default-component-element' ) ).not.toBeNull();
		expect( toolbarButtonWasRendered ).toBe( true );
	} );
} );

describe( 'ToolbarButton: filtering without errors', () => {
	beforeAll( () => {
		block = createBlock( TEST_BLOCK, {} );
		dispatch( 'core/block-editor' ).insertBlock( block );

		createStore( {
			reviewLink: 'http://review-link.test',
			validationErrors: [],
		} );
	} );

	beforeEach( () => {
		container = document.createElement( 'ul' );
		document.body.appendChild( container );
		toolbarButtonWasRendered = false;
	} );

	afterEach( () => {
		document.body.removeChild( container );
		container = null;
	} );

	it( 'is not filtered with a class component and no errors', () => {
		class UnfilteredComponent extends Component {
			render() {
				return (
					<div id="default-component-element">
						{ '' }
					</div>
				);
			}
		}

		const FilteredComponent = addToolbarButtonToBlock( UnfilteredComponent );

		act( () => {
			render(
				<FilteredComponent clientId={ block.clientId } />,
				container,
			);
		} );

		expect( container.querySelector( '#default-component-element' ) ).not.toBeNull();
		expect( toolbarButtonWasRendered ).toBe( false );
	} );

	it( 'is not filtered with a function component and no errors', () => {
		function UnfilteredComponent() {
			return (
				<div id="default-component-element">
					{ '' }
				</div>
			);
		}

		const FilteredComponent = addToolbarButtonToBlock( UnfilteredComponent );

		act( () => {
			render(
				<FilteredComponent clientId={ block.clientId } />,
				container,
			);
		} );

		expect( container.querySelector( '#default-component-element' ) ).not.toBeNull();
		expect( toolbarButtonWasRendered ).toBe( false );
	} );
} );
