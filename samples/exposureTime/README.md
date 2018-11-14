#Goal.

Demonstrate how to use manual exposureMode to set the exposureTime.

#Motivation

Image Capture API has an API for setting exposureMode to manual,
but it is not very useful if the exposure time (aka shutter speed,
aka exposure duration) cannot be set in manual exposure mode.
This API provides an interface for getting the exposure time range values
as well as setting the exposure time in time units.

Shutter speed needs to be controlled to take low-light pictures or
create motion-blur effects. This can also be used to create HDR images.


#Useful Links

Chromium Implementation:
Intent to Implement and Ship:
https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ls3wQSoHOUY

Crbug:
https://bugs.chromium.org/p/chromium/issues/detail?id=823316

W3C Spec:
https://github.com/w3c/mediacapture-image/issues/199
https://github.com/w3c/mediacapture-image/pull/200
