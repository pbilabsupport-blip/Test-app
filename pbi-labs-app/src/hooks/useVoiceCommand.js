import { useState } from 'react';

export default function useVoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const startListening = async () => {
    try {
      // Safely ask the browser for microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      console.log("Microphone access granted. Ready for AI integration.");
      // Future AI speech recognition logic goes here
    } catch (err) {
      setError("Microphone access denied or unavailable.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return { isListening, startListening, stopListening, error };
}