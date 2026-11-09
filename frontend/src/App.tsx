import { useState } from "react";
import type { Channel, Message } from "../../packages/shared/src/schema.ts"


function App() {
  const [data, setData] = useState<Channel[]>([])
  const [message, setMessage] = useState<Message[]>([])
  
  async function handleClick() {
    const response = await fetch("/api/channels")
    const result = await response.json()
    setData(result)
  }
  
  async function loadMessages(channelName: string)  {
    const response = await fetch(`/api/channels/${channelName}/messages`)
    const result = await response.json()
    setMessage(result)
  }
  
  return (
    <div>
      <button onClick={handleClick}> Hämta kanaler </button>
      <ul>
        {data.map((item) => (
        <li key={item.pk}>
          <button onClick={() => loadMessages(item.pk.replace("CHANNEL#", ""))}>
            {item.pk.replace("CHANNEL#", "")}
          </button>
        </li>
        ))}
      </ul>
      <ul>
        {message.map((msg) => (
          <li key={msg.sk}> {msg.sender}: {msg.text}</li>
        ))}
      </ul>
    </div>
  )
}


export default App