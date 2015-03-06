Speaker Test Task
===

Main library is located at [public/lib/attendee.js](https://github.com/rysenko/speaker/blob/master/public/lib/attendee.js).
Due to requirement of zero-dependency it has everything implemented from scratch (including simple event emitter).

Tests for the library are located at [public/spec](https://github.com/rysenko/speaker/tree/master/public/spec).

UI (simple Angular.js app) is in [public](https://github.com/rysenko/speaker/tree/master/public).
It also includes trivial backend in node.js that only serves static files.

Sample web UI application is expected to be published with regular Heroku buildpack for node.js.

See live at [http://speaker.rysenko.com/](http://speaker.rysenko.com/)

Inconsistencies
===

muteState event returns user with id of type String instead of Number for activeSpeaker.

activeSpeaker event doesn't have muted/unmuted state (that would be more convenient than separate flag in payload) and
doesn't have speaker name.