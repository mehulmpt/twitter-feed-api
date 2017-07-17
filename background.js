let tweetFunc = () => {
  getData()
  .then( info => checkIfExists(info))
  .then( info => {
    // create chrome notification

    let options = {
      type: "basic",
      title: info.name,
      message: info.desc,
      iconUrl: "icon.png"
    };

    chrome.notifications.create(info.link, options);

    return info;
  })
  .then( info => saveLink(info.link))
  .catch( err => { console.log(err); callTweet(); });

  function getData() {
    return new Promise((resolve, reject) => {
      $.get('https://twitter.com', function(data) {
        let tweet = $(data).find('div.tweet').eq(0);
        let link = tweet.attr('data-permalink-path');
        let name = tweet.find('strong.fullname').text();
        let desc = tweet.find('p.tweet-text').text();

        resolve({name, desc, link});
      });
    });
  }

  function checkIfExists(info) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('links', function(data) {
        var links = data.links || [];
        if(links.indexOf(info.link) === -1) {
          // it's fine to show the notification
          resolve(info);
        } else {
          reject('tweet already shown');
        }
      });
    });
  }

  function saveLink(link) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('links', function(data) {
        var links = data.links || [];
        links.push(link);
        chrome.storage.local.set({links}, () => {
          resolve('done');
          callTweet();
        });
      })
    });
  }
};

let callTweet = () => {
  setTimeout(tweetFunc, 2000);
};

callTweet();
