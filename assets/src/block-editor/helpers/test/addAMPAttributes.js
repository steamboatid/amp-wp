/**
 * Internal dependencies
 */
import { addAMPAttributes } from '..';

describe( 'addAMPAttributes', () => {
	it( 'adds attributes to core/image block', () => {
		expect(
			addAMPAttributes( {}, 'core/image' ),
		).toMatchObject( {
			attributes: {
				ampLightbox: {
					type: 'boolean',
					default: false,
				},
			},
		} );
	} );
} );
