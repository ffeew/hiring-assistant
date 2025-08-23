import { useState, useEffect, useRef, useCallback } from 'react';

export interface SpeechRecognitionHookResult {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, confidence: number, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// ============================================================================
// SPEECH RECOGNITION HOOK
// ============================================================================

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHookResult {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError,
    onEnd,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  // Check for browser support on mount
  useEffect(() => {
    interface WindowWithSpeechRecognition extends Window {
      SpeechRecognition?: new() => SpeechRecognition;
      webkitSpeechRecognition?: new() => SpeechRecognition;
    }
    
    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognitionConstructor = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionConstructor();
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
  }, []);

  // Configure speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    // Handle speech recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        const confidenceScore = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcriptText + ' ';
          setConfidence(confidenceScore);
          
          // Call onResult callback for final results
          if (onResult) {
            onResult(transcriptText.trim(), confidenceScore, true);
          }
        } else {
          interimTranscript += transcriptText;
          
          // Call onResult callback for interim results
          if (onResult) {
            onResult(transcriptText.trim(), confidenceScore, false);
          }
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setTranscript(finalTranscript.trim());
      setInterimTranscript(interimTranscript);
    };

    // Handle recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) {
        onEnd();
      }
    };

    // Handle recognition errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      if (onError) {
        onError(event.error);
      }
    };

    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onerror = null;
      }
    };
  }, [continuous, interimResults, language, onResult, onError, onEnd]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      setError('Speech recognition is not available');
      return;
    }

    if (isListening) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      setError('Failed to start speech recognition');
      console.error('Speech recognition start error:', error);
    }
  }, [isSupported, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Speech recognition stop error:', error);
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
    finalTranscriptRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}