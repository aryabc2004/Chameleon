import { useEffect } from 'react'
import { db } from './firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function Online({ goHome }) {
  useEffect(() => {
    async function testFirebase() {
      try {
        await setDoc(doc(db, "test", "connection"), { working: true })
        const result = await getDoc(doc(db, "test", "connection"))
        console.log("Firebase connected:", result.data())
      } catch (error) {
        console.error("Firebase error:", error)
      }
    }
    testFirebase()
  }, [])

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-xl">Testing Firebase connection...</p>
    </div>
  )
}