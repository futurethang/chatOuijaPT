import React, { useEffect, useState } from 'react';
import styles from '../styles/LetterFade.module.css';

interface LetterFadeProps {
    text: string;
    delay: number;
    onAnimationEnd?: () => void;
}

interface LetterState {
    opacity: number;
    display: boolean;
}

const LetterFade: React.FC<LetterFadeProps> = ({ text = '', delay = 500, onAnimationEnd }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [lettersState, setLettersState] = useState<LetterState[]>(
        Array.from({ length: text.length }, () => ({
            opacity: 0,
            display: false,
        }))
    );

    useEffect(() => {
        setCurrentIndex(0);
        setLettersState(
            Array.from({ length: text.length }, () => ({
                opacity: 0,
                display: false,
            }))
        );
    }, [text]);

    useEffect(() => {
        if (currentIndex < text.length) {
            console.log('currentIndex', currentIndex);
            console.log(text[currentIndex]);
            const fadeInDuration = delay * 0.2;
            const fadeOutDuration = delay * 0.2;
            const stableDuration = delay - fadeInDuration - fadeOutDuration;

            const fadeIn = setTimeout(() => {
                setLettersState((prevState) => {
                    const newState = [...prevState];
                    if (!newState) {
                        debugger;
                    }
                    newState[currentIndex]!.opacity = 1;
                    newState[currentIndex]!.display = true;
                    return newState;
                });
            }, 0);

            const stable = setTimeout(() => {
                setLettersState((prevState) => {
                    const newState = [...prevState];
                    newState[currentIndex].opacity = 1;
                    return newState;
                });
            }, fadeInDuration);

            const fadeOut = setTimeout(() => {
                setLettersState((prevState) => {
                    const newState = [...prevState];
                    newState[currentIndex].opacity = 0;
                    return newState;
                });
            }, fadeInDuration + stableDuration);

            const nextLetter = setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, delay);

            return () => {
                clearTimeout(fadeIn);
                clearTimeout(stable);
                clearTimeout(fadeOut);
                clearTimeout(nextLetter);
            };
        } else {
            if (onAnimationEnd) {
                onAnimationEnd();
            }
        }
    }, [currentIndex, text, delay]);

    return (
        <div>
            {text.split('').map((letter, index) => (
                <span
                    key={index}
                    className={styles.letter}
                    style={{
                        opacity: lettersState[index]?.opacity ?? 0,
                        visibility: lettersState[index]?.display ? 'visible' : 'hidden',
                    }}
                >
                    {letter}
                </span>
            ))}
        </div>
    );
};

export default LetterFade;
