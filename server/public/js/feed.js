let id = '';
let queryInterval;
const analyzingHTML =
  '<p class="lead" id="analyzed">Tweets Analyzed: 0</p>\
<button class="btn btn-danger" id="red" disabled />\
<button class="btn btn-warning" id="yellow" disabled />\
<button class="btn btn-primary" id="blue" disabled />\
<button class="btn btn-success" id="green" disabled />';

const sendStop = () => {
  $.get('/stop')
    .then(res => {
      clearInterval(queryInterval);
      $('#mainButton')
        .removeClass('btn-danger')
        .addClass('btn-primary')
        .html('Submit')
        .attr('onclick', 'submitQuery()');
    })
    .catch(err => console.log(err));
};

const submitQuery = () => {
  const words = $('#words').val();
  $.post('/', { words })
    .then(res => {
      $('#mainButton')
        .removeClass('btn-primary')
        .addClass('btn-danger')
        .html('Stop')
        .attr('onclick', 'sendStop()');
      id = res;
      $('#results').html(analyzingHTML);
      queryInterval = setInterval(getStatus, 5000);
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
        $('#results :button').prop('disabled', true);
        $('#red').prop('disabled', false);
      } else if (sentiment > -0.5 && sentiment < 0) {
        $('#results :button').prop('disabled', true);
        $('#yellow').prop('disabled', false);
      } else if (sentiment > 0 && sentiment < 0.5) {
        $('#results :button').prop('disabled', true);
        $('#blue').prop('disabled', false);
      } else if (sentiment > 0.5) {
        $('#results :button').prop('disabled', true);
        $('#blue').prop('disabled', false);
      }
      $('#analyzed').html(`Tweets Analyzed: ${res.sentiments.length}`);
    })
    .catch(err => {
      console.log(err);
      console.log('Failed to get status');
    });
};
