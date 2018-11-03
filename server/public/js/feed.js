let lastSeen;

const submitQuery = () => {
  const words = $('#words').val();
  console.log(words);
  $.post('/', { words, lastSeen })
    .then(res => {
      lastSeen = new Date();
      //setTimeout(getUpdates, 10000);
    })
    .catch(err => {
      $('#tweetContainer').prepend('<p>Failed to submit query.</p>');
    });
};

const getUpdates = () => {
  const words = $('#words').val();
  $.post('/', { words, lastSeen })
    .then(res => {
      lastSeen = new Date();
      setTimeout(getUpdates, 10000);
    })
    .catch(err => {
      $('#tweetContainer').prepend('<p>Failed to retrieve tweets.</p>');
    });
  // $.get('/words', { lastSeen })
  //   .then(data => {
  //     // data.forEach(tweet => {
  //     //   let output = `<p class="small">${tweet.text}</p>`;
  //     //   $('#tweetContainer').prepend(output);
  //     // });
  //     lastSeen = new Date();
  //     setTimeout(getUpdates, 3000);
  //   })
};
