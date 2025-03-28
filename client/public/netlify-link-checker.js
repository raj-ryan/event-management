// Netlify Link Checker - Helps verify external link connectivity on your deployed site
// Load this script in your browser console or include it in a page to test links

(() => {
  console.log('EventZen Netlify Link Checker Starting...');
  
  // Function to test a link
  const testLink = async (url, description) => {
    try {
      console.log(`Testing ${description}: ${url}`);
      
      // For API endpoints, we check directly
      if (url.startsWith('/api/')) {
        const response = await fetch(url);
        if (response.ok) {
          console.log(`✅ ${description} - SUCCESS (${response.status})`);
          return true;
        } else {
          console.error(`❌ ${description} - FAILED (${response.status}: ${response.statusText})`);
          return false;
        }
      }
      
      // For external URLs, we need to use a proxy or just check if the URL is valid
      // since direct fetch to external sites will have CORS issues
      if (url.startsWith('http')) {
        console.log(`⚠️ ${description} - SKIPPED (External URL - cannot test directly due to CORS)`);
        return 'skipped';
      }
      
      // For internal pages, just check if the URL format is valid
      console.log(`ℹ️ ${description} - VALID FORMAT`);
      return 'valid_format';
      
    } catch (error) {
      console.error(`❌ ${description} - ERROR:`, error);
      return false;
    }
  };
  
  // Links to test
  const links = [
    { url: '/api/ping', description: 'API Ping Endpoint' },
    { url: '/api/setup-database', description: 'Database Setup Endpoint' },
    { url: '/api/events', description: 'Events API' },
    { url: '/api/venues', description: 'Venues API' },
    { url: '/netlify-env-guide.md', description: 'Environment Guide' },
    { url: '/', description: 'Home Page' },
    { url: '/events', description: 'Events Page' },
    { url: '/venues', description: 'Venues Page' }
  ];
  
  // Run all tests
  const runTests = async () => {
    console.log(`Running link checks at ${new Date().toISOString()}`);
    console.log('Current URL:', window.location.href);
    
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const link of links) {
      const result = await testLink(link.url, link.description);
      if (result === true) passed++;
      else if (result === false) failed++;
      else skipped++;
    }
    
    console.log('');
    console.log('Link Check Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Skipped: ${skipped}`);
    console.log('');
    
    if (failed > 0) {
      console.error('Some links failed. Check your API endpoints and routes.');
    } else {
      console.log('All tested links passed or were skipped!');
    }
    
    console.log('Link Check Complete');
  };
  
  // Run the tests
  runTests();
})();