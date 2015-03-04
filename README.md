Speaker Test Task
===

Main library is located at public/lib/attendee.js. Due to requirement of zero-dependency it has everything implemented
from scratch (including simple event emitter).

Tests for the library are located at public/spec.

UI (simple Angular.js app) is in public. It also includes trivial backend in node.js that only serves static files.

Sample web UI application is expected to be published with regular Heroku node-stack.

Inconsistencies
===

muteState event returns user with id of type String instead of Number for activeSpeaker.