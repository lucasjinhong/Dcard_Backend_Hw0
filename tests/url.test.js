const request = require("supertest");
const { response } = require("../app");
const app = require("../app");

describe('shorten_url API', () => {
    it('GET /url_id --> redirect to the original url', () => {
        return request(app)
            .get('/VE-u01WAp') //Pre-saved in the database
            .expect(302) //mean redirect
    });

    it('GET /url_id --> 404 if not found', () => {
        request(app).get('/12345678').expect(404); //if below 9
        request(app).get('/1234567890').expect(404); //if above 9
        request(app).get('/').expect(404); //if null
        request(app).get('/z_lo4qXto').expect(404); //if doesn't exists
        request(app).get('/123456789').expect(404); //if expired
        return;
    });

    it('POST /url --> create a new shorten_url', () => {
        return request(app).post('/url').send({
            url: "https://www.youtube.com",
            expiredAt: "2022-03-20 09:20:41"
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
            expect(response.body).toMatchObject(
                expect.objectContaining({
                    _id: expect.any(String),
                    shorten_url: expect.any(String)
                })
            );
        });
    });

    it('GET /url --> validation error', () => {
        request(app).post('/url').send({url: "", expiredAt: ""}).expect(422); //if content have null
        request(app).post('/url').send({url: "https://www.youtube.com", expiredAt: "2022-03-20T09:20:41Z"}).expect(422); //if datetype wrong
        return;
    });
})