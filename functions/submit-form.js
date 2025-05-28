// netlify/functions/submit-form.js
exports.handler = async (event) => {
  const formData = JSON.parse(event.body);
  
  const response = await fetch(process.env.FORM_SUBMISSION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });
  
  return {
    statusCode: response.status,
    body: await response.text()
  };
};