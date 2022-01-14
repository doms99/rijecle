import React, { FC, useCallback, useEffect, useState } from 'react';
import './App.css';
import Keyboard from './Keyboard';
import { styles } from './Style';
import { sveHrvRijeci } from './sveHrvRijeci';
import { sveHvrImenice } from './sveHvrImenice';

const isAlpha = (ch: string): boolean => {
  if (ch === 'lj') return true;
  if (ch === 'nj') return true;
  return /^[A-ZŠĐŽČĆ]$/i.test(ch);
}

export const GREEN = '#6ff573';
export const YELLOW = '#f8f86c';
export const GREY = '#aaa';



function stringToHash(string: string): number {

  let hash = 0;

  if (string.length === 0) return hash;

  for (let i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash;
}


const splitCroatianWord = (word: string): string[] => {
  let englSplit = word.split('');
  let croSplit = [];
  let i = 0;
  while (i < englSplit.length) {
    if (englSplit[i] === 'l' && englSplit[i + 1] === 'j') {
      croSplit.push('lj');
      i += 2;
      continue;
    }
    if (englSplit[i] === 'n' && englSplit[i + 1] === 'j') {
      croSplit.push('nj');
      i += 2;
      continue;
    }
    croSplit.push(englSplit[i]);
    i++;
  }
  return croSplit;
}

function App() {



  const [word, setWord] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>(['white', 'white', 'white', 'white', 'white']);
  const [previousWords, setPreviousWords] = useState<{ word: string[], colors: string[] }[]>([]);
  const [correct, setCorrect] = useState<string[]>([]);
  const [incorrect, setIncorrect] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [randomMode, setRandomMode] = useState<boolean>(false);
  // const wordOfTheDay = ['š', 'k', 'o', 'l', 'a'];
  const [wordOfTheDay, setWordOfTheDay] = useState<string[]>([]);
  useEffect(() => {
    let todaysIndex = 0;
    if (randomMode) {
      todaysIndex = Math.floor(Math.random() * sveHvrImenice.length);
    } else {
      let yourDate = new Date()
      todaysIndex = stringToHash(yourDate.toISOString().split('T')[0])
    }
    let w = sveHvrImenice[todaysIndex % sveHvrImenice.length];
    setWordOfTheDay(splitCroatianWord(w.toLowerCase()));
  }, [randomMode]);

  // useEffect(() => {
  //   if (previousWords.length > 5) {
  //     alert('Ostali ste bez pokušaja, rijec je bila: ' + wordOfTheDay.join(''));
  //   }
  // }, [previousWords]);





  const getWiktionary = useCallback((): boolean => {
    // return fetch(`https://hr.wiktionary.org/w/api.php?action=query&titles=${word.join("")}&prop=revisions&rvprop=content&format=json&origin=*`)
    //   .then(
    //     (response) =>
    //       response.json()
    //   ).then((data) => {
    //     let pages = data.query.pages;
    //     let firstKey = Object.keys(pages)[0];
    //     if (firstKey === '-1') return false;
    //     try {
    //       return data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]['*'].includes("{{hrvatski jezik}}");
    //     } catch (e) {
    //       return false;
    //     }
    //   }).catch((error) => {
    //     console.log(error);
    //     return false;
    //   })
    return sveHrvRijeci.map(r => r.toLowerCase()).includes(word.join(""))

  }, [word]);

  const checkWord = () => {
    let isWord = getWiktionary();
    if (!isWord) {
      alert('Nije u popisu riječi.');
      return;
    }
    let newColors = colors;
    let newCorrect = new Set<string>();
    let newIncorrect = new Set(word);
    if (word.join('') === wordOfTheDay.join('')) {
      console.log('Pobijedili ste');
      setShowPopup(true);
      setColors([GREEN, GREEN, GREEN, GREEN, GREEN]);
      return;
    } else {

      let target = [...wordOfTheDay];

      const guessed = []

      newColors = [GREY, GREY, GREY, GREY, GREY];
      for (let i = 0; i < word.length; i++) {
        if (word[i] === target[i]) {
          guessed.push(i);
          newColors[i] = GREEN;
          target[i] = '_';
          newCorrect.add(word[i]);
          newIncorrect.delete(word[i]);
        }

      }
      for (let i = 0; i < word.length; i++) {
        if (guessed.indexOf(i) !== -1) continue;
        if (target.includes(word[i])) {
          newColors[i] = YELLOW;
          target[target.indexOf(word[i])] = '_';
          newCorrect.add(word[i]);
          newIncorrect.delete(word[i]);
        }
      }


    }
    if (previousWords.length >= 5) {
      alert('Ostali ste bez pokušaja, rijec je bila: ' + wordOfTheDay.join(''));
      return;
    }
    setCorrect(Array.from(new Set([...Array.from(newCorrect), ...correct])));
    setIncorrect(Array.from(new Set([...Array.from(newIncorrect), ...incorrect])));
    setPreviousWords([...previousWords, { word: word, colors: newColors }]);
    setColors(['white', 'white', 'white', 'white', 'white']);
    setWord([]);

  }

  const acceptLetter = useCallback((key: string) => {
    if (key === 'Backspace') {
      setWord(word.slice(0, -1));
    }
    if (key === 'Enter') {
      word.length === 5 && checkWord();
    }
    else if (isAlpha(key)) {
      if (word.length < 5) {
        setWord([...word, key]);
      }
    }
  }, [word]); // eslint-disable-line



  const getKeyFromPhisycalKeyboard = useCallback(
    (e: KeyboardEvent) => {
      acceptLetter(e.key);
    }, [acceptLetter])

  useEffect(() => {
    document.addEventListener('keydown', getKeyFromPhisycalKeyboard);
    return () => {
      document.removeEventListener('keydown', getKeyFromPhisycalKeyboard);
    }

  }, [word, getKeyFromPhisycalKeyboard])

  return (
    <div className="App" style={styles.app}>
      <div
        style={styles.betaBanner}
      ></div>
      <div
        style={styles.betaText}
      >BETA</div>
      <div
        style={styles.randomSwitch}
        onClick={() => setRandomMode(!randomMode)}
      >
        <span
          style={!randomMode ? { textDecoration: 'underline' } : { color: "#666" }}
        >ranked
        </span> | <span
          style={randomMode ? { textDecoration: 'underline' } : { color: "#666" }}
        >random
        </span>
      </div>
      {showPopup &&
        <BravoPopup wordOfTheDay={wordOfTheDay.join("")} guesses={previousWords.map(p => p.word.join(""))} />
      }
      <h1>Rijecle</h1>
      <div
        style={styles.guessesWrapper}
      >
        {previousWords.map((guess, index) => (
          <Guesses word={guess.word} colors={guess.colors} key={index.toString()} />
        ))}
        <Guesses word={word} colors={colors} />
      </div>
      <div
        style={styles.keyboardContainer}
      >
        <Keyboard correct={correct} incorrect={incorrect} sendKeyPress={(key) => acceptLetter(key)} />
      </div>
    </div >
  );
}

export default App;


const Guesses: FC<{ word: string[], colors: string[] }> = ({ word, colors }) => {

  return (
    <div
      style={styles.wrapper}
    >
      <div
        style={{
          ...styles.container,
          backgroundColor: colors[0]
        }}
      >
        {word[0]}
      </div>
      <div
        style={{
          ...styles.container,
          backgroundColor: colors[1]
        }}
      >
        {word[1]}
      </div>
      <div
        style={{
          ...styles.container,
          backgroundColor: colors[2]
        }}
      >
        {word[2]}
      </div>
      <div
        style={{
          ...styles.container,
          backgroundColor: colors[3]
        }}
      >
        {word[3]}
      </div>
      <div
        style={{
          ...styles.container,
          backgroundColor: colors[4]
        }}
      >
        {word[4]}
      </div>
    </div>
  )
}



const BravoPopup: FC<{ wordOfTheDay: string, guesses: string[] }> = ({ wordOfTheDay, guesses }) => {


  return (
    <div
      style={styles.bravoPopup}
    >
      <h1>Bravo!</h1>
      <h3>Rijec dana:</h3>
      <h1>{wordOfTheDay}</h1>
      <h3>Pokusaji: <strong>{guesses.length + 1}/6</strong></h3>

    </div>
  )
}