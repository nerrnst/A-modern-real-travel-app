const { handleFormSubmission, buildBookingText } = require('./lib/email');

module.exports = async function handler(req, res) {
  return handleFormSubmission({
    req,
    res,
    routeName: 'booking',
    subjectPrefix: 'Booking request from ',
    payloadBuilder: buildBookingText,
  });
};
