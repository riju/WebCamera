# Goal

Demonstrate how to use manual exposureMode and focusDistance.

# Motivation

Image Capture API has an API for setting exposureMode to manual,
but it is not very useful if the exposure time (aka shutter speed,
aka exposure duration) cannot be set in manual exposure mode.
This API provides an interface for getting the exposure time range values
as well as setting the exposure time in time units.

Shutter speed needs to be controlled to take low-light pictures or
create motion-blur effects. This can also be used to create HDR images.

Image Capture API also has an API for setting focusMode to manual, 
but it is not very useful if the focus distance cannot be set. 
This API provides an interface for getting focus range values as 
well as setting focus distance value.

This can be used to create Depth of Field or "bokeh" effect, and 
will also be useful for Focus Stacking.


## Useful Links

Chromium Implementation:
Intent to Implement and Ship:
https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ls3wQSoHOUY
https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/oNxzXaFY9c8

Crbug:
https://bugs.chromium.org/p/chromium/issues/detail?id=823316
https://bugs.chromium.org/p/chromium/issues/detail?id=732807

W3C Spec:
https://github.com/w3c/mediacapture-image/issues/199
https://github.com/w3c/mediacapture-image/pull/200
https://github.com/w3c/mediacapture-image/pull/175
