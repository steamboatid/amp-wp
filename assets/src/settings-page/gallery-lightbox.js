/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { GalleryLightboxToggle } from '../components/gallery-lightbox-toggle';

export function GalleryLightbox() {
	return (
		<section className="gallery-lightbox">
			<GalleryLightboxToggle />
			<p>
				{ __( 'Enable the gallery lightbox to display images in a lightbox format.', 'amp' ) }
			</p>
		</section>
	);
}
