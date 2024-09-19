import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Paper, Select, MenuItem, InputLabel, FormControl, Slider } from '@mui/material';

const SpeechComponent = () => {
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState([]);
  const [recognitionVoice, setRecognitionVoice] = useState('');
  const [synthesisVoice, setSynthesisVoice] = useState('');
  const [rate, setRate] = useState(1); 
  const [pitch, setPitch] = useState(1);

  useEffect(() => {
    // Load the available voices from the Web Speech API
    const synth = window.speechSynthesis;
    const populateVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setRecognitionVoice(availableVoices[0].name); 
        setSynthesisVoice(availableVoices[0].name); 
      }
    };

    populateVoices();
    synth.onvoiceschanged = populateVoices;
  }, []);

  const handleSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = recognitionVoice.split(' ')[0]; 
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

  const handleSynthesize = () => {
    if (!transcript) return;
  
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(transcript);
        utterance.voice = voices.find(voice => voice.name === synthesisVoice); 
        utterance.rate = rate; 
        utterance.pitch = pitch;
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
        Speech Recognition and Synthesis
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Speech Recognition Voice</InputLabel>
        <Select
          value={recognitionVoice}
          onChange={(e) => setRecognitionVoice(e.target.value)}
          label="Speech Recognition Voice"
        >
          {voices.map((voice) => (
            <MenuItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Speech Synthesis Voice</InputLabel>
        <Select
          value={synthesisVoice}
          onChange={(e) => setSynthesisVoice(e.target.value)}
          label="Speech Synthesis Voice"
        >
          {voices.map((voice) => (
            <MenuItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography gutterBottom>Speech Rate: {rate}</Typography>
      <Slider
        value={rate}
        onChange={(e, newValue) => setRate(newValue)}
        min={0.1}
        max={2}
        step={0.1}
        valueLabelDisplay="auto"
      />

      <Typography gutterBottom>Speech Pitch: {pitch}</Typography>
      <Slider
        value={pitch}
        onChange={(e, newValue) => setPitch(newValue)}
        min={0}
        max={2}
        step={0.1}
        valueLabelDisplay="auto"
      />

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
          disabled={!transcript}
        >
          Speak Transcript
        </Button>
      </div>
    </Container>
  );
};

export default SpeechComponent;
