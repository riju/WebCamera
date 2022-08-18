# getUserMedia Camera Constraint Effects Test

This directory contains a simple demo to turn on/off the background blur
effect with camera.

It depends on patch [Background blur
constraints and settings](https://chromium-review.googlesource.com/c/chromium/src/+/3714592)
which adds the new Media Stream based constraint into the web API.
Chromium will also need option `--enable-blink-features=MediaCaptureBackgroundBlur`
to enable the new API. Furthermore, a compatible platform is required.
Currently, a recent version of Windows is required with Intel hardware with
IPU6 and MIPI camera.

* See [Explainer](https://github.com/riju/backgroundBlur/blob/main/explainer.md)
for the background.

* See [Pull request](https://github.com/w3c/mediacapture-extensions/pull/49) for
the specification.

* See [patch](https://chromium-review.googlesource.com/c/chromium/src/+/3714592)
for implementation.

