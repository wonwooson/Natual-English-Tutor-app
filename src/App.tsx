/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { PracticeBoxView } from './components/PracticeBoxView';
import { SaveBoxView } from './components/SaveBoxView';
import { QAView } from './components/QAView';
import { PracticeModal } from './components/PracticeModal';
import { Footer } from './components/Footer';
import {
  Expression,
  PracticeMessage,
  SavedPractice,
  QAMessage
} from './types';
import {
  generateExpressions,
  generateDialogue,
  answerQA
} from './ai';
import { PRACTICE_SYSTEM_PROMPT } from './prompts';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {

  const [scenario, setScenario] = useState('');
  const [results, setResults] = useState<Expression[]>([]);
  const [savedExpressions, setSavedExpressions] = useState<Expression[]>([]);
  const [savedPractices, setSavedPractices] = useState<SavedPractice[]>([]);
  const [qaHistory, setQAHistory] = useState<QAMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'practice_box' | 'save_box' | 'qa'>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [qaInput, setQAInput] = useState('');
  const [isQALoading, setIsQALoading] = useState(false);
  const [qaContext, setQAContext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Practice Mode State
  const [activePractice, setActivePractice] = useState<Expression | null>(null);
  const [practiceMessages, setPracticeMessages] = useState<PracticeMessage[]>([]);
  const [practiceInput, setPracticeInput] = useState('');
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [isKoreanMode, setIsKoreanMode] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const isPlayingAllRef = useRef(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [practiceMessages]);

  useEffect(() => {
    isPlayingAllRef.current = isPlayingAll;
  }, [isPlayingAll]);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          setSavedExpressions(data.collection || []);
          setSavedPractices(data.practices || []);
          setQAHistory(data.qaHistory || []);
        }
      } catch (err) {
        console.error("Failed to load data from server", err);
      }
    };
    loadData();
  }, []);

  // Sync with backend - Collection
  useEffect(() => {
    const saveData = async () => {
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'collection', data: savedExpressions })
        });
      } catch (err) {
        console.error("Failed to save collection", err);
      }
    };
    if (savedExpressions.length > 0) saveData();
  }, [savedExpressions]);

  // Sync with backend - Practices
  useEffect(() => {
    const saveData = async () => {
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'practices', data: savedPractices })
        });
      } catch (err) {
        console.error("Failed to save practices", err);
      }
    };
    if (savedPractices.length > 0) saveData();
  }, [savedPractices]);

  // Sync with backend - QA
  useEffect(() => {
    const saveData = async () => {
      try {
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'qa_history', data: qaHistory })
        });
      } catch (err) {
        console.error("Failed to save QA history", err);
      }
    };
    if (qaHistory.length > 0) saveData();
  }, [qaHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length === 0 || isLoading || activePractice) return;
      const topItem = results[results.length - 1];
      if (e.key === 'ArrowRight') handleAdopt(topItem);
      else if (e.key === 'ArrowLeft') handleReject(topItem.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, isLoading, activePractice]);

  const handleReset = async () => {
    if (window.confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        window.location.reload();
      } catch (err) {
        alert('데이터 초기화에 실패했습니다.');
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!scenario.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const expressions = await generateExpressions(scenario);
      setResults(expressions);
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      let errorMessage = err.message || 'AI로부터 답변을 가져오는 중 오류가 발생했습니다.';

      // Try to parse if it's a JSON string from the API
      try {
        if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
          const parsed = JSON.parse(errorMessage);
          if (parsed.error?.message) {
            errorMessage = parsed.error.message;
          }
        }
      } catch (e) {
        // Keep original if parsing fails
      }

      if (errorMessage.includes('API key not valid')) {
        errorMessage = 'API 키가 유효하지 않습니다. .env 파일에 올바른 GEMINI_API_KEY를 입력해주세요.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdopt = (expression: Expression) => {
    if (!savedExpressions.find(e => e.expression.toLowerCase() === expression.expression.toLowerCase())) {
      setSavedExpressions([expression, ...savedExpressions]);
    }
    setResults([]);
    startPractice(expression);
  };




  const handleReject = (id: string) => setResults(results.filter(r => r.id !== id));
  const removeSaved = (id: string) => setSavedExpressions(savedExpressions.filter(e => e.id !== id));
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const cleanTextForTTS = (text: string) => {
    // Strip both [Correction: ...] and [Feedback: ...] blocks for audio
    let cleaned = text.replace(/\[Correction:\s*["']?(.*?)["']?\]/gs, '');
    cleaned = cleaned.replace(/\[Feedback:\s*.*?\]/gs, '');
    return cleaned.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '').replace(/[*_~`#]/g, '').trim();
  };


  const playTTS = (text: string, messageId: string, role: 'assistant' | 'user' = 'assistant'): Promise<void> => {
    const cleanedText = cleanTextForTTS(text);
    if (!cleanedText || !synthRef.current) return Promise.resolve();
    synthRef.current.cancel();
    setIsPlayingAudio(messageId);

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const voices = window.speechSynthesis.getVoices();

      // Select distinct voices: typically AI = female-ish, User = male-ish or just different
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      if (role === 'assistant') {
        utterance.voice = englishVoices.find(v => v.name.includes('Google US English') || v.name.includes('Female') || v.name.includes('Samantha')) || englishVoices[0];
      } else {
        utterance.voice = englishVoices.find(v => v.name.includes('Male') || v.name.includes('Alex') || v.name.includes('Daniel')) || englishVoices[1] || englishVoices[0];
      }

      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => { setIsPlayingAudio(null); resolve(); };
      utterance.onerror = () => { setIsPlayingAudio(null); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  };


  const translateMessage = async (text: string, messageId: string, force?: boolean) => {
    if (translations[messageId] && !force) {
      const newTranslations = { ...translations };
      delete newTranslations[messageId];
      setTranslations(newTranslations);
      return;
    }
    setIsTranslating(messageId);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1beta' });




      const response = await model.generateContent(`Translate to natural Korean (output only translation): "${text}"`);
      const translation = response.response.text().trim();
      setTranslations(prev => ({ ...prev, [messageId]: translation }));
    } catch (err) {
      console.error('Translation Error:', err);
    } finally {
      setIsTranslating(null);
    }
  };

  const playAllMessages = async () => {
    if (isPlayingAll) {
      synthRef.current?.cancel();
      setIsPlayingAll(false);
      setIsPlayingAudio(null);
      return;
    }
    if (practiceMessages.length === 0) return;

    setIsPlayingAll(true);
    isPlayingAllRef.current = true; // Set explicitly before loop

    for (let i = 0; i < practiceMessages.length; i++) {
      if (!isPlayingAllRef.current) break;
      setPlaybackProgress(((i + 1) / practiceMessages.length) * 100);
      await playTTS(practiceMessages[i].content, `all-${i}`, practiceMessages[i].role);
      if (!isPlayingAllRef.current) break;
      await new Promise(r => setTimeout(r, 600)); // Slightly longer gap for natural feel
    }


    setIsPlayingAll(false);
    isPlayingAllRef.current = false;
    setPlaybackProgress(0);
  };

  const toggleAllTranslations = () => {

    const newMode = !isKoreanMode;
    setIsKoreanMode(newMode);
    if (newMode) {
      practiceMessages.forEach((msg, idx) => {
        if (!translations[idx]) translateMessage(msg.content, idx.toString(), true);
      });
    }
  };

  const startPractice = async (item: Expression) => {
    setActivePractice(item);
    setIsPracticeLoading(true);
    setPracticeMessages([]);
    try {
      const dialogue = await generateDialogue(item.expression, item.scenario || "");
      setPracticeMessages(dialogue.length > 0 ? dialogue : [{ role: 'assistant', content: `Hi! Let's practice "${item.expression}".` }]);
    } catch (err) {
      setPracticeMessages([{ role: 'assistant', content: `Hi! Let's practice "${item.expression}".` }]);
    } finally {
      setIsPracticeLoading(false);
    }
  };

  const handlePracticeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!practiceInput.trim() || isPracticeLoading || !activePractice) return;
    const userMsg = practiceInput.trim();
    setPracticeInput('');
    setPracticeMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsPracticeLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: PRACTICE_SYSTEM_PROMPT(activePractice.expression, activePractice.scenario || "")
      }, { apiVersion: 'v1beta' });




      const chat = model.startChat({
        history: practiceMessages
          .filter((_, i) => !(i === 0 && practiceMessages[i].role === 'assistant'))
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
      });

      const result = await chat.sendMessage(userMsg);
      const fullContent = result.response.text();

      // Extract [Feedback: ...] block (case-insensitive)
      const feedbackMatch = fullContent.match(/\[Feedback:\s*(.*?)\]/si);
      let dialogueContent = fullContent;

      if (feedbackMatch) {
        const feedbackText = feedbackMatch[1].trim();
        dialogueContent = fullContent.replace(/\[Feedback:\s*.*?\]/si, '').trim();


        // Persist feedback to QA History
        const feedbackMsg: QAMessage = {
          role: 'assistant',
          content: `💡 **학습 피드백** (상황: ${activePractice.scenario})\n\n${feedbackText}`,
          timestamp: Date.now()
        };
        setQAHistory(prev => [...prev, feedbackMsg]);
      }

      setPracticeMessages(prev => [...prev, { role: 'assistant', content: dialogueContent }]);

    } catch (err) {
      console.error('Practice Error:', err);
    } finally {
      setIsPracticeLoading(false);
    }
  };

  const savePracticeSession = () => {
    if (!activePractice || practiceMessages.length === 0) return;
    const newPrac: SavedPractice = {
      id: Date.now().toString(),
      expression: activePractice.expression,
      scenario: activePractice.scenario || scenario || '일상 대화',
      messages: [...practiceMessages],
      timestamp: Date.now()
    };
    setSavedPractices(prev => [newPrac, ...prev]);
    alert('대화 내용이 저장되었습니다.');
  };

  const handleQASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim() || isQALoading) return;
    const userMsg: QAMessage = { role: 'user', content: qaInput, timestamp: Date.now() };
    setQAHistory(prev => [...prev, userMsg]);
    setQAInput('');
    setIsQALoading(true);
    try {
      const answer = await answerQA(qaInput, qaContext);
      setQAHistory(prev => [...prev, { role: 'assistant', content: answer, timestamp: Date.now() }]);
    } catch (err) {
      console.error('QA Error:', err);
    } finally {
      setIsQALoading(false);
    }
  };

  const handleAskFromPractice = (practice: SavedPractice, question: string) => {
    const context = `[대화 맥락]\n상황: ${practice.scenario}\n표현: ${practice.expression}\n대화 내용:\n${practice.messages.map(m => `${m.role === 'user' ? '나' : '원어민'}: ${m.content}`).join('\n')}`;
    setQAContext(context);
    setActiveTab('qa');
    setQAInput(question);
    // Auto-submit would be nice, but let's let the user see the question filled first or just call it.
    // For simplicity, we just set the tab and context. We'll let the user hit send.
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedExpressionsCount={savedExpressions.length}
        savedPracticesCount={savedPractices.length}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView
              scenario={scenario} setScenario={setScenario} handleSubmit={handleSubmit}
              isLoading={isLoading} error={error} results={results}
              handleAdopt={handleAdopt} handleReject={handleReject}
              playTTS={playTTS} isPlayingAudio={isPlayingAudio}
            />
          )}
          {activeTab === 'practice_box' && (
            <PracticeBoxView
              savedExpressions={savedExpressions} isPlayingAudio={isPlayingAudio}
              playTTS={playTTS} copyToClipboard={copyToClipboard} removeSaved={removeSaved}
              startPractice={startPractice} setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'save_box' && (
            <SaveBoxView
              savedPractices={savedPractices} handleAskFromPractice={handleAskFromPractice}
              movePracticeUp={(id) => {
                const idx = savedPractices.findIndex(p => p.id === id);
                if (idx > 0) {
                  const newP = [...savedPractices];
                  [newP[idx - 1], newP[idx]] = [newP[idx], newP[idx - 1]];
                  setSavedPractices(newP);
                }
              }}
              movePracticeDown={(id) => {
                const idx = savedPractices.findIndex(p => p.id === id);
                if (idx < savedPractices.length - 1) {
                  const newP = [...savedPractices];
                  [newP[idx + 1], newP[idx]] = [newP[idx], newP[idx + 1]];
                  setSavedPractices(newP);
                }
              }}
              deletePractice={(id) => {
                if (confirm('삭제하시겠습니까?')) setSavedPractices(prev => prev.filter(p => p.id !== id));
              }}
            />
          )}
          {activeTab === 'qa' && (
            <QAView
              qaHistory={qaHistory} isQALoading={isQALoading}
              qaInput={qaInput} setQAInput={setQAInput} handleQASubmit={handleQASubmit}
              clearQAHistory={() => setQAHistory([])}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {activePractice && (
          <PracticeModal
            activePractice={activePractice} practiceMessages={practiceMessages}
            isPracticeLoading={isPracticeLoading} practiceInput={practiceInput}
            setPracticeInput={setPracticeInput} handlePracticeSubmit={handlePracticeSubmit}
            isPlayingAll={isPlayingAll} playbackProgress={playbackProgress}
            playAllMessages={playAllMessages} toggleAllTranslations={toggleAllTranslations}
            isKoreanMode={isKoreanMode} isTranslating={isTranslating}
            translations={translations} translateMessage={translateMessage}
            playTTS={playTTS} isPlayingAudio={isPlayingAudio}
            savePractice={savePracticeSession} closeModal={() => {
              synthRef.current?.cancel();
              setIsPlayingAll(false);
              setActivePractice(null);
            }}
            chatEndRef={chatEndRef}
          />
        )}
      </AnimatePresence>

      <Footer handleReset={handleReset} />
    </div>
  );
}
