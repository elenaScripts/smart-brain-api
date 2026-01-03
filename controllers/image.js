// Using Clarifai REST API directly instead of SDK
const PAT = process.env.PAT;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

const handleAPICall = (req, res) => {
  if (!req.body.input) {
    return res.status(400).json('missing input field');
  }
  
  const raw = JSON.stringify({
    "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
    },
    "inputs": [
      {
        "data": {
          "image": {
            "url": req.body.input
          }
        }
      }
    ]
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, requestOptions)
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(JSON.stringify(err));
        });
      }
      return response.json();
    })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log('=== Clarifai API Error ===');
      console.log('Error:', err);
      
      let errorMessage = 'unable to work with API';
      try {
        const errorData = JSON.parse(err.message);
        errorMessage = errorData.status?.description || 
                      errorData.status?.errorDetails ||
                      errorData.status?.message ||
                      errorMessage;
      } catch (e) {
        errorMessage = err.message || errorMessage;
      }
      
      console.log('Final error message:', errorMessage);
      res.status(400).json(errorMessage);
    });
}

const handleImage = (req, res, db) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
      .increment('entries', 1)
      .returning('entries')
      .then(entries => {
        res.json(entries[0].entries);
      })
      .catch(err => res.status(400).json('unable to update entries'));
  }

  module.exports = {
    handleImage,
    handleApiCall: handleAPICall
  }