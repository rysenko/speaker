var ATTENDEE_API = 'http://107.170.105.13/api/';

describe('AttendeeClient', function () {
    beforeAll(function () {
        this.client = new window.AttendeeClient(ATTENDEE_API);
    });
    it('should exist', function () {
        expect(this.client).toBeDefined();
    });
    var randomUser = null;
    it('should join and receive message', function (done) {
        this.client.once('activeSpeaker', (function (user) {
            expect(user).toBeTruthy();
            expect(user.id).toBeTruthy();
            randomUser = user;
            done();
        }).bind(this));
        this.client.join('login', 'password', (function () {
            expect(this.client.token).toBeDefined();
        }).bind(this));
    });
    it('should mute and receive message', function (done) {
        this.client.once('muteState', function (user) {
            expect(user).toBeDefined();
            expect(user.muted).toBeTruthy();
            expect(user.id).toEqual(randomUser.id);
            done();
        });
        this.client.mute(randomUser.id, function (err, response) {
            expect(err).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response && response.status).toEqual('ok');
        });
    });
    it('should unmute and receive message', function (done) {
        this.client.once('muteState', function (user) {
            expect(user).toBeDefined();
            expect(user.muted).toBeFalsy();
            expect(user.id).toEqual(randomUser.id);
            done();
        });
        this.client.unmute(randomUser.id, function (err, response) {
            expect(err).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response && response.status).toEqual('ok');
        });
    });
});