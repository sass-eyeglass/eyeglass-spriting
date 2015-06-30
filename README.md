
# eyeglass spriting API

( insert summary/basic usage information here / check out the example project? )

For basic usage, feel free to check out the eyeglass spriting example project at ( insert link here ).

---
### sprite-map()

	sprite-map($name, $layout, $paths...);

Generates a sprite map image and returns a Sass map containing information about individual sprites, which can be passed into other spriting functions. It can take multiple sprite sources, which can be paths or glob patterns. PNG, JPG, and GIF files can be made into sprites. Sprites are named using their original asset source paths. Note that sprite-map() does not actually generate the sprite map image.

For example, given the following assets directory structure:

    |-- module-a
        |--icon-home.png
    |-- module-b
        |--icons
            |--icon-back.png
            |--icon-forward.png
            |--icon-notifications.png
		            .
		            .
		            .

You might generate spritemap data using the following:

	$icon-sprite-map: sprite-map($name: "icons", $layout: sprite-layout(horizontal, (spacing: 5px; alignment: bottom)), "module-a/icon-home.png", "module-b/icons/*");

`$icon-sprite-map` is now a Sass map which can be passed into the other spriting functions to get information about your sprites.

---
### sprite-layout()

	sprite-layout(($strategy), (spacing : 5px, alignment: $alignment));

Returns a map of sprite layout settings which can be passed directly into sprite-map(). It is recommended that you pass the output of sprite-layout() into sprite-map(), rather than generating your own layout.

Possible strategies and corresponding alignments are:

`"vertical"` - alignment `"left"` or `"right"`

`"horizontal"` - alignment `"top"` or `"bottom"`

`"diagonal"` - no alignment needed; spacing does not apply

If the alignment is invalid for the given strategy, sprite-layout() will return either a vertical-left or horizontal-top layout by default. If the strategy is invalid, sprite-layout() will return a vertical-left layout by default. Spacing and alignment values are both optional.

---
### sprite-list()

	sprite-list($sprite-map);

Returns a list of the names of each sprite in the sprite map.

---
### sprite-url()

	sprite-url($sprite-map);

Generates the sprite map image, and returns the path to the constructed sprite map image.

For example,

 	sprite-url($icon-sprite-map);

might generate a sprite map image at `assets/icons.png`.

---
### sprite-background() *(mixin)*

	sprite-background($sprite-map, $repeat: no-repeat);

A mixin that sets the background image to the generated spritemap image, with an optional repeat argument. For example,

	.icon-bg {
		@include sprite-background($icon-sprite-map);
	}

Might compile to the following css:

	.icon-bg {
		background: url("/assets/icon-sprite-map.png") no-repeat;
	}

Also causes the sprite map image to be generated.

---
### sprite-position() *(mixin)*

	sprite-position($sprite-map, $sprite-name);

A mixin that sets the background position to the position of the given sprite. For example,

	.icon-home {
		@include sprite-background($icon-sprite-map);
		@include sprite-position($icon-sprite-map, "icons/home.png");
	}

Might compile to the following css:

	.icon-home {
		background: url("/assets/icon-sprite-map.png");
		background-position: 50px 100px;
	}

---
### sprite-dimensions() *(mixin)*

  sprite-dimensions($sprite-map, $sprite-name);

A mixin that sets the dimensions of the element to the dimensions of the given sprite. For example,

	.icon-home {
		@include sprite-background($icon-sprite-map);
		@include sprite-position($icon-sprite-map, "icons/home.png");
		@include sprite-dimensions($icon-sprite-map, "icons/home.png");
	}

Might compile to the following css:

	.icon-home {
		background: url("/assets/icon-sprite-map.png");
		background-position: 50px 100px;
		width: 32px;
		height: 32px;
	}

---
### sprite-position() *(function)*

	sprite-position($sprite-map, $sprite-name);

Returns the position for the given sprite name in the given sprite map, in a format that is suitable for use as a value to background-position:

	background-position: sprite-position($icons-sprite-map, "icons/home.png");

Might generate something like:

	background-position: 50px 100px;

---
### sprite-position-x()

	sprite-position-x($sprite-map, $sprite-name);

Returns the x coordinate of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-position-y()

	sprite-position-y($sprite-map, $sprite-name);

Returns the y coordinate of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-width()

	sprite-width($sprite-map, $sprite-name);

Returns the width of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-height()

	sprite-height($sprite-map, $sprite-name);

Returns the height of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-map-width()

	sprite-map-width($sprite-map);

Returns the total width of the spritemap.

---
### sprite-map-height()

	sprite-map-height($sprite-map);

Returns the total height of the spritemap.
