import chai from 'chai';
import userModel from  '../schema/userSchema.js'

const { expect } = chai;

const validUser = { 
    "username": "test@email.com",
    "password": "password"
}

describe('#User schema', () => {
    it('Should be invalid if it doesnt have a username or password', (done) => {
        let user = new userModel();
 
        user.validate((err) => {
            expect(err.errors.username).to.exist;
            expect(err.errors.password).to.exist;

            done();
        });
    });

    it('Should successfully validate a schema valid user with all properties present', (done) => {
        let user = new userModel(validUser);

        user.validate((err) => {
            expect(err).to.not.exist;
            done();
        });
    });
});
