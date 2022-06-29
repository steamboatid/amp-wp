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

export function GalleryCarouselToggle() {
	const { fetchingOptions, editedOptions, updateOptions } = useContext( Options );

	if ( fetchingOptions ) {
		return <Loading />;
	}

	const useCarousel = editedOptions?.gallery_carousel;

	return (
		<AMPSettingToggle
			checked={ true === useCarousel }
			title={ __( 'Enable gallery carousel', 'amp' ) }
			onChange={ () => {
				updateOptions( { gallery_carousel: ! useCarousel } );
			} }
		/>
	);
}
