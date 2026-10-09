const { handleFormSubmission, buildContactText } = require('./lib/email');

module.exports = async function handler(req, res) {
  return handleFormSubmission({
    req,
    res,
    routeName: 'contact',
    subjectPrefix: 'Website enquiry from ',
    payloadBuilder: buildContactText,
  });
};
