import { useState } from "react";
import { ZSummaryResponse, type Channel, type Message } from "../../../../packages/shared/src/schema.ts"
import { useStore } from "../../data/store.ts"


function Channels() {
  const [data, setData] = useState<Channel[]>([])
  const [message, setMessage] = useState<Message[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [text, setText] = useState("")
  const token = useStore(store => store.token)
  const [error, setError] = useState("")
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const [summary, setSummary] = useState("")


  async function handleClick() {
    const response = await fetch("/api/channels")
    const result = await response.json()
    setData(result)
  }

  async function loadMessages(channelName: string) {
    const response = await fetch(`/api/channels/${channelName}/messages`, {
      headers: authHeaders
    })
    if (!response.ok) {
      setError(response.status === 401 ? "Logga in för att se den här kanalen" : "Något gick fel")
      setMessage([])
      setSelectedChannel(null)
      return
    }
    const result = await response.json()
    setError("")
    setSummary("")
    setMessage(result)
    setSelectedChannel(channelName)
  }

  async function sendMessage() {
    if (!selectedChannel) return

    const response = await fetch(`/api/channels/${selectedChannel}/messages`, {
      method: "POST",
      headers: { "Content-type": "application/json", ...authHeaders },
      body: JSON.stringify({ text })
    })
    if (!response.ok) {
      setError("Kunde inte skicka meddelandet")
      return
    }

    setText("")
    loadMessages(selectedChannel)
  }

  async function summarizeChannel() {
    if (!selectedChannel) return

    setSummary("Sammanfattar...")
    try {
      const response = await fetch(`/api/channels/${selectedChannel}/summary`, {
        method: "POST",
        headers: authHeaders
      })
      if (!response.ok) {
        setSummary("")
        setError("Kunde inte sammanfatta kanalen")
        return
      }
      const data: unknown = await response.json()
      const parsed = ZSummaryResponse.safeParse(data)
      if (!parsed.success) {
        setSummary("")
        setError("Oväntat svar från servern")
        return
      }
      setError("")
      setSummary(parsed.data.summary)
    } catch (error) {
      console.error(error)
      setSummary("")
      setError("Något gick fel")
    }
  }


  return (
    <div>
      <p>{error}</p>
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
      {selectedChannel && (
        <div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Skriv ett meddelande"
          />
          <button onClick={sendMessage}>Skicka</button>
          <button onClick={summarizeChannel}>Sammanfatta kanalen</button>
          <p>{summary}</p>
        </div>
      )}
    </div>
  )
}


export default Channels