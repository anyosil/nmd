document.addEventListener('DOMContentLoaded', function() {
  // --- Step 1: Access and Flatten the Database ---
  // Assuming 'database' is a global variable defined in script.js
  if (typeof database === 'undefined') {
    console.error('Error: The "database" variable is not defined in script.js');
    return;
  }

  function flattenDatabase(database) {
    const flattened = [];
    for (const key in database) {
      if (Array.isArray(database[key])) {
        flattened.push(...database[key]);
      } else if (typeof database[key] === 'object' && database[key] !== null) {
        flattened.push(database[key]);
      }
    }
    return flattened;
  }

  const flattenedDatabase = flattenDatabase(database);
  console.log('Flattened Database:', flattenedDatabase);

  // --- Step 2: Detect User Agent ---
  const userAgent = navigator.userAgent.toLowerCase();
  const isOldAndroid = userAgent.includes('android') && parseInt(userAgent.split('android')[1].split(';')[0]) <= 9;
  const isOldWindows = userAgent.includes('windows nt') && parseInt(userAgent.split('windows nt')[1].split(';')[0].split('.')[0]) <= 6; // Windows 8 is 6.2
  const isFirefoxOrEdge = userAgent.includes('firefox') || userAgent.includes('edg');

  const shouldShowNotification = isOldAndroid || isOldWindows || isFirefoxOrEdge;
  console.log('Should Show Notification:', shouldShowNotification);

  // --- Step 3 & 4: Get Current Song Details and Fetch Information ---
  function getCurrentSongDetails() {
    // In a real scenario, you would need to get the currently playing song's identifier
    // (e.g., from the audio element's source or a data attribute).
    // For this example, let's assume you have a function that returns the current song's title.
    const currentSongTitle = getCurrentPlayingSongTitle();
    if (!currentSongTitle) {
      console.warn('No song is currently playing or unable to determine the current song.');
      return null;
    }

    // Search the flattened database for the current song
    const currentSong = flattenedDatabase.find(song => song.title === currentSongTitle); // Adjust the key based on your database structure

    if (currentSong) {
      return {
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        cover: currentSong.cover // Assuming your song objects have a 'cover' property
      };
    } else {
      console.warn(`Song "${currentSongTitle}" not found in the database.`);
      return null;
    }
  }

  // --- Helper function (replace with your actual logic to get the current song title) ---
  function getCurrentPlayingSongTitle() {
    // This is a placeholder. You'll need to implement the logic to get the
    // title of the song currently playing in your audio element.
    // For example, you might read it from a data attribute or the audio source.
    // Let's assume for now that the first song in the flattened database is playing.
    if (flattenedDatabase.length > 0) {
      return flattenedDatabase[0].title;
    }
    return null;
  }

  // --- Step 5: Display Notification when Music is Played ---
  const audioElement = document.querySelector('audio'); // Assuming you have an <audio> element

  if (audioElement) {
    audioElement.addEventListener('play', function() {
      if (shouldShowNotification) {
        const songDetails = getCurrentSongDetails();
        if (songDetails) {
          if (Notification.permission === 'granted') {
            new Notification('Now Playing', {
              body: `${songDetails.title} - ${songDetails.artist} (${songDetails.album})`,
              icon: songDetails.cover // Path to the cover image
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
              if (permission === 'granted') {
                new Notification('Now Playing', {
                  body: `${songDetails.title} - ${songDetails.artist} (${songDetails.album})`,
                  icon: songDetails.cover
                });
              }
            });
          }
        }
      }
    });
  } else {
    console.warn('No <audio> element found on the page.');
  }
});