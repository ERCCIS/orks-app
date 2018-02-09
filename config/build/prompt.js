module.exports = {
  keystore: {
    options: {
      questions: [
        {
          name: 'keystore-password',
          type: 'password',
          message: 'Please enter keystore password:',
        },
      ],
    },
  },
  keypassword: {
    options: {
      questions: [
        {
          name: 'key-password',
          type: 'password',
          message: 'Please enter key password:',
        },
      ],
    },
  },
};
