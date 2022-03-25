/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { ANALYTICS_VENDORS_LIST } from 'amp-settings';

/**
 * WordPress dependencies
 */
import { Icon, plus, trash } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import { createInterpolateElement, useContext, useEffect, useRef } from '@wordpress/element';
import { Button, TextControl, PanelRow, BaseControl, VisuallyHidden } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Options } from '../components/options-context-provider';
import { AMPNotice, NOTICE_SIZE_SMALL } from '../components/amp-notice';

const GOOGLE_ANALYTICS_VENDOR = 'googleanalytics';

const GOOGLE_ANALYTICS_NOTICE = sprintf(
	/* translators: 1: URL to Site Kit plugin directory page, 2: Google Analytics dev guide URL */
	__( 'For Google Analytics or Google Tag Manager please consider using <a href="%1$s" target="_blank" rel="noreferrer">Site Kit by Google</a>. This plugin configures analytics for both non-AMP and AMP pages alike, avoiding the need to manually provide a separate AMP configuration here. Nevertheless, for documentation on manual configuration see <a href="%2$s" target="_blank" rel="noreferrer">Adding Analytics to your AMP pages</a>.', 'amp' ),
	__( 'https://wordpress.org/plugins/google-site-kit/', 'amp' ),
	__( 'https://developers.google.com/analytics/devguides/collection/amp-analytics/', 'amp' ),
);

const vendorConfigs = {
	'': {
		sample: '{}',
	},
	[ GOOGLE_ANALYTICS_VENDOR ]: {
		notice: GOOGLE_ANALYTICS_NOTICE,
		sample: JSON.stringify(
			{
				vars: {
					account: '👉 ' + __( 'Provide site tracking ID here (e.g. UA-XXXXX-Y)', 'amp' ) + ' 👈',
				},
				triggers: {
					trackPageview: {
						on: 'visible',
						request: 'pageview',
					},
				},
			},
			null,
			'\t',
		),
	},
	gtag: {
		notice: GOOGLE_ANALYTICS_NOTICE,
		sample: JSON.stringify(
			{
				vars: {
					gtag_id: '<GA_MEASUREMENT_ID>',
					config: {
						'<GA_MEASUREMENT_ID>': { groups: 'default' },
					},
				},
			},
			null,
			'\t',
		),
	},
	googletagmanager: { // Throw notice to if user enters googletagmanager as vendor.
		notice: GOOGLE_ANALYTICS_NOTICE,
		sample: '{}',
	},
};

// Array of analytics vendors that AMP supports.
const vendorsDatalistOptions = [];
for ( const vendor of Object.values( ANALYTICS_VENDORS_LIST ) ) {
	vendorsDatalistOptions.push(
		<option key={ vendor.value } value={ vendor.value }>
			{ vendor.label }
		</option>,
	);
}

/**
 * Component for a single analytics entry.
 *
 * @param {Object}   props            Component props.
 * @param {number}   props.entryIndex Index for the entry.
 * @param {Function} props.onChange   Callback to run when data changes.
 * @param {Function} props.onDelete   Callback to run when the entry is to be deleted.
 * @param {string}   props.type       The entry type.
 * @param {string}   props.config     The config JSON string.
 */
function AnalyticsEntry( { entryIndex, onChange, onDelete, type = '', config = '{}' } ) {
	/**
	 * Track the validity of the config JSON object. A nonempty custom validity string will block form submission.
	 */
	const textAreaRef = useRef();
	useEffect( () => {
		if ( ! textAreaRef?.current ) {
			return;
		}

		if ( ! config ) {
			textAreaRef.current.setCustomValidity( '' );
			return;
		}
		try {
			const parsedValue = JSON.parse( config );
			if ( null === parsedValue || typeof parsedValue !== 'object' || Array.isArray( parsedValue ) ) {
				textAreaRef.current.setCustomValidity( __( 'A JSON object is required, e.g. {…}', 'amp' ) );
			} else {
				textAreaRef.current.setCustomValidity( '' );
			}
		} catch ( e ) {
			textAreaRef.current.setCustomValidity( e.message );
		}
	}, [ config ] );

	const isTextareaFocused = () => {
		if ( ! textAreaRef?.current ) {
			return false;
		}
		return textAreaRef.current === textAreaRef.current.ownerDocument.activeElement;
	};

	const defaultValue = vendorConfigs[ type ]?.sample || '{}';

	/** @type {string} textareaControlValue */
	const textareaControlValue = ( '' === config.trim() || Object.values( vendorConfigs ).find( ( { sample } ) => sample === config ) ) && ! isTextareaFocused()
		? defaultValue
		: config;

	return (
		<PanelRow className="amp-analytics-entry">
			<h4>
				{
					/* translators: placeholder is the entry index */
					sprintf( __( 'Analytics Configuration #%s', 'amp' ), entryIndex )
				}
			</h4>
			<div className="amp-analytics-entry__options" id={ `amp-analytics-entry-${ String( entryIndex ) }` }>
				<div className="amp-analytics-entry__text-input">
					<label className="input-label" htmlFor={ `amp-analytics-entry__text-input-${ String( entryIndex ) }` }>
						{ __( 'Type:', 'amp' ) }
					</label>
					<input
						className="text-input"
						id={ `amp-analytics-entry__text-input-${ String( entryIndex ) }` }
						list={ `amp-analytics-vendors-${ String( entryIndex ) }` }
						placeholder={ __( 'Vendor or blank', 'amp' ) }
						value={ type }
						onChange={ ( newType ) => {
							onChange( { type: newType.target.value } );
						} }
					/>
					<datalist id={ `amp-analytics-vendors-${ String( entryIndex ) }` } className="input-datalist" >
						{
							vendorsDatalistOptions
						}
					</datalist>
				</div>

				{
					vendorConfigs[ type ]?.notice && (
						<AMPNotice size={ NOTICE_SIZE_SMALL }>
							{ /* dangerouslySetInnerHTML reason: Injection of links. */ }
							<span dangerouslySetInnerHTML={ { __html: vendorConfigs[ type ].notice } } />
						</AMPNotice>
					)
				}

				<BaseControl
					id={ `analytics-textarea-control-${ entryIndex }` }
					label={ __( 'JSON Configuration:', 'amp' ) }
				>
					<textarea
						rows={ Math.max( 10, ( textareaControlValue.match( /\n/g ) || [] ).length + 1 ) }
						cols="100"
						className="amp-analytics-input"
						id={ `analytics-textarea-control-${ entryIndex }` }
						onChange={ ( event ) => {
							onChange( { config: event.target.value } );
						} }
						placeholder="{...}"
						ref={ textAreaRef }
						required
						value={ textareaControlValue }
					/>
				</BaseControl>
			</div>
			<Button
				isLink
				onClick={ () => {
					if ( defaultValue === config || global.confirm( __( 'Are you sure you want to delete this entry?', 'amp' ) ) ) {
						onDelete();
					}
				} }
				className="amp-analytics__delete-button"
			>
				<Icon icon={ trash } />
				{ __( 'Remove entry', 'amp' ) }
			</Button>
		</PanelRow>
	);
}
AnalyticsEntry.propTypes = {
	config: PropTypes.string,
	entryIndex: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	type: PropTypes.string,
};

/**
 * Component handling addition and deletion of analytics entries.
 */
export function Analytics() {
	const { editedOptions, originalOptions, updateOptions } = useContext( Options );
	const { analytics } = editedOptions;

	return (
		<div>

			<details open={ ! Boolean( Object.keys( originalOptions.analytics ).length ) }>
				<summary>
					{ __( 'Learn about analytics for AMP.', 'amp' ) }
				</summary>
				<p>
					{
						createInterpolateElement(
							sprintf(
								/* translators: 1: amp-analytics, 2: {, 3: }, 4: amp-analytics tag, 5: script tag, 6: googleanalytics. */
								__( 'Please see AMP project\'s <AnalyticsDocsUrl>documentation</AnalyticsDocsUrl> for %1$s as well as the <PluginAnalyticsDocsUrl>plugin\'s analytics documentation</PluginAnalyticsDocsUrl>. Each analytics configuration supplied below must take the form of a JSON object beginning with a %2$s and ending with a %3$s. Do not include any HTML tags like %4$s or %5$s. For the type field, supply one of the <VendorDocsUrl>available analytics vendors</VendorDocsUrl> or leave it blank for in-house analytics. For Google Analytics specifically, the type should be %6$s.  For Google Tag Manager please consider using <SiteKitUrl>Site Kit by Google</SiteKitUrl> plugin.', 'amp' ),
								'<code>amp-analytics</code>',
								'<code>{</code>',
								'<code>}</code>',
								'<code>&lt;amp-analytics&gt;</code>',
								'<code>&lt;script&gt;</code>',
								`<code>${ GOOGLE_ANALYTICS_VENDOR }</code>`,
							),
							{
								/* eslint-disable jsx-a11y/anchor-has-content -- Anchor has content defined in the translated string. */
								AnalyticsDocsUrl: <a href="https://amp.dev/documentation/components/amp-analytics/" target="_blank" rel="noreferrer" />,
								PluginAnalyticsDocsUrl: <a href="https://amp-wp.org/documentation/getting-started/analytics/" target="_blank" rel="noreferrer" />,
								VendorDocsUrl: <a href="https://amp.dev/documentation/guides-and-tutorials/optimize-and-measure/configure-analytics/analytics-vendors/" target="_blank" rel="noreferrer" />,
								SiteKitUrl: <a href="https://wordpress.org/plugins/google-site-kit/" target="_blank" rel="noreferrer" />,
								/* eslint-enable jsx-a11y/anchor-has-content */
								code: <code />,
							},
						)
					}
				</p>
			</details>
			{ Object.entries( analytics || {} ).map( ( [ key, { type, config } ], index ) => (
				<AnalyticsEntry
					key={ `analytics-entry-${ index }` }
					entryIndex={ index + 1 }
					isExistingEntry={ key in originalOptions.analytics }
					type={ type }
					config={ config }
					onDelete={ () => {
						const newAnalytics = { ...analytics };
						delete newAnalytics[ key ];
						updateOptions( { analytics: newAnalytics } );
					} }
					onChange={ ( changes ) => {
						updateOptions( {
							analytics: {
								...analytics,
								[ key ]: {
									...analytics[ key ],
									...changes,
								},
							},
						} );
					} }
				/>
			) ) }

			<Button
				id="amp-analytics-add-entry"
				className="amp-analytics__entry-appender"
				onClick={ () => {
					updateOptions( {
						analytics: {
							...analytics,
							[ uuidv4() ]: {
								type: '',
								config: '{}',
							},
						},
					} );
				} }
			>
				<VisuallyHidden as="span">
					{ __( 'Add entry', 'amp' ) }
				</VisuallyHidden>
				<Icon icon={ plus } />
			</Button>
		</div>
	);
}
