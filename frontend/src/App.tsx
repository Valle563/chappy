import { useState } from "react";
import type { Channel, Message } from "../../packages/shared/src/schema.ts"


function App() {
  const [data, setData] = useState<Channel[]>([])
  const [message, setMessage] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [text, setText] = useState("")

  
  async function handleClick() {
    const response = await fetch("/api/channels")
    const result = await response.json()
    setData(result)
  }
  
  async function loadMessages(channelName: string)  {
    const response = await fetch(`/api/channels/${channelName}/messages`)
    const result = await response.json()
    setMessage(result)
    setSelectedChannel(channelName)
  }

  async function sendMessage() {
    if (!selectedChannel) return

    await fetch(`/api/channels/${selectedChannel}/messages`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ sender: "Gäst", text })
    })

    setText("")
    loadMessages(selectedChannel)
  }
  
  return (
    <div>
      <button onClick={handleClick}> Hämta kanaler </button>
      <ul>
        {data.map((item) => (
        <li key={item.pk}>
          <button onClick={() => loadMessages(item.pk.replace("CHANNEL#", ""))}>
            {item.pk.replace("CHANNEL#", "")} 
            {/* handle klick */}
          </button>
        </li>
        ))}
      </ul>
      <ul>
        {message.map((msg) => (
          <li key={msg.sk}> {msg.sender}: {msg.text}</li>
        ))}
      </ul>
            {selectedChannel && (
        <div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Skriv ett meddelande"
          />
          <button onClick={sendMessage}>Skicka</button>
        </div>
      )}
    </div>
  )
}


export default App