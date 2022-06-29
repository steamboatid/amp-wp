/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { GalleryCarouselToggle } from '../components/gallery-carousel-toggle';

/**
 * Gallery carousel section of the settings page.
 */
export function GalleryCarousel() {
	return (
		<section className="gallery-carousel">
			<GalleryCarouselToggle />
			<p>
				{ __( 'Enable the gallery carousel to display images in a carousel format.', 'amp' ) }
			</p>
		</section>
	);
}
