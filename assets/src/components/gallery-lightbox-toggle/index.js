/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AMPSettingToggle } from '../amp-setting-toggle';
import { Options } from '../options-context-provider';
import { Loading } from '../loading';

export function GalleryLightboxToggle() {
	const { editedOptions, fetchingOptions, updateOptions } = useContext( Options );

	if ( fetchingOptions ) {
		return <Loading />;
	}

	const useLightbox = editedOptions?.gallery_lightbox;

	return (
		<AMPSettingToggle
			checked={ true === useLightbox }
			title={ __( 'Enable gallery lightbox', 'amp' ) }
			onChange={ () => {
				updateOptions( { gallery_lightbox: ! useLightbox } );
			} }
		/>
	);
}
