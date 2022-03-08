/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import FontColorCommand from "./fontcolorcommand";
import { FONT_COLOR, THEME_COLOR_ATTRIBUTE, DEFAULT_COLORS } from "./constants";

function renderUpcastElement() {
	return (element) => {
		const paletteKey = element.getAttribute(THEME_COLOR_ATTRIBUTE);
		if (paletteKey) {
			return paletteKey;
		}
		const color = element.getStyle("color");
		if (color) {
			return color.replace(/\s/g, "");
		}
		return null;
	};
}

function matchUpcastElement() {
	return (element) => {
		if (element.name === "span") {
			const color = element.getStyle("color");
			const paletteKey = element.getAttribute(THEME_COLOR_ATTRIBUTE);
			if (paletteKey) {
				return {
					name: true,
					attributes: [THEME_COLOR_ATTRIBUTE],
				};
			}
			if (color) {
				return {
					name: true,
					styles: ["color"],
				};
			}
		}
		return null;
	};
}

function renderDowncastElement(themeColors) {
	return (modelAttributeValue, conversionApi) => {
		const { writer } = conversionApi;
		const themeColor = themeColors.find(
			(item) => item.paletteKey === modelAttributeValue
		);
		const attributes = themeColor
			? {
					[THEME_COLOR_ATTRIBUTE]: themeColor.paletteKey,
					style: `color:${themeColor.color}`,
			  }
			: modelAttributeValue
			? {
					style: `color:${modelAttributeValue}`,
			  }
			: {};
		return writer.createAttributeElement("span", attributes, {
			priority: 7,
		});
	};
}

export default class FontColorEditing extends Plugin {
	static get pluginName() {
		return "FontColorEditing";
	}

	constructor(editor) {
		super(editor);

		editor.config.define(FONT_COLOR, {
			themeColors: [],
			exactColors: DEFAULT_COLORS.map((color) => ({ color })),
			columns: 6,
		});

		editor.conversion.for("upcast").elementToAttribute({
			view: matchUpcastElement(),
			model: {
				key: FONT_COLOR,
				value: renderUpcastElement(),
			},
		});

		editor.conversion.for("downcast").attributeToElement({
			model: FONT_COLOR,
			view: renderDowncastElement(
				editor.config.get(FONT_COLOR).themeColors
			),
		});

		editor.commands.add(FONT_COLOR, new FontColorCommand(editor));

		editor.model.schema.extend("$text", { allowAttributes: FONT_COLOR });

		editor.model.schema.setAttributeProperties(FONT_COLOR, {
			isFormatting: true,
			copyOnEnter: true,
		});
	}
}
