import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">EventZen</h1>
      <p className="text-xl mb-8">Welcome to the EventZen platform!</p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Quick Test</h2>
        <p className="mb-4">Application is now using PostgreSQL database storage</p>
        
        <div className="flex justify-center items-center gap-4 my-4">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setCount(count - 1)}
          >
            Decrease
          </button>
          
          <span className="text-2xl font-bold">{count}</span>
          
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setCount(count + 1)}
          >
            Increase
          </button>
        </div>
        
        <p className="text-gray-600 mt-4">
          This is a simplified version to test basic functionality.
          Once this is working, we'll re-enable the full application.
        </p>
      </div>
    </div>
  );
}

export default App;
