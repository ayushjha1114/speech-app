// src/SpeechComponent.js

import React, { useState } from 'react';
import { Button, Typography, Container, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

// Define supported languages for speech recognition and synthesis
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  // Add more languages as needed
];

const SpeechComponent = () => {
  const [transcript, setTranscript] = useState('');
  const [recognitionLanguage, setRecognitionLanguage] = useState('en');
  const [synthesisLanguage, setSynthesisLanguage] = useState('en');
  const [translatedText, setTranslatedText] = useState('');

  const handleSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = recognitionLanguage; // Use selected language for recognition
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let interimTranscript = '';

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript = result[0].transcript;
        }
      }

      // Only append final results to transcript
      setTranscript(prevTranscript => prevTranscript + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      console.log('Speech recognition service disconnected');
    };

    recognition.start();
  };

  const handleSynthesize = async () => {
    if (!transcript) return;
  
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(transcript); // Use original transcript
        utterance.lang = synthesisLanguage; // Use selected language for synthesis
        window.speechSynthesis.speak(utterance);
      } else {
        console.error('Speech synthesis not supported');
      }
    } catch (error) {
      console.error('Error during synthesis:', error);
    }
  };
  

  return (
    <Container component={Paper} style={{ padding: '20px', maxWidth: '600px', marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Speech Recognition and Synthesis with Translation
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Speech Recognition Language</InputLabel>
        <Select
          value={recognitionLanguage}
          onChange={(e) => setRecognitionLanguage(e.target.value)}
          label="Speech Recognition Language"
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Speech Synthesis Language</InputLabel>
        <Select
          value={synthesisLanguage}
          onChange={(e) => setSynthesisLanguage(e.target.value)}
          label="Speech Synthesis Language"
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div style={{ marginBottom: '20px' }}>
        <Button variant="contained" color="primary" onClick={handleSpeechRecognition}>
          Start Speech Recognition
        </Button>
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          Transcript: {transcript}
        </Typography>
      </div>

      <div>
        <Button
          variant="contained"
          color="secondary"
          style={{ marginTop: '20px' }}
          onClick={handleSynthesize}
          disabled={!transcript} // Disable button if transcript is empty
        >
          Translate and Speak Transcript
        </Button>
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          Translated Text: {translatedText}
        </Typography>
      </div>
    </Container>
  );
};

export default SpeechComponent;
