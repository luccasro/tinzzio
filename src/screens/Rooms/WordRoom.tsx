import {
  Box,
  Button,
  Text,
  ScrollView,
  Flex,
  Spinner,
  Heading,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { db } from 'services';
import { Trans } from 'react-i18next';
import { getMediaQuery } from '../../styles';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

export const WordRoom = () => {
  const navigation: NavigationProp<ParamListBase> = useNavigation();

  interface Word {
    word: string;
    color?: string;
    type?: 'correct' | 'present' | 'absent';
  }

  const isFocused = useIsFocused();
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const defaultWords = [
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
  ];
  const defaultWords1 = [
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
  ];
  const defaultWords2 = [
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
  ];
  const defaultWords3 = [
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
  ];
  const defaultWords4 = [
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
  ];
  const defaultWords5 = [
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
    { word: '' },
  ];

  const [words, setWords] = useState<Word[][]>([
    defaultWords,
    defaultWords1,
    defaultWords2,
    defaultWords3,
    defaultWords4,
    defaultWords5,
  ]);
  const [isFinished, setFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);
  const [userCorrectPos, setUserCorrectPos] = useState<number | undefined>(
    undefined,
  );
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string[] | undefined>(
    undefined,
  );

  useEffect(() => {
    loadWord();
  }, [isFocused]);

  const isSmallMedium = getMediaQuery('isSmallMedium');

  const correctColor = '#3AA394';
  const presentColor = '#D3AD69';
  const absentColor = '#312A2C';

  const loadWord = async () => {
    const docRef = doc(db, 'word', 'word');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setCurrentWord(docSnap.data().word);
    } else {
      navigation.navigate('Home');
    }
  };

  const submitWord = () => {
    if (currentWord) {
      if (words[posY].some((it) => it.word === '')) {
        alert('Preencha os campos!');
      } else {
        const wordsValues = [...[...words]];
        const letters = [...usedLetters];

        let isPresent = false;
        const checkLetters = () => {
          for (let i = 0; i < 5; i++) {
            isPresent = false;
            if (wordsValues[posY][i].word.toLowerCase() === currentWord[i]) {
              wordsValues[posY][i].color = correctColor;
              wordsValues[posY][i].type = 'correct';
              if (!letters.includes(wordsValues[posY][i].word.toLowerCase())) {
                letters.push(wordsValues[posY][i].word.toLowerCase());
              }
              continue;
            }

            for (let j = 0; j < 5; j++) {
              if (
                wordsValues[posY][i].word.toLowerCase() === currentWord[j] &&
                wordsValues[posY][j].color !== '#3AA394'
              ) {
                wordsValues[posY][i].color = presentColor;
                wordsValues[posY][i].type = 'present';
                if (
                  !letters.includes(wordsValues[posY][i].word.toLowerCase())
                ) {
                  letters.push(wordsValues[posY][i].word.toLowerCase());
                }
                isPresent = true;
                break;
              }
            }

            if (isPresent == false) {
              wordsValues[posY][i].color = absentColor;
              wordsValues[posY][i].type = 'absent';
              if (!letters.includes(wordsValues[posY][i].word.toLowerCase())) {
                letters.push(wordsValues[posY][i].word.toLowerCase());
              }
            }
          }
        };
        checkLetters();
        setUsedLetters(letters);

        //if is all correct
        if (
          wordsValues[posY]
            .map(
              (it, index) =>
                it.word.toLowerCase() === currentWord[index].toLowerCase(),
            )
            .every((e) => e === true)
        ) {
          setFinished(true);
          setUserCorrectPos(posY + 1);
          setIsCorrect(true);
        }

        if (posY < 5) {
          setPosY(posY + 1);
          setPosX(0);
        } else {
          setFinished(true);
        }
      }
    }
  };
  const onChangeWord = (
    index: number,
    index2: number,
    text: string,
    force?: boolean,
  ) => {
    if (posX !== 5 || force) {
      const values = [...[...words]];
      values[index][index2].word = text;
      setWords(values);
    }
  };

  const Key = (props: any) => {
    const keyVal = props.value.toLowerCase();

    const setKey = () => {
      if (props.value.toLowerCase() === 'enter') {
        submitWord();
      } else if (props.value.toLowerCase() === 'delete') {
        if (posX !== 0) {
          if (posX === 5) {
            onChangeWord(posY, 4, '', true);
            setPosX(posX - 1);
          } else {
            onChangeWord(posY, posX - 1, '');
            setPosX(posX - 1);
          }
        }
      } else {
        onChangeWord(posY, posX, props.value.toLowerCase());
        if (posX <= 3) {
          setPosX(posX + 1);
        }
      }
    };

    const getKeyBg = () => {
      if (usedLetters.some((it) => it === props.value.toLowerCase())) {
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            if (words[i][j].word.toLowerCase() === keyVal) {
              if (words[i][j].type === 'correct') {
                return correctColor;
              } else if (words[i][j].type === 'present') {
                return presentColor;
              } else if (words[i][j].type === 'absent') {
                return absentColor;
              }
            }
          }
        }
      }
    };

    return (
      <Button
        mr={2}
        width={
          keyVal === 'enter' || keyVal === 'delete'
            ? undefined
            : isSmallMedium
            ? '28px'
            : '57'
        }
        height={isSmallMedium ? '40px' : '70'}
        borderRadius={5}
        style={{ backgroundColor: getKeyBg() ?? '#4c4347' }}
        onPress={() => setKey()}
        px={[2, 4]}
        py={2}
        variant="unstyled"
      >
        {keyVal !== 'delete' ? (
          <Text selectable={false} fontSize={[16, 30]} bold color="white">
            {props.value}
          </Text>
        ) : (
          <Feather
            selectable={false}
            name="delete"
            size={isSmallMedium ? 12 : 30}
            color="white"
          />
        )}
      </Button>
    );
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'DELETE'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'],
  ];

  const changeActivePos = (pos: number) => {
    setPosX(pos);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: isSmallMedium ? undefined : 'center',
        backgroundColor: '#6E5C62',
      }}
    >
      {currentWord ? (
        !isFinished ? (
          <>
            <Heading color="white" style={{ textAlign: 'center' }} mb={10}>
              Word Beat
            </Heading>
            {words.map((val, index) => (
              <Flex
                flexDirection="row"
                justifyContent="center"
                key={'e' + index}
              >
                {val.map((val2, index2) => (
                  <Button
                    p={0}
                    variant={'unstyled'}
                    mr={3}
                    key={index2}
                    mb={4}
                    disabled={posY !== index}
                    onPress={() => posY === index && changeActivePos(index2)}
                  >
                    <Box
                      style={{
                        borderRadius: 5,
                        borderColor:
                          words[index][index2].color ??
                          (posY !== index
                            ? '#615458'
                            : posY === index && posX === index2
                            ? '#332d30'
                            : '#4C4347'),
                        borderWidth: 5,
                        backgroundColor:
                          words[index][index2].color ??
                          (posY !== index ? '#615458' : '#6E5C62'),
                      }}
                      w={['50px', '75px']}
                      h={['50px', '75px']}
                    >
                      <Text
                        m="auto"
                        pt={1}
                        color={'white'}
                        bold
                        style={{
                          textTransform: 'uppercase',
                          fontSize: isSmallMedium ? 15 : 40,
                          textAlign: 'center',
                        }}
                      >
                        {words[index][index2].word}
                      </Text>
                    </Box>
                  </Button>
                ))}
              </Flex>
            ))}

            {/* KEYBOARD */}
            {keyboardRows.map((row, rowIndex) => (
              <Flex
                key={`row-${rowIndex}`}
                flexDirection="row"
                justifyContent="center"
                mb={4}
              >
                {row.map((key) => (
                  <Key key={key} value={key} />
                ))}
              </Flex>
            ))}
          </>
        ) : isCorrect ? (
          <Text bold color={correctColor} fontSize={30}>
            Você acertou na tentativa {userCorrectPos}
          </Text>
        ) : (
          <Text bold color="red.700" fontSize={30}>
            Você não acertou, a palavra certa era {currentWord.map((it) => it)}
          </Text>
        )
      ) : (
        <Spinner size="lg" />
      )}
    </ScrollView>
  );
};
