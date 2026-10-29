import { useState } from "react";

function App() {
  const [data, setData] = useState<string[]>([])
  
  async function handleClick() {
    const response = await fetch("/api/test")
    const result = await response.json()
    setData(result)
  }

  return (
    <div>
      <button onClick={handleClick}> Hämta färger </button>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default App