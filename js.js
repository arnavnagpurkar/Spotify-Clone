const repoOwner = 'arnavnagpurkar';
const repoName = 'Spotify-Clone';
const directoryPath = 'assets/songs';

// Fetch the contents of the directory using the GitHub API
fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${directoryPath}`)
  .then(response => {
    // Check if the response is successful (status code 200)
    if (!response.ok) {
      throw new Error(`Failed to fetch directory: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    // Extract file names from the API response
    const fileNames = data.map(file => file.name);

    // Use the file names as needed (e.g., log them)
    console.log('Files in the directory:', fileNames);
  })
  .catch(error => {
    console.error('Error fetching directory content:', error.message);
  });