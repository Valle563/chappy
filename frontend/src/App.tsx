import { useState } from "react";
import type { Channel } from "../../packages/shared/src/schema.ts"

function App() {
  const [data, setData] = useState<Channel[]>([])
  
  async function handleClick() {
    const response = await fetch("/api/channels")
    const result = await response.json()
    setData(result)
  }

  return (
    <div>
      <button onClick={handleClick}> Hämta kanaler </button>
      <ul>
        {data.map((item) => (
          <li key={item.pk}>{item.pk.replace("CHANNEL#", "")}</li>
        ))}
      </ul>
    </div>
  )
}

export default App