import './App.css'
import { Editor } from '@monaco-editor/react'
import {MonacoBinding} from "y-monaco"
import { useRef, useMemo, useState } from 'react'
import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'

function App() {

  const [usernameInput, setUsernameInput] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);

  const editorRef = useRef(null);

  const ydoc = useMemo(()=> new Y.Doc(),[])
  const yText = useMemo(()=> ydoc.getText('monaco'),[ydoc]) 

  const handleMount = (editor) => {
    editorRef.current = editor;


    const provider = new SocketIOProvider('http://localhost:3000', 'monaco-demo', ydoc,
      {autoConnect : true});

    provider.awareness.setLocalStateField('user', {
      name: username,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    });

    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states.map(state => state.user).filter(Boolean);
      setActiveUsers(users);
    });

    // Make sure we set the initial active users too!
    const initialStates = Array.from(provider.awareness.getStates().values());
    setActiveUsers(initialStates.map(state => state.user).filter(Boolean));

    new MonacoBinding(
    yText,
    editorRef.current.getModel(), 
    new Set([editorRef.current]), 
    provider.awareness)
  }



  if (!hasJoined) {
    return (
      <div className="h-screen w-full bg-gray-950 flex items-center justify-center">
        <div className="bg-neutral-800 p-8 rounded-lg shadow-lg flex flex-col items-center gap-4 min-w-[300px]">
          <h1 className="text-white text-2xl font-bold">Join Code Editor</h1>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-neutral-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && usernameInput.trim()) {
                setUsername(usernameInput.trim());
                setHasJoined(true);
              }
            }}
          />
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={() => {
              if (usernameInput.trim()) {
                setUsername(usernameInput.trim());
                setHasJoined(true);
              }
            }}
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
  <main 
  className="h-screen w-full bg-gray-950 flex gap-4 p-4">
    <aside
    className='h-full w-1/4 bg-neutral-900 rounded-lg p-4 flex flex-col gap-3 overflow-y-auto'
    >
      <h2 className="text-white font-bold text-lg mb-2 border-b border-neutral-700 pb-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        Active Users ({activeUsers.length})
      </h2>
      <div className="flex flex-col gap-2">
        {activeUsers.map((user, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-800 transition-colors">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: user.color || '#3b82f6' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-neutral-300 font-medium truncate" title={user.name}>
              {user.name} {user.name === username ? <span className="text-neutral-500 text-sm font-normal">(You)</span> : ''}
            </span>
          </div>
        ))}
      </div>
    </aside>
    <section className='w-3/4 bg-neutral-800 rounded-lg overflow-hidden flex flex-col'>
      <div className="bg-neutral-900 px-4 py-2 text-neutral-400 text-sm flex justify-between items-center border-b border-neutral-700">
        <span>index.js</span>
        <div className="flex -space-x-2 overflow-hidden items-center">
          {activeUsers.slice(0, 5).map((u, i) => (
             <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-neutral-900 flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: u.color || '#3b82f6' }} title={u.name}>
               {u.name.charAt(0).toUpperCase()}
             </div>
          ))}
          {activeUsers.length > 5 && (
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-neutral-900 bg-neutral-700 flex items-center justify-center text-xs text-white">
              +{activeUsers.length - 5}
            </div>
          )}
        </div>
      </div>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue="// write your code here"
        theme='vs-dark'
        onMount={handleMount}
      />
    </section>
   </main>
      
  )
}

export default App
