/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FontColorEditing from './../../src/fontcolor/fontcolorediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'FontColorEditing', () => {
	let editor, doc;

	beforeEach( () => VirtualTestEditor
		.create( {
			plugins: [ FontColorEditing, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;

			doc = editor.document;
		} )
	);

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
		expect( editor.model.schema.checkAttribute( [ '$block', '$text' ], 'fontColor' ) ).to.be.true;
		expect( editor.model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'fontColor' ) ).to.be.true;

		expect( editor.model.schema.checkAttribute( [ '$block' ], 'fontColor' ) ).to.be.false;
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				expect( editor.config.get( 'fontColor.colors' ) ).to.deep.equal( [
					{
						color: 'hsl(0, 0%, 0%)',
						label: 'Black'
					}, {
						color: 'hsl(0, 0%, 30%)',
						label: 'Dim grey'
					}, {
						color: 'hsl(0, 0%, 60%)',
						label: 'Grey'
					}, {
						color: 'hsl(0, 0%, 90%)',
						label: 'Light grey'
					}, {
						color: 'hsl(0, 0%, 100%)',
						label: 'White',
						hasBorder: true
					}, {
						color: 'hsl(0, 75%, 60%)',
						label: 'Red'
					}, {
						color: 'hsl(30, 75%, 60%)',
						label: 'Orange'
					}, {
						color: 'hsl(60, 75%, 60%)',
						label: 'Yellow'
					}, {
						color: 'hsl(90, 75%, 60%)',
						label: 'Light green'
					}, {
						color: 'hsl(120, 75%, 60%)',
						label: 'Green'
					}, {
						color: 'hsl(150, 75%, 60%)',
						label: 'Aquamarine'
					}, {
						color: 'hsl(180, 75%, 60%)',
						label: 'Turquoise'
					}, {
						color: 'hsl(210, 75%, 60%)',
						label: 'Light blue'
					}, {
						color: 'hsl(240, 75%, 60%)',
						label: 'Blue'
					}, {
						color: 'hsl(270, 75%, 60%)',
						label: 'Purple'
					}
				] );
			} );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		beforeEach( () => VirtualTestEditor
			.create( {
				plugins: [ FontColorEditing, Paragraph ],
				fontColor: {
					colors: [
						{
							label: 'Color1',
							color: '#000'
						}, {
							label: 'Color2',
							color: '#123456'
						}, {
							label: 'Color3',
							color: 'rgb( 0, 10, 20 )'
						},
						'hsl( 200,100%,50%)',
						{
							label: 'Color5 - Light Green',
							color: 'lightgreen'
						}
					]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.model;
			} )
		);

		describe( 'convert different color version', () => {
			const tests = [
				'#000',
				'green',
				'rgb( 0, 10, 20 )',
				'rgba( 20, 30, 50, 0.4)',
				'hsl( 10, 20%, 30%)',
				'hsla( 300, 50%, 100%, .3)',
				'rgb( 20%, 30%, 40% )',
				'#345678'
			];
			tests.forEach( test => {
				it( `should convert fontColor attribute: "${ test }" to proper style value.`, () => {
					setModelData( doc, `<paragraph>fo<$text fontColor="${ test }">o b</$text>ar</paragraph>` );

					expect( editor.getData() ).to.equal( `<p>fo<span style="color:${ test };">o b</span>ar</p>` );
				} );
			} );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( {
					plugins: [ FontColorEditing, Paragraph ],
					fontColor: {
						colors: [
							{
								label: 'Color1',
								color: '#000'
							}, {
								label: 'Color2',
								color: '#123456'
							}, {
								label: 'Color3',
								color: 'rgb( 0, 10, 20 )'
							},
							'hsl( 200,100%,50%)',
							{
								label: 'Color5 - Light Green',
								color: 'lightgreen'
							}
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					doc = editor.model;
				} );
		} );

		it( 'should convert from element with defined style when with other styles', () => {
			const data = '<p>f<span style="font-size: 18px;color: rgb(10, 20, 30);">o</span>o</p>';

			editor.setData( data );

			expect( getModelData( doc ) ).to.equal( '<paragraph>[]f<$text fontColor="rgb(10,20,30)">o</$text>o</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>f<span style="color:rgb(10,20,30);">o</span>o</p>' );
		} );

		describe( 'should convert from different color versions', () => {
			const tests = [
				'#000',
				'green',
				'rgb( 0, 10, 20 )',
				'rgba( 20, 30, 50, 0.4)',
				'hsl( 10, 20%, 30%)',
				'hsla( 300, 50%, 100%, .3)',
				'rgb( 20%, 30%, 40% )',
				'#345678'
			];

			tests.forEach( test => {
				it( `should convert fontColor attribute: "${ test }" to proper style value.`, () => {
					const data = `<p>f<span style="color: ${ test }">o</span>o</p>`;
					editor.setData( data );

					expect( getModelData( doc ) )
						.to.equal( `<paragraph>[]f<$text fontColor="${ test.replace( / /g, '' ) }">o</$text>o</paragraph>` );

					expect( editor.getData() ).to.equal( `<p>f<span style="color:${ test.replace( / /g, '' ) };">o</span>o</p>` );
				} );
			} );
		} );

		it( 'should convert from complex definition', () => {
			editor.setData(
				'<p>f<span style="color: lightgreen;">o</span>o</p>' +
				'<p>f<span style="color: hsl( 200, 100%, 50% );">o</span>o</p>' +
				'<p>b<span style="color: rgba(1,2,3,.4);">a</span>r</p>' +
				'<p>b<span style="color:#fff;">a</span>z</p>'
			);

			expect( getModelData( doc ) ).to.equal(
				'<paragraph>[]f<$text fontColor="lightgreen">o</$text>o</paragraph>' +
				'<paragraph>f<$text fontColor="hsl(200,100%,50%)">o</$text>o</paragraph>' +
				'<paragraph>b<$text fontColor="rgba(1,2,3,.4)">a</$text>r</paragraph>' +
				'<paragraph>b<$text fontColor="#fff">a</$text>z</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>f<span style="color:lightgreen;">o</span>o</p>' +
				'<p>f<span style="color:hsl(200,100%,50%);">o</span>o</p>' +
				'<p>b<span style="color:rgba(1,2,3,.4);">a</span>r</p>' +
				'<p>b<span style="color:#fff;">a</span>z</p>'
			);
		} );
	} );
} );
