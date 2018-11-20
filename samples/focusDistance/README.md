# Goal

Demonstrate how to use manual focusMode to set the focusDistance.

# Motivation

Image Capture API has an API for setting focusMode to manual, 
but it is not very useful if the focus distance cannot be set. 
This API provides an interface for getting focus range values as 
well as setting focus distance value.

This can be used to create Depth of Field or "bokeh" effect, and 
will also be useful foc Focus Stacking.

## Useful Links

Chromium Implementation:
Intent to Implement and Ship:
https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/oNxzXaFY9c8

Crbug:
https://bugs.chromium.org/p/chromium/issues/detail?id=732807

W3C Spec:
https://github.com/w3c/mediacapture-image/pull/175
