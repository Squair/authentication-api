import chai from 'chai';
import userModel from  '../schema/userSchema'

const { expect } = chai;

const validUser = { 
    "username": "test@email.com",
    "password": "Password123"
}

const invalidUser = {
    "username": "",
    "password": ""
}

const invalidUserCriteria = {
    "username": "invalidUsername",
    "password": "invalidpassword"
}

describe('#User schema', () => {
    it('Should be invalid if it doesnt have a username or password', (done) => {
        let user = new userModel(invalidUser);
 
        user.validate((err) => {
            expect(err.errors.username).to.exist;
            expect(err.errors.username.properties.message).to.equal('Email is required.');

            expect(err.errors.password).to.exist;
            expect(err.errors.password.properties.message).to.equal('Password is required.');

            done();
        });
    });

    it('Should be invalid if a username or password does not meet criteria', (done) => {
        let user = new userModel(invalidUserCriteria);

        user.validate((err) => {
            expect(err.errors.username).to.exist;
            expect(err.errors.username.properties.message).to.equal('Please enter a valid email address.');

            expect(err.errors.password).to.exist;
            expect(err.errors.password.properties.message).to.equal('Password must contain at least one number, one lowercase and one uppercase letter and be at least six characters.');

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
