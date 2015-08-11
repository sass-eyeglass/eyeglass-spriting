![CI Status](https://api.travis-ci.org/sass-eyeglass/eyeglass-spriting.svg?branch=master)

# Eyeglass Spriting

For basic usage, check out the [eyeglass spriting example project](https://github.com/sass-eyeglass/spriting-example).

To use spriting, install eyeglass and eyeglass-spriting:

	npm install eyeglass --save-dev
	npm install eyeglass-spriting --save-dev

Register your sprite source images as [eyeglass assets](https://github.com/sass-eyeglass/eyeglass#working-with-assets), and `@import 'spriting'` in your sass files.

Please also note this requires either:

  - `node` version `0.12` or newer (check with `node -v`), or
  - the [Babel polyfill] for node `0.12` compatibility (`npm install --save-dev babel` and add `require("babel/polyfill");` to the top of your build file (like `Brocfile.js` or `ember-cli-build.js`).

[Babel polyfill]: http://babeljs.io/docs/usage/polyfill/ "Babel.js polyfill information"

# Quick Start

When working with a large number of sprites, you can generate css selectors by iterating through them:

```scss
@import "spriting";
@import "assets";

// icon sprites
$icon-sprite-map: sprite-map('icon-sprite-map',
                              sprite-layout(horizontal, (spacing: 5px, alignment: bottom)),
                             'images/icons/*');


%icon-bg {
  // calling sprite-background generates the sprite map image
  @include sprite-background($icon-sprite-map);
}

@each $icon in sprite-list($icon-sprite-map) {
  .icon-#{sprite-identifier($icon-sprite-map, $icon)} {
    @extend %icon-bg;
    @include sprite-position($icon-sprite-map, $icon);
    // If all of your sprites are the same size, include sprite-dimensions() in %icon-bg
    @include sprite-dimensions($icon-sprite-map, $icon);
  }
}
```

When you need to refer to all your sprites individually, it is recommended that you do not use globbing to create your sprite map:

```scss
$button-sprite-map: sprite-map('buttons-sprite-map',
                                sprite-layout(horizontal, (spacing: 0px, alignment: bottom)),
                               "images/buttons/blue.png",
                               "images/buttons/blue_hover.png",
                               "images/buttons/blue_active.png");

%button-bg {
  @include sprite-background($button-sprite-map);
}

.blue-button {
  @extend %button-bg;
  @include sprite-position($button-sprite-map, "images/buttons/blue.png");
  @include sprite-dimensions($button-sprite-map, "images/buttons/blue.png");
  color: white;
  text-align: center;
}

.blue-button:hover {
  @include sprite-position($button-sprite-map, "images/buttons/blue_hover.png");
}

.blue-button:active {
  @include sprite-position($button-sprite-map, "images/buttons/blue_active.png");
}
```

# Eyeglass Spriting Sass API

### sprite-map()

```scss
sprite-map($name, $layout, $paths...);
```

Returns a Sass map containing information about the sprite map and individual sprites, which can be passed into other spriting functions. It can take multiple sprite sources, which can be paths or glob patterns, and can be from different modules. PNG, JPG, and GIF files can be made into sprites. Sprites are named using their original asset source paths.

Note that sprite-map() does not actually generate the sprite map image. Instead, this happens when the sprite-url() function or sprite-background() mixin are used.

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

```scss
$icon-sprite-map: sprite-map($name: "icons-sprite-map",
                             $layout: sprite-layout(horizontal, (spacing: 5px; alignment: bottom)),
                             "module-a/icon-home.png",
                             "module-b/icons/*");
```

`$icon-sprite-map` is now a Sass map which can be passed into the other spriting functions to get information about your sprites.

---
### sprite-layout()

```scss
sprite-layout($strategy, (spacing : 5px, alignment: $alignment));
```

Validates the given layout options, and returns a map of sprite layout settings which can be passed directly into sprite-map(). It is recommended that you pass the output of sprite-layout() into sprite-map(), rather than generating your own layout.

Possible strategies and corresponding alignments are:

`"vertical"` - alignment `"left"` or `"right"` (defaults to `"left"` if unspecified)

`"horizontal"` - alignment `"top"` or `"bottom"` (defaults to `"top"` if unspecified)

`"diagonal"` - no alignment needed; spacing does not apply

Will return an error if the alignment is invalid for the given strategy, or the strategy is invalid. Spacing and alignment values are both optional.

---
### sprite-list()

```scss
sprite-list($sprite-map);
```

Returns a list of the names of each sprite in the sprite map.

---
### sprite-url()

```scss
sprite-url($sprite-map);
```

Generates the sprite map image, and returns the path to the constructed sprite map image.

For example,

```scss
sprite-url($icon-sprite-map);
```

might generate a sprite map image at `assets/icons-sprite-map.png`.

---
### sprite-background() *(mixin)*

```scss
sprite-background($sprite-map, $repeat: no-repeat);
```

A mixin that sets the background image to the generated spritemap image, with an optional repeat argument. For example,

```scss
.icon-bg {
  @include sprite-background($icon-sprite-map);
}
```

Might compile to the following css:

```scss
.icon-bg {
  background: url("/assets/icon-sprite-map.png") no-repeat;
}
```

Also causes the sprite map image to be generated.

---
### sprite-position() *(mixin)*

```scss
sprite-position($sprite-map, $sprite-name);
```

A mixin that sets the background position to the position of the given sprite. For example,

```scss
.icon-home {
  @include sprite-background($icon-sprite-map);
  @include sprite-position($icon-sprite-map, "icons/home.png");
}
```

Might compile to the following css:

```scss
.icon-home {
  background: url("/assets/icon-sprite-map.png");
  background-position: 50px 100px;
}
```
---
### sprite-dimensions() *(mixin)*

```scss
sprite-dimensions($sprite-map, $sprite-name);
```

A mixin that sets the dimensions of the element to the dimensions of the given sprite. For example,

```scss
.icon-home {
  @include sprite-background($icon-sprite-map);
  @include sprite-position($icon-sprite-map, "icons/home.png");
  @include sprite-dimensions($icon-sprite-map, "icons/home.png");
}
```

Might compile to the following css:

```scss
.icon-home {
  background: url("/assets/icon-sprite-map.png");
  background-position: 50px 100px;
  width: 32px;
  height: 32px;
}
```

---
### sprite-position() *(function)*

```scss
sprite-position($sprite-map, $sprite-name);
```

Returns the position for the given sprite name in the given sprite map, in a format that is suitable for use as a value to background-position:

```scss
background-position: sprite-position($icons-sprite-map, "icons/home.png");
```

Might generate something like:

```scss
background-position: 50px 100px;
```

---
### sprite-position-x()

```scss
  sprite-position-x($sprite-map, $sprite-name);
```

Returns the x coordinate of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-position-y()

```scss
sprite-position-y($sprite-map, $sprite-name);
```

Returns the y coordinate of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-width()

```scss
sprite-width($sprite-map, $sprite-name);
```

Returns the width of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-height()

```scss
sprite-height($sprite-map, $sprite-name);
```
Returns the height of the sprite. $sprite-map is returned from sprite-map(), and $sprite-name is the original asset url of the sprite.

---
### sprite-map-width()

```scss
sprite-map-width($sprite-map);
```

Returns the total width of the spritemap.

---
### sprite-map-height()

```scss
sprite-map-height($sprite-map);
```

Returns the total height of the spritemap.

---
### sprite-identifier()

```scss
sprite-identifier($sprite-map, $sprite-name);
```

Returns the sprite identifier, which is by default the basename of the source image. For example,

```scss
sprite-identifier($icon-sprite-map, "icons/home.png")
```

might return `home`, if the original asset source path for this sprite was `icons/home.png`. This is useful for naming your css selectors for sprites. The option to set custom identifiers will be available in a future release.
