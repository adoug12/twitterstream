let id = '';

const submitQuery = () => {
  const words = $('#words').val();
  $.post('/', { words })
    .then(res => {
      id = res;
      setTimeout(getStatus, 2000);
    })
    .catch(err => console.log(err));
};

const getStatus = () => {
  const words = $('#words').val();
  $.get('/status', { id })
    .then(res => {
      const sentiment =
        res.sentiments.reduce((p, c) => p + c, 0) / res.sentiments.length;
      if (res.sentiment < -0.5) {
        $(':button').prop('disabled', true);
        $('#red').prop('disabled', false);
      } else if (sentiment > -0.5 && sentiment < 0) {
        $(':button').prop('disabled', true);
        $('#yellow').prop('disabled', false);
      } else if (sentiment > 0 && sentiment < 0.5) {
        $(':button').prop('disabled', true);
        $('#blue').prop('disabled', false);
      } else if (sentiment > 0.5) {
        $(':button').prop('disabled', true);
        $('#blue').prop('disabled', false);
      }
      $('#results').html(`Tweets Analyzed: ${res.sentiments.length}`);
      setTimeout(getStatus, 2000);
    })
    .catch(err => {
      setTimeout(getStatus, 2000);
      console.log(err);
      console.log('Failed to get status');
    });
};
